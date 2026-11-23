import { domainOf, type Engine, type EngineAnswer, type Source } from "./types";
import { locationContext } from "./locale";

/**
 * Cliente mínimo de la AI Optimization API de DataForSEO.
 * Docs: https://docs.dataforseo.com/v3/ai_optimization/overview/
 *
 * - ChatGPT: LLM Scraper (respuesta tal como la ve un usuario en chatgpt.com, con fuentes).
 * - Claude / Gemini / Perplexity: LLM Responses (API del modelo con búsqueda web activada).
 */

// Códigos de ubicación de DataForSEO (Google Ads geo targets) para el LLM Scraper.
const LOCATION_CODE: Record<string, number> = {
  PE: 2604, US: 2840, MX: 2484, ES: 2724, AR: 2032, CO: 2170, CL: 2152, EC: 2218, BR: 2076,
};

// Países que acepta web_search_country_iso_code en Claude (según docs).
const CLAUDE_COUNTRIES = new Set(
  "AR AT AU BE BR CA CH CL CN DE DK ES FI FR GB HK ID IN IT JP KR MX MY NL NO NZ PH PL PT RU SA SE TR TW US ZA".split(" "),
);

export function hasCredentials() {
  return Boolean(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}

export function isSandbox() {
  return process.env.DATAFORSEO_SANDBOX === "true";
}

function baseUrl() {
  return isSandbox() ? "https://sandbox.dataforseo.com/v3" : "https://api.dataforseo.com/v3";
}

type TaskEnvelope = {
  status_code: number;
  status_message: string;
  cost?: number;
  tasks?: Array<{
    status_code: number;
    status_message: string;
    cost?: number;
    result?: Array<Record<string, unknown>> | null;
  }>;
};

export class DataForSeoError extends Error {}

async function call(path: string, body?: unknown, method: "POST" | "GET" = "POST") {
  if (!hasCredentials()) throw new DataForSeoError("Faltan DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD en .env");
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString("base64");
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(150_000),
  });
  if (!res.ok) throw new DataForSeoError(`HTTP ${res.status} en ${path}`);
  const json = (await res.json()) as TaskEnvelope;
  if (json.status_code !== 20000) throw new DataForSeoError(`${json.status_code}: ${json.status_message}`);
  const task = json.tasks?.[0];
  if (!task) throw new DataForSeoError("Respuesta sin tareas");
  if (task.status_code !== 20000) throw new DataForSeoError(`${task.status_code}: ${task.status_message}`);
  return { result: task.result?.[0] ?? {}, results: task.result ?? [], cost: task.cost ?? json.cost ?? 0 };
}

type Annotation = { title?: string | null; url?: string | null; direct_url?: string | null };
type Section = { type?: string; text?: string | null; annotations?: Annotation[] | null };
type Item = { type?: string; sections?: Section[] | null };

/** Extrae texto y fuentes del formato LLM Responses: items[type=message].sections[]. */
function parseLlmResponse(result: Record<string, unknown>) {
  const items = (result.items as Item[] | undefined) ?? [];
  const parts: string[] = [];
  const sources: Source[] = [];
  for (const item of items) {
    if (item.type && item.type !== "message") continue;
    for (const s of item.sections ?? []) {
      if (s.text) parts.push(s.text);
      for (const a of s.annotations ?? []) {
        const url = a.direct_url || a.url;
        if (url) sources.push({ title: a.title ?? "", url, domain: domainOf(url) });
      }
    }
  }
  return { text: parts.join(""), sources: dedupe(sources), model: String(result.model_name ?? "") };
}

function dedupe(sources: Source[]) {
  const seen = new Set<string>();
  return sources.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
}

const MODEL: Record<Exclude<Engine, "chatgpt">, () => string> = {
  claude: () => process.env.MODEL_CLAUDE || "claude-haiku-5-5",
  gemini: () => process.env.MODEL_GEMINI || "gemini-3.8-flash",
  perplexity: () => process.env.MODEL_PERPLEXITY || "sonar",
};

export async function askEngine(
  engine: Engine,
  prompt: string,
  opts: { country: string; language: string },
): Promise<EngineAnswer> {
  const country = opts.country.toUpperCase();

  if (engine === "chatgpt") {
    const { result, cost } = await call("/ai_optimization/chat_gpt/llm_scraper/live/advanced", [
      {
        keyword: prompt.replace(/%/g, "%25").replace(/\+/g, "%2B"),
        location_code: LOCATION_CODE[country] ?? LOCATION_CODE.US,
        language_code: opts.language,
        force_web_search: true,
      },
    ]);
    const raw = (result.sources as Array<{ title?: string; url?: string; domain?: string }> | undefined) ?? [];
    return {
      engine,
      model: String(result.model ?? "chatgpt"),
      text: String(result.markdown ?? ""),
      sources: dedupe(raw.filter((s) => s.url).map((s) => ({ title: s.title ?? "", url: s.url!, domain: (s.domain || domainOf(s.url!)).replace(/^www\./, "") }))),
      costUsd: cost,
    };
  }

  const task: Record<string, unknown> = {
    user_prompt: prompt.slice(0, 500),
    model_name: MODEL[engine](),
    max_output_tokens: 1500,
  };
  // Contexto de país e idioma: simula a un usuario en el país del proyecto (ChatGPT ya va localizado por ubicación)
  const context = locationContext(country, opts.language);
  if (context) task.system_message = context.slice(0, 500);
  if (engine === "claude") {
    task.web_search = true;
    if (CLAUDE_COUNTRIES.has(country)) task.web_search_country_iso_code = country;
  } else if (engine === "gemini") {
    task.web_search = true;
  } else if (engine === "perplexity") {
    task.web_search_country_iso_code = country;
  }
  const { result, cost } = await call(`/ai_optimization/${engine}/llm_responses/live`, [task]);
  const parsed = parseLlmResponse(result);
  return { engine, model: parsed.model || String(task.model_name), text: parsed.text, sources: parsed.sources, costUsd: cost };
}

/** Lista los modelos disponibles para un motor (gratis). */
export async function listModels(engine: Exclude<Engine, "chatgpt">) {
  const { results } = await call(`/ai_optimization/${engine}/llm_responses/models`, undefined, "GET");
  return results as Array<{ model_name: string; web_search_supported?: boolean; reasoning?: boolean }>;
}

/** Ubicación de DataForSEO para un país del proyecto (por defecto, Estados Unidos). */
export const locationCodeFor = (country: string) => LOCATION_CODE[country.toUpperCase()] ?? LOCATION_CODE.US;

export type SearchedQuestion = { phrase: string; volume: number };

/**
 * Preguntas reales sobre un tema, con volumen de búsqueda mensual (LLM Mentions, Google AI Overviews).
 * En Latinoamérica solo hay datos de Google AI Overviews (ChatGPT solo en EE. UU./inglés).
 * Costo: $0.10 por consulta + $0.001 por fila.
 */
export async function searchQuestions(topic: string, opts: { country: string; language: string; limit?: number }) {
  const { result, cost } = await call("/ai_optimization/llm_mentions/search_mentions/live", [
    {
      target: [{ keyword: topic.slice(0, 250), search_scope: ["question"] }],
      location_code: locationCodeFor(opts.country),
      language_code: opts.language,
      platform: "google",
      order_by: ["ai_search_volume,desc"],
      limit: opts.limit ?? 40,
    },
  ]);
  const items = (result.items as Array<{ question?: string; ai_search_volume?: number | null }> | undefined) ?? [];
  const seen = new Set<string>();
  const questions: SearchedQuestion[] = [];
  for (const it of items) {
    const phrase = (it.question ?? "").trim();
    if (!phrase || seen.has(phrase.toLowerCase())) continue;
    seen.add(phrase.toLowerCase());
    questions.push({ phrase, volume: it.ai_search_volume ?? 0 });
  }
  return { questions, cost };
}

/** Pregunta simple a Claude (sin búsqueda web) vía DataForSEO; se usa para redactar sugerencias. */
export async function askClaudePlain(prompt: string, system?: string) {
  const task: Record<string, unknown> = { user_prompt: prompt.slice(0, 500), model_name: MODEL.claude(), max_output_tokens: 600 };
  if (system) task.system_message = system.slice(0, 500);
  const { result, cost } = await call("/ai_optimization/claude/llm_responses/live", [task]);
  return { text: parseLlmResponse(result).text, cost };
}
