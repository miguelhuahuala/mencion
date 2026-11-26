/** Guías publicadas (índice /guias, sitemap y enlaces relacionados). La pilar es /guias/que-es-geo. */
export type Guide = {
  slug: string;
  title: string; // <title> sin el sufijo "· Menciones" (≤ 48 caracteres)
  h1: string;
  short: string; // nombre corto para migas, índice y enlaces
  description: string; // meta description (~150-160)
  published: string; // AAAA-MM-DD
};

export const GUIDES: Guide[] = [
  {
    slug: "que-es-geo",
    title: "Qué es GEO (Generative Engine Optimization)",
    h1: "Qué es GEO y por qué tu marca necesita aparecer en las respuestas de la IA",
    short: "Qué es GEO",
    description:
      "Qué es GEO, en qué se diferencia del SEO, cómo deciden las IAs qué marcas recomendar y cómo medir tu visibilidad en ChatGPT, Claude, Gemini y Perplexity.",
    published: "2026-11-25",
  },
  {
    slug: "geo-vs-seo",
    title: "GEO vs. SEO: diferencias y cómo combinarlos",
    h1: "GEO vs. SEO: qué cambia, qué sigue igual y cómo combinarlos",
    short: "GEO vs. SEO",
    description:
      "Diferencias entre GEO y SEO: dónde compites, qué se mide y qué influye. Y cómo aprovechar tu SEO para aparecer en las respuestas de la IA.",
    published: "2026-11-25",
  },
  {
    slug: "como-aparecer-en-chatgpt",
    title: "Cómo aparecer en ChatGPT: guía para marcas",
    h1: "Cómo lograr que ChatGPT mencione y recomiende tu marca",
    short: "Cómo aparecer en ChatGPT",
    description:
      "Qué hace que ChatGPT mencione una marca y qué acciones puedes tomar para aparecer en sus respuestas: fuentes, contenido, reputación y medición constante.",
    published: "2026-11-25",
  },
  {
    slug: "como-medir-visibilidad-en-ia",
    title: "Cómo medir la visibilidad de tu marca en IA",
    h1: "Cómo medir la visibilidad de tu marca en la IA, paso a paso",
    short: "Cómo medir tu visibilidad en IA",
    description:
      "Cómo medir si ChatGPT, Claude, Gemini y Perplexity mencionan tu marca: elegir preguntas, definir competidores, medir desde tu país y leer los resultados.",
    published: "2026-11-25",
  },
  {
    slug: "que-fuentes-usan-las-ia",
    title: "Qué fuentes usan las IAs para responder",
    h1: "Qué fuentes usan las IAs para responder y cómo estar en ellas",
    short: "Qué fuentes usan las IAs",
    description:
      "De dónde sacan la información ChatGPT, Gemini, Claude y Perplexity, qué sitios suelen citar y cómo estar en las fuentes que pesan en tu categoría.",
    published: "2026-11-25",
  },
  {
    slug: "kpis-de-geo",
    title: "KPIs de GEO: las métricas que importan",
    h1: "KPIs de GEO: las métricas para medir tu marca en la IA",
    short: "KPIs de GEO",
    description:
      "Las métricas de GEO explicadas: visibilidad, posición, share of voice, sentiment y fuentes citadas. Cómo se calculan y cómo leerlas.",
    published: "2026-11-25",
  },
  {
    slug: "como-elegir-prompts",
    title: "Cómo elegir los prompts que vas a medir",
    h1: "Cómo elegir los prompts que vas a medir en la IA",
    short: "Cómo elegir prompts",
    description:
      "Cómo elegir los prompts que vas a medir en ChatGPT y otras IAs: qué hace un buen prompt, cuántos usar y cómo encontrar los más buscados.",
    published: "2026-11-25",
  },
];

export const guide = (slug: string) => {
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) throw new Error(`Guía desconocida: ${slug}`);
  return g;
};
