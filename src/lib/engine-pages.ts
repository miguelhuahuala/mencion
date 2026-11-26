import type { Engine } from "./types";

/**
 * Contenido de /ia/[engine]. Debe reflejar cómo medimos de verdad (ver lib/dataforseo.ts → askEngine):
 * ChatGPT = respuesta real de chatgpt.com localizada; el resto = API con búsqueda web y contexto de país e idioma.
 */
export type EnginePage = {
  title: string; // <title> (≤ 60 caracteres con el sufijo "· Menciones")
  description: string; // meta description (~150-160)
  h1: string;
  intro: string;
  how: string[]; // cómo lo medimos
  why: string; // por qué importa en esta IA
  tips: string[]; // qué puedes hacer para mejorar
  faqs: [string, string][];
};

export const ENGINE_PAGES: Record<Engine, EnginePage> = {
  chatgpt: {
    title: "¿ChatGPT recomienda tu marca? Mide gratis",
    description:
      "Descubre si ChatGPT menciona y recomienda tu marca frente a tu competencia, en qué posición y qué fuentes cita. Medición gratuita y localizada en tu país.",
    h1: "¿ChatGPT recomienda tu marca o la de tu competencia?",
    intro:
      "Cuando alguien le pregunta a ChatGPT “¿cuál es la mejor opción?” en tu categoría, la respuesta nombra a unas pocas marcas. Menciones te muestra si la tuya está entre ellas, en qué lugar aparece y frente a quién.",
    how: [
      "Hacemos tus preguntas en ChatGPT tal como las vería una persona en tu país: obtenemos la respuesta de chatgpt.com localizada en la ubicación de tu proyecto.",
      "Activamos la búsqueda web, así que la respuesta incluye las páginas que ChatGPT consultó y cita.",
      "Detectamos qué marcas aparecen (la tuya y tus competidores, con sus otras formas de escribirse) y en qué orden.",
    ],
    why:
      "ChatGPT es el asistente de IA más conocido y mucha gente lo usa para comparar productos y servicios antes de decidir. Si no apareces en sus respuestas, ese cliente compara sin ti.",
    tips: [
      "Revisa qué fuentes cita ChatGPT en tus preguntas clave: medios, comparadores, reseñas o foros. Estar presente ahí suele pesar más que tu propia web.",
      "Explica con claridad en tu web qué ofreces, para quién y en qué te diferencias: las respuestas se apoyan en textos concretos y fáciles de citar.",
      "Mide las mismas preguntas cada semana para saber si tus acciones de contenido y PR cambian el resultado.",
    ],
    faqs: [
      ["¿Las respuestas son las mismas que ve un usuario?", "Obtenemos la respuesta de chatgpt.com con búsqueda web y localizada en el país de tu proyecto, como la vería una persona allí. Las respuestas de la IA pueden variar entre una consulta y otra; por eso conviene mirar la tendencia de varias mediciones."],
      ["¿Puedo medir en otro país que no sea Perú?", "Sí. Al crear tu proyecto eliges el país y el idioma de tus clientes, y la consulta se hace con esa ubicación."],
      ["¿Necesito una cuenta de ChatGPT?", "No. Nosotros hacemos las consultas por ti; solo necesitas una cuenta gratis en Menciones."],
    ],
  },
  claude: {
    title: "¿Claude recomienda tu marca? Mide gratis",
    description:
      "Mide si Claude, el asistente de IA de Anthropic, menciona tu marca frente a tu competencia, en qué posición y con qué fuentes. Gratis y localizado en tu país.",
    h1: "¿Claude menciona tu marca cuando tus clientes preguntan?",
    intro:
      "Claude es el asistente de IA de Anthropic. Menciones le hace las preguntas de tus clientes y te muestra si tu marca aparece en sus respuestas, en qué posición y frente a qué competidores.",
    how: [
      "Consultamos a Claude con búsqueda web activada, para que responda con información actual.",
      "Le indicamos el país y el idioma de tu proyecto, para que la respuesta corresponda a tu mercado y no a uno genérico.",
      "Detectamos qué marcas nombra y en qué orden, y qué dominios usa como fuente.",
    ],
    why:
      "Claude se usa mucho en el trabajo para investigar y comparar opciones. Medirlo junto a las otras IAs te muestra si tu visibilidad es consistente o si dependes de un solo asistente.",
    tips: [
      "Compara tu visibilidad en Claude con la de ChatGPT y Gemini: las diferencias entre IAs suelen deberse a las fuentes que cada una encuentra.",
      "Revisa las fuentes que cita para tus preguntas clave y busca presencia en ellas.",
      "Mantén información clara y actualizada sobre tu marca en tu web y en directorios o medios de tu sector.",
    ],
    faqs: [
      ["¿Claude busca en internet al responder?", "En nuestras mediciones, sí: lo consultamos con búsqueda web activada y con el contexto de tu país e idioma."],
      ["¿Por qué mi marca aparece en ChatGPT y no en Claude?", "Cada IA consulta y prioriza fuentes distintas. Comparar las cuatro te ayuda a ver dónde estás fuerte y dónde te falta presencia."],
      ["¿Necesito una cuenta de Claude?", "No. Nosotros hacemos las consultas; solo necesitas una cuenta gratis en Menciones."],
    ],
  },
  gemini: {
    title: "¿Gemini recomienda tu marca? Mide gratis",
    description:
      "Mide si Gemini, el asistente de IA de Google, menciona tu marca frente a tu competencia, en qué posición y qué fuentes cita. Gratis y localizado en tu país.",
    h1: "¿Gemini, la IA de Google, recomienda tu marca?",
    intro:
      "Gemini es el asistente de IA de Google. Menciones le hace las preguntas que tus clientes harían y te muestra si tu marca aparece, en qué lugar y frente a quién.",
    how: [
      "Consultamos a Gemini con búsqueda web activada.",
      "Le indicamos el país y el idioma de tu proyecto, para que responda pensando en tu mercado.",
      "Detectamos las marcas que nombra, su orden y los dominios que cita como fuente.",
    ],
    why:
      "Gemini está integrado en el ecosistema de Google. Saber cómo te presenta te ayuda a entender cómo te ve la IA de la empresa que también controla el buscador más usado.",
    tips: [
      "Revisa si las fuentes que cita Gemini coinciden con los sitios donde ya trabajas tu SEO.",
      "Cuida tu presencia en reseñas, comparadores y medios de tu sector, que suelen aparecer como fuente.",
      "Compara la tendencia de Gemini con la de las otras IAs para priorizar dónde actuar.",
    ],
    faqs: [
      ["¿Gemini es lo mismo que las respuestas con IA del buscador de Google?", "No exactamente. Medimos al asistente Gemini, que es un producto distinto aunque ambos son de Google."],
      ["¿Las respuestas corresponden a mi país?", "Sí: le indicamos el país y el idioma de tu proyecto y consultamos con búsqueda web activada."],
      ["¿Necesito una cuenta de Google?", "No. Nosotros hacemos las consultas; solo necesitas una cuenta gratis en Menciones."],
    ],
  },
  perplexity: {
    title: "¿Perplexity recomienda tu marca? Mide gratis",
    description:
      "Mide si Perplexity menciona tu marca frente a tu competencia, en qué posición y qué fuentes cita en sus respuestas. Gratis y localizado en tu país.",
    h1: "¿Perplexity cita y recomienda tu marca?",
    intro:
      "Perplexity es un buscador con IA: responde con un texto y muestra las fuentes que usó. Menciones te dice si tu marca aparece en esas respuestas y si tu web está entre las fuentes citadas.",
    how: [
      "Consultamos a Perplexity localizado en el país de tu proyecto.",
      "Le indicamos también el idioma, para que la respuesta corresponda a tus clientes.",
      "Registramos qué marcas nombra, en qué orden y qué fuentes cita, incluido si enlaza a tu dominio.",
    ],
    why:
      "Perplexity siempre muestra sus fuentes, así que es la IA donde más claro se ve qué sitios influyen en la respuesta. Es un buen punto de partida para decidir dónde conseguir presencia.",
    tips: [
      "Mira la sección de fuentes citadas: te dice exactamente qué páginas leen las IAs para tus preguntas.",
      "Si tu dominio no aparece como fuente, revisa si tu web responde de forma directa las preguntas de tus clientes.",
      "Sigue la métrica “Citado como fuente” en cada medición para ver si tu contenido gana terreno.",
    ],
    faqs: [
      ["¿Qué significa “citado como fuente”?", "Que la respuesta incluye un enlace a tu dominio entre sus fuentes. Indica que la IA usa tu web como referencia, no solo que te nombra."],
      ["¿Las respuestas corresponden a mi país?", "Sí: consultamos a Perplexity localizado en el país de tu proyecto y en tu idioma."],
      ["¿Necesito una cuenta de Perplexity?", "No. Nosotros hacemos las consultas; solo necesitas una cuenta gratis en Menciones."],
    ],
  },
};
