/** Definiciones de las métricas (tooltips del panel y de la vista de ejemplo). Reflejan cómo se calculan en lib/stats.ts. */
export const METRIC_INFO = {
  visibility: "Porcentaje de respuestas de las IAs que mencionan tu marca. Ej.: 5 prompts × 4 IAs = 20 respuestas; si apareces en 8, tu visibilidad es 40%.",
  share: "Share of voice: de todas las menciones a las marcas que sigues (tú + competidores), qué porcentaje son tuyas. Mide tu peso frente a la competencia.",
  position: "Cuando te mencionan, en qué lugar apareces entre las marcas que sigues (según el orden en que la IA las nombra). #1 = te nombra primero. Menor es mejor.",
  sentiment: "Cómo te presenta la IA cuando te menciona: positivo (te recomienda o destaca), neutral (solo te nombra o describe) o negativo (te critica o desaconseja). El número es el % de menciones positivas.",
  cited: "Cuántas respuestas incluyen un enlace a tu dominio entre sus fuentes. Indica que la IA usa tu web como referencia, no solo que te nombra.",
} as const;
