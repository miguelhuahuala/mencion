import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { BrandHit, Competitor, Sentiment, Source } from "./types";

/** Normaliza para comparar: minúsculas y sin tildes. */
function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Primera aparición de cualquiera de los términos como palabra completa; -1 si no aparece. */
function firstIndex(haystack: string, terms: string[]) {
  let best = -1;
  for (const term of terms) {
    const t = norm(term.trim());
    if (t.length < 2) continue;
    const m = new RegExp(`(^|[^a-z0-9])${escapeRe(t)}(?![a-z0-9])`).exec(haystack);
    if (m) {
      const idx = m.index + m[1].length;
      if (best === -1 || idx < best) best = idx;
    }
  }
  return best;
}

function snippetAround(text: string, idx: number) {
  const start = Math.max(0, idx - 120);
  const end = Math.min(text.length, idx + 200);
  return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
}

/**
 * Detección determinista de menciones: busca nombre, alias y dominio de cada marca
 * en el texto de la respuesta, y el dominio entre las fuentes citadas.
 */
export function detectMentions(text: string, sources: Source[], own: Competitor, competitors: Competitor[]): BrandHit[] {
  const hay = norm(text);
  const brands = [{ ...own, own: true }, ...competitors.map((c) => ({ ...c, own: false }))];
  const found = brands.map((b) => {
    const idx = firstIndex(hay, [b.name, ...b.aliases, b.domain].filter(Boolean));
    const d = norm(b.domain);
    const cited = Boolean(d) && sources.some((s) => { const sd = s.domain.replace(/^www\./, ""); return sd === d || sd.endsWith(`.${d}`); });
    return { b, idx, cited };
  });
  const order = found.filter((f) => f.idx >= 0).sort((a, z) => a.idx - z.idx);
  return found.map(({ b, idx, cited }) => ({
    brand: b.name,
    own: b.own,
    mentioned: idx >= 0,
    position: idx >= 0 ? order.findIndex((o) => o.b.name === b.name) + 1 : null,
    cited,
    sentiment: null,
    snippet: idx >= 0 ? snippetAround(text, idx) : null,
  }));
}

const SentimentSchema = z.object({
  brands: z.array(
    z.object({
      brand: z.string(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
    }),
  ),
});

export function canAnalyzeSentiment() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

/**
 * Clasifica con Claude cómo habla la respuesta de cada marca mencionada.
 * Opcional: sin ANTHROPIC_API_KEY las menciones quedan con sentiment = null.
 */
export async function addSentiment(prompt: string, answer: string, hits: BrandHit[]): Promise<BrandHit[]> {
  const mentioned = hits.filter((h) => h.mentioned).map((h) => h.brand);
  if (!mentioned.length || !canAnalyzeSentiment()) return hits;
  client ??= new Anthropic();

  const response = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 2000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: zodOutputFormat(SentimentSchema) },
    system:
      "Eres analista de reputación de marca. Recibes una pregunta de usuario y la respuesta que dio un asistente de IA. " +
      "Para cada marca indicada, clasifica cómo la presenta la respuesta: positive (la recomienda o destaca), " +
      "neutral (solo la lista o la describe), negative (la critica o desaconseja). Juzga solo por el texto dado.",
    messages: [
      {
        role: "user",
        content: `<pregunta>${prompt}</pregunta>\n<respuesta>${answer}</respuesta>\nMarcas: ${mentioned.join(", ")}`,
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) return hits;
  const byBrand = new Map<string, Sentiment>(response.parsed_output.brands.map((b) => [norm(b.brand), b.sentiment]));
  return hits.map((h) => (h.mentioned ? { ...h, sentiment: byBrand.get(norm(h.brand)) ?? null } : h));
}
