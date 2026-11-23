import "server-only";
import { db } from "./db";
import { askClaudePlain, hasCredentials, searchQuestions, type SearchedQuestion } from "./dataforseo";
import { countryName } from "./locale";
import { monthlyBudget } from "./limits";

/**
 * "Sugerir prompts": busca preguntas reales sobre un tema (DataForSEO LLM Mentions, con volumen de búsqueda),
 * quita las que nombran marcas, junta variantes y las redacta como preguntas naturales con Claude.
 */
export type PromptSuggestion = { text: string; volume: number; phrases: string[] };

const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);
const MONTH_MS = 30 * 86400_000;
const MAX_SUGGESTIONS = 6;

export const normalizeTopic = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 80);
/** Minúsculas y sin tildes, para comparar variantes ("garantia" = "garantía"). */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[¿?¡!.,]/g, "").replace(/\s+/g, " ").trim();

/** Búsquedas por usuario cada 30 días (el admin no tiene límite). */
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

/** Lee la respuesta de Claude: una línea por sugerencia, "números|pregunta". */
export function parseRewrite(text: string, candidates: ReturnType<typeof prefilter>): PromptSuggestion[] {
  const out: PromptSuggestion[] = [];
  const used = new Set<number>();
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([\d,\s]+)\|\s*(.+?)\s*$/);
    if (!m) continue;
    // Cada frase cuenta en una sola sugerencia (la primera que la usa); máx. 4 variantes por sugerencia
    const idx = [...new Set(m[1].split(",").map((n) => Number(n.trim()) - 1))].filter((i) => candidates[i] && !used.has(i)).slice(0, 4);
    idx.forEach((i) => used.add(i));
    const question = m[2].replace(/^["“]|["”]$/g, "").slice(0, 300);
    if (!idx.length || question.length < 8 || out.some((o) => fold(o.text) === fold(question))) continue;
    out.push({
      text: question,
      volume: Math.max(...idx.map((i) => candidates[i].volume)), // variantes: se toma la mayor, no la suma
      phrases: idx.flatMap((i) => candidates[i].phrases),
    });
    if (out.length >= MAX_SUGGESTIONS) break;
  }
  return out.sort((a, b) => b.volume - a.volume);
}

/** left: búsquedas que le quedan (null = sin límite). */
type Result = { ok: true; suggestions: PromptSuggestion[]; left: number | null; cached: boolean } | { ok: false; error: string };

export async function suggestPrompts(
  user: { id: string; role: string },
  input: { topic: string; country: string; language: string; brands: string[] },
): Promise<Result> {
  const topic = normalizeTopic(input.topic);
  if (topic.length < 3) return { ok: false, error: "Escribe un tema de al menos 3 letras, por ejemplo “tarjeta de crédito”." };
  const country = input.country.toUpperCase();
  const language = input.language.toLowerCase();
  const quota = await suggestionQuota(user);

  // Mismo tema, país e idioma en los últimos 30 días: se reutiliza (gratis y sin consumir cupo)
  const previous = await db.suggestion.findFirst({
    where: { topic, country, language, cached: false, results: { not: "[]" }, createdAt: { gte: new Date(Date.now() - MONTH_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (previous) {
    const all = JSON.parse(previous.results) as PromptSuggestion[];
    const banned = input.brands.map(fold).filter((b) => b.length >= 2);
    const suggestions = all.filter((s) => !s.phrases.some((p) => banned.some((b) => fold(p).includes(b))));
    await db.suggestion.create({ data: { userId: user.id, topic, country, language, results: previous.results, cached: true } });
    return { ok: true, suggestions, left: Number.isFinite(quota.left) ? quota.left : null, cached: true };
  }

  if (quota.left <= 0) {
    return { ok: false, error: `Ya usaste tus ${quota.limit} búsquedas de sugerencias de los últimos 30 días.` };
  }
  if (user.role !== "admin" && (await monthlyBudget()).exhausted) {
    return { ok: false, error: "Alcanzamos el límite de consultas de este mes. Vuelve a intentarlo el próximo mes." };
  }

  let cost = 0;
  try {
    const searched = await searchQuestions(topic, { country, language });
    cost += searched.cost;
    const candidates = prefilter(searched.questions, input.brands).slice(0, 14);
    let suggestions: PromptSuggestion[] = [];
    if (candidates.length) {
      const place = countryName(country);
      const system =
        `Conviertes búsquedas de Google en preguntas que una persona de ${place} le haría a ChatGPT. ` +
        `Descarta las que nombran una empresa, banco, tienda o marca. Cada línea es una intención distinta ` +
        `(p. ej. requisitos, costos, rapidez, confianza, cómo solicitar); junta solo variantes casi idénticas y usa cada número una vez. ` +
        `Escribe entre 3 y ${MAX_SUGGESTIONS} líneas con el formato números|pregunta, sin otro texto. Ejemplo: 3,7|¿Qué requisitos piden para un préstamo personal en ${place}?`;
      // La lista debe caber en 500 caracteres (límite de DataForSEO); se queda con las de mayor volumen
      let prompt = `Idioma: ${language}. Búsquedas:`;
      for (const [i, c] of candidates.entries()) {
        const line = `\n${i + 1}. ${c.phrase}`;
        if (prompt.length + line.length > 500) break;
        prompt += line;
      }
      const rewritten = await askClaudePlain(prompt, system);
      cost += rewritten.cost;
      suggestions = parseRewrite(rewritten.text, candidates);
    }
    await db.suggestion.create({ data: { userId: user.id, topic, country, language, results: JSON.stringify(suggestions), costUsd: cost } });
    const left = Number.isFinite(quota.left) ? quota.left - 1 : null;
    if (!suggestions.length) {
      return { ok: false, error: "No encontramos preguntas frecuentes sobre ese tema en este país. Prueba con un tema más general." };
    }
    return { ok: true, suggestions, left, cached: false };
  } catch (e) {
    console.error("[menciones] sugerencias:", e);
    if (cost > 0) await db.suggestion.create({ data: { userId: user.id, topic, country, language, results: "[]", costUsd: cost } });
    return { ok: false, error: "No pudimos obtener sugerencias ahora. Inténtalo de nuevo en unos minutos." };
  }
}
