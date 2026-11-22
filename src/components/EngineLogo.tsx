import { siClaude, siGooglegemini, siPerplexity } from "simple-icons";
import type { Engine } from "@/lib/types";

// Logos de marca (simple-icons, CC0) usados solo para identificar cada IA consultada.
const ICONS: Partial<Record<Engine, { path: string; hex: string }>> = {
  claude: siClaude,
  gemini: siGooglegemini,
  perplexity: siPerplexity,
};

/** Logo de cada IA. ChatGPT usa un ícono genérico de chat (simple-icons no incluye el de OpenAI). */
export function EngineLogo({ engine, size = 20, className = "" }: { engine: Engine; size?: number; className?: string }) {
  const icon = ICONS[engine];
  if (!icon) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className={className} fill="none" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
        <path d="M8.5 10.5h7M8.5 13.5h4.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className={className} fill={`#${icon.hex}`}>
      <path d={icon.path} />
    </svg>
  );
}
