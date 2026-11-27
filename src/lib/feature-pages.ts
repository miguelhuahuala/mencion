import { MAX_COMPETITORS } from "./projects";

/**
 * Páginas /funciones/[slug]. Las definiciones deben coincidir con cómo se calcula cada métrica
 * (lib/stats.ts, lib/analysis.ts, lib/suggest.ts) y con los textos de METRIC_INFO.
 */
export type FeaturePage = {
  slug: string;
  short: string; // nombre corto (migas, índice, menú)
  title: string; // <title> sin el sufijo (≤ 48 caracteres)
  description: string;
  h1: string;
  intro: string;
  what: string; // qué es
  how: string[]; // cómo lo calculamos
  example: string;
  useFor: string[]; // para qué te sirve
  faqs: [string, string][];
  guide: string; // slug de la guía relacionada
};

export const FEATURES: FeaturePage[] = [
  {
    slug: "visibilidad-en-ia",
    short: "Visibilidad en IA",
    title: "Visibilidad de marca en IA: mídela gratis",
    description:
      "Mide en qué porcentaje de las respuestas de ChatGPT, Claude, Gemini y Perplexity aparece tu marca, pregunta por pregunta y frente a tu competencia.",
    h1: "¿En cuántas respuestas de la IA aparece tu marca?",
    intro:
      "La visibilidad es la métrica base de GEO: te dice con qué frecuencia la IA te menciona cuando tus clientes preguntan por tu categoría.",
    what: "El porcentaje de respuestas de las IAs que mencionan tu marca.",
    how: [
      "Cada medición hace tus preguntas en ChatGPT, Claude, Gemini y Perplexity.",
      "En cada respuesta buscamos tu marca, sus otras formas de escribirse y tu dominio.",
      "Visibilidad = respuestas que te mencionan ÷ respuestas obtenidas.",
      "La ves en total, por IA y pregunta por pregunta, con su evolución en cada medición.",
    ],
    example: "Con 5 preguntas en 4 IAs obtienes 20 respuestas. Si apareces en 8, tu visibilidad es 40 %.",
    useFor: [
      "Saber tu punto de partida antes de invertir en contenido o PR.",
      "Detectar en qué IA o en qué pregunta no apareces.",
      "Comprobar, semana a semana, si tus acciones mueven la aguja.",
    ],
    faqs: [
      ["¿Qué visibilidad es buena?", "Depende de tu categoría y de tu competencia. Por eso la mostramos junto a la de tus competidores: un 30 % puede ser mucho si el líder tiene 35 %, o poco si tiene 80 %."],
      ["¿Por qué cambia entre mediciones?", "Las respuestas de la IA varían entre consultas y con el tiempo. Lo importante es la tendencia de varias mediciones, no una sola."],
    ],
    guide: "como-medir-visibilidad-en-ia",
  },
  {
    slug: "share-of-voice-ia",
    short: "Share of voice en IA",
    title: "Share of voice en IA frente a tu competencia",
    description:
      "Mide qué parte de las menciones de tu categoría en ChatGPT, Claude, Gemini y Perplexity son tuyas frente a tus competidores. Gratis.",
    h1: "Tu share of voice en las respuestas de la IA",
    intro:
      "Aparecer no basta: importa cuánto apareces comparado con tu competencia. El share of voice mide tu peso dentro de la conversación.",
    what: "De todas las menciones a las marcas que sigues (tú y tus competidores), qué porcentaje son tuyas.",
    how: [
      `Defines tu marca y hasta ${MAX_COMPETITORS} competidores.`,
      "Contamos cuántas respuestas mencionan a cada marca.",
      "Share of voice = tus menciones ÷ menciones de todas las marcas seguidas.",
      "La comparamos marca por marca en una tabla y en un gráfico de evolución.",
    ],
    example: "Si en una medición hay 40 menciones de marcas y 10 son tuyas, tu share of voice es 25 %.",
    useFor: [
      "Saber si estás ganando o perdiendo terreno frente a un competidor concreto.",
      "Ver qué marcas dominan las respuestas de tu categoría.",
      "Reportar a tu equipo una métrica fácil de comparar mes a mes.",
    ],
    faqs: [
      ["¿Cuál es la diferencia con la visibilidad?", "La visibilidad mira solo tus respuestas (en cuántas apareces). El share of voice te compara con tu competencia: qué parte de todas las menciones es tuya."],
      ["¿Qué competidores debo agregar?", "Las marcas con las que tus clientes te comparan al decidir. Si una marca aparece mucho en las respuestas y no la sigues, conviene sumarla."],
    ],
    guide: "kpis-de-geo",
  },
  {
    slug: "posicion-en-respuestas-ia",
    short: "Posición en las respuestas",
    title: "Posición de tu marca en las respuestas de IA",
    description:
      "Descubre en qué lugar te nombran ChatGPT, Claude, Gemini y Perplexity frente a tus competidores. La primera marca mencionada suele llevarse la atención.",
    h1: "¿En qué lugar te nombra la IA?",
    intro:
      "Cuando la IA lista varias opciones, el orden importa: las primeras marcas reciben más atención. La posición te dice dónde quedas.",
    what: "Cuando te mencionan, en qué lugar apareces entre las marcas que sigues, según el orden en que la IA las nombra.",
    how: [
      "En cada respuesta ordenamos tus marcas seguidas según dónde aparecen por primera vez en el texto.",
      "Tu posición es tu lugar en ese orden: #1 significa que te nombró primero.",
      "Posición media = promedio de tus posiciones en las respuestas donde apareces.",
      "En la tabla “Detalle por prompt” ves tu posición en cada pregunta y en cada IA.",
    ],
    example: "Si en una respuesta la IA nombra a Marca A, luego a ti y luego a Marca B, tu posición es #2.",
    useFor: [
      "Distinguir entre “aparecer al final” y “ser la primera recomendación”.",
      "Encontrar las preguntas donde un competidor te gana el primer lugar.",
      "Medir el efecto de mejorar tu presencia en las fuentes que cita la IA.",
    ],
    faqs: [
      ["¿Menor es mejor?", "Sí. #1 es el mejor lugar posible: la IA te nombró antes que a las demás marcas que sigues."],
      ["¿Cuenta marcas que no sigo?", "No. La posición se calcula entre tu marca y los competidores que configuraste."],
    ],
    guide: "kpis-de-geo",
  },
  {
    slug: "sentiment-de-marca-ia",
    short: "Sentiment de marca",
    title: "Sentiment de tu marca en las respuestas de IA",
    description:
      "Descubre si ChatGPT, Claude, Gemini y Perplexity presentan tu marca de forma positiva, neutral o negativa cuando la mencionan.",
    h1: "¿La IA habla bien de tu marca?",
    intro:
      "Que la IA te mencione es el primer paso. El segundo es cómo lo hace: no es lo mismo “te la recomiendo” que “algunos usuarios se quejan de…”.",
    what: "Cómo te presenta la IA cuando te menciona: positivo, neutral o negativo. El número es el porcentaje de menciones positivas.",
    how: [
      "Tomamos cada respuesta en la que aparece tu marca o un competidor.",
      "Un modelo de IA (Claude, de Anthropic) clasifica cómo presenta a cada marca: positivo si la recomienda o destaca, neutral si solo la nombra o describe, negativo si la critica o desaconseja.",
      "Ves el porcentaje positivo de tu marca y el detalle positivo / neutral / negativo de cada competidor.",
    ],
    example: "Si apareces en 10 respuestas y en 7 la IA te recomienda o destaca, tu sentiment es 70 % positivo.",
    useFor: [
      "Detectar menciones negativas antes de que se vuelvan la narrativa dominante.",
      "Comparar cómo presenta la IA a tu marca frente a la competencia.",
      "Priorizar temas de reputación, reseñas o contenido.",
    ],
    faqs: [
      ["¿Es exacto?", "Es una clasificación automática y puede equivocarse en textos ambiguos. Puedes leer cada respuesta completa en tu panel para revisar el contexto."],
      ["¿Desde cuándo está disponible?", "Es una función nueva: se calcula en las mediciones que se hagan desde su activación."],
    ],
    guide: "kpis-de-geo",
  },
  {
    slug: "fuentes-citadas-por-ia",
    short: "Fuentes citadas",
    title: "Qué fuentes citan las IAs sobre tu categoría",
    description:
      "Descubre qué sitios citan ChatGPT, Claude, Gemini y Perplexity cuando responden sobre tu categoría, y si tu web está entre ellos.",
    h1: "¿Qué sitios usa la IA para responder sobre tu categoría?",
    intro:
      "Las IAs con búsqueda web se apoyan en páginas concretas: medios, comparadores, reseñas, foros. Saber cuáles te dice dónde conseguir presencia.",
    what: "Los dominios que las IAs enlazan como fuente en sus respuestas, y cuántas respuestas enlazan a tu propio dominio.",
    how: [
      "Guardamos las fuentes que acompañan cada respuesta.",
      "Contamos qué dominios aparecen más y en qué porcentaje de las respuestas.",
      "“Citado como fuente” cuenta las respuestas que enlazan a tu dominio (o a sus subdominios).",
    ],
    example: "Si un comparador aparece como fuente en 6 de 20 respuestas, es un sitio donde conviene estar bien presentado.",
    useFor: [
      "Priorizar acciones de PR, reseñas y alianzas en los sitios que pesan de verdad.",
      "Saber si la IA usa tu web como referencia, no solo si te nombra.",
      "Detectar fuentes que favorecen a tu competencia.",
    ],
    faqs: [
      ["¿Todas las IAs citan fuentes?", "Perplexity siempre muestra sus fuentes. En las demás depende de la respuesta; las consultamos con búsqueda web activada para que usen información actual."],
      ["¿Qué hago si mi dominio no aparece?", "Revisa si tu web responde de forma directa las preguntas de tus clientes y trabaja tu presencia en los sitios que sí aparecen."],
    ],
    guide: "que-fuentes-usan-las-ia",
  },
  {
    slug: "descubrir-prompts",
    short: "Descubrir prompts",
    title: "Descubre qué preguntan tus clientes a la IA",
    description:
      "Encuentra las preguntas más buscadas sobre tu producto o categoría en tu país, redactadas como prompts listos para medir en ChatGPT y otras IAs.",
    h1: "Descubre qué preguntan tus clientes a la IA",
    intro:
      "Medir funciona si mides las preguntas correctas. Esta función te sugiere las más buscadas sobre tu producto o categoría, listas para agregar a tu proyecto.",
    what: "Sugerencias de preguntas reales sobre tu producto o categoría, con su volumen estimado de búsqueda, redactadas como las haría una persona a la IA.",
    how: [
      "Escribes hasta 3 productos o categorías, por ejemplo “cuenta de ahorro”.",
      "Buscamos las preguntas más buscadas sobre cada uno en tu país, con su volumen estimado de búsquedas mensuales en Google con respuesta de IA (fuente: DataForSEO).",
      "Las redactamos como preguntas completas, sin nombres de marcas, y te mostramos hasta 5 por tema.",
      "Las agregas a tu proyecto con un clic, etiquetadas con su tema.",
    ],
    example: "Para “cuenta de ahorro” puedes obtener preguntas como “¿qué banco paga más intereses por ahorrar?”, con su volumen estimado.",
    useFor: [
      "Empezar a medir sin adivinar qué preguntan tus clientes.",
      "Priorizar las preguntas con más demanda.",
      "Agrupar tus prompts por producto con etiquetas y filtrar el panel.",
    ],
    faqs: [
      ["¿Cuántas búsquedas incluye el plan gratis?", "3 búsquedas al mes; cada producto o categoría usa una. Repetir un tema ya buscado no consume búsquedas."],
      ["¿Por qué no aparecen marcas en las sugerencias?", "Las quitamos a propósito: una pregunta neutral muestra a qué marcas recomienda la IA por sí sola."],
    ],
    guide: "como-elegir-prompts",
  },
];

export const feature = (slug: string) => FEATURES.find((f) => f.slug === slug);
