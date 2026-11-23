export const ENGINES = ["chatgpt", "claude", "gemini", "perplexity"] as const;
export type Engine = (typeof ENGINES)[number];

export const ENGINE_LABEL: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

export type Competitor = { name: string; domain: string; aliases: string[]; color?: string };

export type Source = { title: string; url: string; domain: string };

export type Sentiment = "positive" | "neutral" | "negative";

/** Resultado del análisis de una marca dentro de una respuesta. */
export type BrandHit = {
  brand: string;
  own: boolean;
  mentioned: boolean;
  /** Orden de aparición entre las marcas seguidas (1 = la primera nombrada). */
  position: number | null;
  /** El dominio de la marca aparece entre las fuentes citadas. */
  cited: boolean;
  sentiment: Sentiment | null;
  snippet: string | null;
};

export type EngineAnswer = {
  engine: Engine;
  model: string;
  text: string;
  sources: Source[];
  costUsd: number;
};

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
