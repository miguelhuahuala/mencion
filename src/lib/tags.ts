/** Etiquetas de prompts (p. ej. por producto). Se guardan como JSON en Prompt.tags. */
export const MAX_TAGS_PER_PROMPT = 3;
const MAX_TAG_LENGTH = 30;

/** "Tarjetas, préstamos ,Tarjetas" → ["Tarjetas", "préstamos"] (sin vacíos ni repetidas, sin distinguir mayúsculas). */
export function parseTags(raw: string): string[] {
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.replace(/\s+/g, " ").trim().slice(0, MAX_TAG_LENGTH);
    if (tag && !out.some((t) => t.toLowerCase() === tag.toLowerCase())) out.push(tag);
    if (out.length >= MAX_TAGS_PER_PROMPT) break;
  }
  return out;
}

export function tagsOf(prompt: { tags: string }): string[] {
  try {
    const v = JSON.parse(prompt.tags);
    return Array.isArray(v) ? v.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

/** Todas las etiquetas de una lista de prompts, en orden alfabético. */
export function allTags(prompts: { tags: string }[]): string[] {
  const seen = new Map<string, string>();
  for (const p of prompts) for (const t of tagsOf(p)) if (!seen.has(t.toLowerCase())) seen.set(t.toLowerCase(), t);
  return [...seen.values()].sort((a, b) => a.localeCompare(b, "es"));
}

export const hasTag = (prompt: { tags: string }, tag: string) => tagsOf(prompt).some((t) => t.toLowerCase() === tag.toLowerCase());
