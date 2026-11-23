import "server-only";
import { db } from "./db";
import { askClaudePlain, hasCredentials, searchQuestions, type SearchedQuestion } from "./dataforseo";
import { COUNTRIES, countryName } from "./locale";
import { monthlyBudget } from "./limits";

/**
 * "Sugerir prompts": busca preguntas reales sobre hasta 3 productos o categorías (DataForSEO LLM Mentions,
 * con volumen de búsqueda), quita las que nombran marcas, junta variantes y las redacta como preguntas
 * naturales con Claude. Hasta 5 sugerencias por tema.
 */
export type PromptSuggestion = { text: string; volume: number; phrases: string[] };
export type TopicSuggestions = { topic: string; suggestions: PromptSuggestion[]; cached: boolean; error?: string };

const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);
const MONTH_MS = 30 * 86400_000;
export const MAX_TOPICS = 3;
export const MAX_PER_TOPIC = 5;
const SEARCH_ROWS = 60; // $0.10 + $0.001 por fila
const MAX_BATCHES = 3; // llamadas a Claude en paralelo (cada mensaje admite 500 caracteres)

/** Minúsculas y sin tildes, para comparar variantes ("garantia" = "garantía"). */
export const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[¿?¡!.,]/g, "").replace(/\s+/g, " ").trim();

/** "tarjeta de crédito, Préstamos ,tarjeta de credito" → ["tarjeta de crédito", "Préstamos"] (máx. 3). */
export function parseTopics(raw: string) {
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const t = part.replace(/\s+/g, " ").trim().slice(0, 80);
    if (t.length >= 3 && !out.some((o) => fold(o) === fold(t))) out.push(t);
  }
  return out.slice(0, MAX_TOPICS);
}

/** Una línea válida es una pregunta real (no una explicación como "Descarta: …"). */
export const isQuestion = (t: string) => /\?\s*$/.test(t) && !/^(descart|exclu|omit|ningun|nota)/i.test(fold(t));

// Nombres propios permitidos en una sugerencia (lugares e instituciones, no marcas que compitan)
const ALLOWED_PROPER = new Set(
  [
    ...COUNTRIES.flatMap((c) => [c.name, c.nameEn, c.namePt]),
    "Lima", "Latinoamérica", "América", "Google", "ChatGPT", "IA",
    "SBS", "SUNAT", "RENIEC", "INDECOPI", "BCRP", "SMV", "DNI", "RUC", "AFP", "ONP", "SOAT", "IGV", "TEA", "TCEA", "UIT", "SAT", "CURP", "RFC", "IVA", "NIT", "DIAN",
  ].map(fold).flatMap((n) => n.split(" ")),
);

/** ¿Nombra una marca? Heurística: una palabra con mayúscula a mitad de frase que no es un lugar o institución conocida. */
export function namesBrand(question: string) {
  const words = question.replace(/[¿?¡!.,;:()"“”]/g, " ").split(/\s+/).filter(Boolean);
  return words.slice(1).some((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w) && !ALLOWED_PROPER.has(fold(w)));
}

/** Clave para detectar sugerencias casi iguales: las primeras 6 palabras ("¿Cómo funciona una tarjeta de crédito en Perú y…"). */
const opening = (t: string) => fold(t).split(" ").slice(0, 6).join(" ");

/** Búsquedas por usuario cada 30 días (cada tema nuevo cuenta una; el admin no tiene límite). */
export async function suggestionQuota(user: { id: string; role: string }) {
  if (user.role === "admin") return { limit: Infinity, used: 0, left: Infinity };
  const limit = num(process.env.FREE_SUGGESTIONS_PER_MONTH, 3);
  const used = await db.suggestion.count({ where: { userId: user.id, cached: false, createdAt: { gte: new Date(Date.now() - MONTH_MS) } } });
  return { limit, used, left: Math.max(0, limit - used) };
}

/** Para el formulario: búsquedas que le quedan (null = sin límite; undefined = función no disponible). */
export async function suggestLeftFor(user: { id: string; role: string } | null): Promise<number | null | undefined> {
  if (!user || !hasCredentials()) return undefined;
  const q = await suggestionQuota(user);
  return Number.isFinite(q.left) ? q.left : null;
}

/** Quita las frases que nombran marcas seguidas y junta variantes (se queda con la de mayor volumen). */
export function prefilter(questions: SearchedQuestion[], brands: string[]) {
  const banned = brands.map(fold).filter((b) => b.length >= 2);
  const groups = new Map<string, SearchedQuestion[]>();
  for (const q of questions) {
    const f = fold(q.phrase);
    if (banned.some((b) => new RegExp(`(^|\\s)${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`).test(f))) continue;
    const key = f.split(" ").sort().join(" "); // "tarjetas de credito solicitar" = "solicitar tarjetas de credito"
    groups.set(key, [...(groups.get(key) ?? []), q]);
  }
  return [...groups.values()]
    .map((g) => ({ phrase: g.sort((a, b) => b.volume - a.volume)[0].phrase, volume: Math.max(...g.map((x) => x.volume)), phrases: g.map((x) => x.phrase) }))
    .sort((a, b) => b.volume - a.volume);
}
type Candidate = ReturnType<typeof prefilter>[number];

/** Lee la respuesta de Claude: una línea por sugerencia, "números|pregunta". */
export function parseRewrite(text: string, candidates: Candidate[]): PromptSuggestion[] {
  const out: PromptSuggestion[] = [];
  const used = new Set<number>();
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([\d,\s]+)\|\s*(.+?)\s*$/);
    if (!m) continue;
    const question = m[2].replace(/^["“]|["”]$/g, "").slice(0, 300);
    if (!isQuestion(question) || namesBrand(question)) continue;
    // Cada frase cuenta en una sola sugerencia (la primera que la usa); máx. 4 variantes por sugerencia
    const idx = [...new Set(m[1].split(",").map((n) => Number(n.trim()) - 1))].filter((i) => candidates[i] && !used.has(i)).slice(0, 4);
    if (!idx.length || question.length < 8 || out.some((o) => fold(o.text) === fold(question))) continue;
    idx.forEach((i) => used.add(i));
    out.push({
      text: question,
      volume: Math.max(...idx.map((i) => candidates[i].volume)), // variantes: se toma la mayor, no la suma
      phrases: idx.flatMap((i) => candidates[i].phrases),
    });
  }
  return out;
}

/** Junta sugerencias de varios lotes: sin repetidas, de mayor a menor volumen, máx. 5. */
export function mergeSuggestions(lists: PromptSuggestion[][]) {
  const out: PromptSuggestion[] = [];
  for (const s of lists.flat().sort((a, b) => b.volume - a.volume)) {
    if (!out.some((o) => fold(o.text) === fold(s.text) || opening(o.text) === opening(s.text))) out.push(s);
  }
  return out.slice(0, MAX_PER_TOPIC);
}

/** Lotes de frases que caben en 500 caracteres cada uno (numeración propia por lote). */
export function batches(candidates: Candidate[], header: string) {
  const out: { prompt: string; items: Candidate[] }[] = [];
  let current = { prompt: header, items: [] as Candidate[] };
  for (const c of candidates) {
    const line = `\n${current.items.length + 1}. ${c.phrase}`;
    if (current.prompt.length + line.length > 500) {
      if (current.items.length) out.push(current);
      if (out.length >= MAX_BATCHES) return out;
      current = { prompt: header, items: [] };
    }
    current.prompt += `\n${current.items.length + 1}. ${c.phrase}`;
    current.items.push(c);
  }
  if (current.items.length && out.length < MAX_BATCHES) out.push(current);
  return out;
}

/** Búsqueda nueva de un tema: DataForSEO + Claude. Devuelve sugerencias y costo. */
async function freshSuggestions(topic: string, country: string, language: string, brands: string[]) {
  let cost = 0;
  const searched = await searchQuestions(topic, { country, language, limit: SEARCH_ROWS });
  cost += searched.cost;
  const candidates = prefilter(searched.questions, brands);
  const place = countryName(country);
  const system =
    `Conviertes búsquedas de Google en preguntas que una persona de ${place} le haría a ChatGPT. ` +
    `Ignora en silencio las búsquedas que nombran una empresa, banco, tienda o marca. Cada línea es una intención distinta; ` +
    `junta solo variantes casi idénticas y usa cada número una vez. Responde solo líneas números|pregunta ` +
    `(máximo ${MAX_PER_TOPIC}), sin comentarios. Ejemplo: 3,7|¿Qué requisitos piden para un préstamo personal en ${place}?`;
  const parts = batches(candidates, `Idioma: ${language}. Búsquedas:`);
  const answers = await Promise.allSettled(parts.map((b) => askClaudePlain(b.prompt, system)));
  const lists: PromptSuggestion[][] = [];
  answers.forEach((a, i) => {
    if (a.status !== "fulfilled") return console.error("[menciones] sugerencias (Claude):", a.reason);
    cost += a.value.cost;
    lists.push(parseRewrite(a.value.text, parts[i].items));
  });
  if (parts.length && answers.every((a) => a.status === "rejected")) throw Object.assign(new Error("Claude no respondió"), { cost });
  return { suggestions: mergeSuggestions(lists), cost };
}

/** left: búsquedas que le quedan (null = sin límite). */
type Result = { ok: true; groups: TopicSuggestions[]; left: number | null } | { ok: false; error: string };

export async function suggestPrompts(
  user: { id: string; role: string },
  input: { topics: string; country: string; language: string; brands: string[] },
): Promise<Result> {
  const topics = parseTopics(input.topics);
  if (!topics.length) return { ok: false, error: "Escribe al menos un producto o categoría (3 letras o más), por ejemplo “tarjeta de crédito”." };
  const country = input.country.toUpperCase();
  const language = input.language.toLowerCase();
  const banned = input.brands.map(fold).filter((b) => b.length >= 2);
  const quota = await suggestionQuota(user);
  let left = quota.left;

  // Mismo tema, país e idioma en los últimos 30 días: se reutiliza (gratis y sin consumir cupo)
  const since = new Date(Date.now() - MONTH_MS);
  const plan = await Promise.all(
    topics.map(async (topic) => {
      const key = fold(topic);
      const previous = await db.suggestion.findMany({
        where: { topic: key, country, language, cached: false, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
      const reused = previous[0]
        ? (JSON.parse(previous[0].results) as PromptSuggestion[])
            .filter((s) => isQuestion(s.text) && !namesBrand(s.text))
            .filter((s) => !s.phrases.some((p) => banned.some((b) => fold(p).includes(b))))
        : [];
      const clean = mergeSuggestions([reused]);
      return { topic, key, reused: clean.length >= 3 ? clean : null };
    }),
  );

  const needsSearch = plan.filter((p) => !p.reused);
  if (needsSearch.length && user.role !== "admin" && (await monthlyBudget()).exhausted) {
    return { ok: false, error: "Alcanzamos el límite de consultas de este mes. Vuelve a intentarlo el próximo mes." };
  }

  const groups = await Promise.all(
    plan.map(async ({ topic, key, reused }): Promise<TopicSuggestions> => {
      if (reused) {
        await db.suggestion.create({ data: { userId: user.id, topic: key, country, language, results: JSON.stringify(reused), cached: true } });
        return { topic, suggestions: reused, cached: true };
      }
      if (left <= 0) return { topic, suggestions: [], cached: false, error: `Ya usaste tus ${quota.limit} búsquedas de los últimos 30 días.` };
      left -= 1; // se reserva antes de buscar (las búsquedas van en paralelo)
      try {
        const { suggestions, cost } = await freshSuggestions(topic, country, language, input.brands);
        await db.suggestion.create({ data: { userId: user.id, topic: key, country, language, results: JSON.stringify(suggestions), costUsd: cost } });
        return suggestions.length
          ? { topic, suggestions, cached: false }
          : { topic, suggestions, cached: false, error: "No encontramos preguntas frecuentes sin marcas sobre este tema. Prueba con uno más general." };
      } catch (e) {
        console.error("[menciones] sugerencias:", e);
        const cost = (e as { cost?: number }).cost ?? 0;
        if (cost > 0) await db.suggestion.create({ data: { userId: user.id, topic: key, country, language, results: "[]", costUsd: cost } });
        else left += 1; // no se gastó nada: se devuelve el cupo
        return { topic, suggestions: [], cached: false, error: "No pudimos obtener sugerencias ahora. Inténtalo de nuevo en unos minutos." };
      }
    }),
  );
  return { ok: true, groups, left: Number.isFinite(left) ? left : null };
}
