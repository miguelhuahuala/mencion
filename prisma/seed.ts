/**
 * Proyecto de DEMOSTRACIÓN con datos ficticios (marcas y dominios .example).
 * Se muestra en la UI con un aviso claro y solo si SHOW_DEMO_DATA=true.
 * Nada de esto proviene de DataForSEO ni de ninguna IA real.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { detectMentions } from "../src/lib/analysis";
import { ENGINES, type Competitor, type Source } from "../src/lib/types";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, "") }),
});

// PRNG determinista para que la demo sea estable
let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];

const own: Competitor = { name: "Kaus", domain: "kaus.example", aliases: ["Kaus App"] };
const competitors: Competitor[] = [
  { name: "Balanzia", domain: "balanzia.example", aliases: [] },
  { name: "FitLima", domain: "fitlima.example", aliases: ["Fit Lima"] },
  { name: "Vitalo", domain: "vitalo.example", aliases: [] },
];
const prompts = [
  "¿Cuál es la mejor app para bajar de peso en Perú?",
  "Apps con coach de nutrición con inteligencia artificial en español",
  "¿Qué app recomiendas para contar calorías con comida peruana?",
  "Alternativas a un nutricionista presencial en Lima",
  "Mejor app para perder 10 kilos de forma saludable",
  "¿Hay alguna app que haga plan de comidas personalizado gratis?",
  "Apps de seguimiento de peso con recordatorios por WhatsApp",
  "¿Qué aplicación usar para mantener el peso después de una dieta?",
];
const sourcePool = ["blog-salud.example", "revista-nutricion.example", "foro-fitness.example", "comparador-apps.example", "kaus.example", "balanzia.example", "fitlima.example", "noticias-tech.example"];

// Probabilidad de que cada motor mencione cada marca (para que la demo cuente una historia)
const bias: Record<string, Record<string, number>> = {
  chatgpt: { Kaus: 0.55, Balanzia: 0.7, FitLima: 0.45, Vitalo: 0.3 },
  claude: { Kaus: 0.4, Balanzia: 0.6, FitLima: 0.35, Vitalo: 0.25 },
  gemini: { Kaus: 0.3, Balanzia: 0.75, FitLima: 0.5, Vitalo: 0.4 },
  perplexity: { Kaus: 0.65, Balanzia: 0.55, FitLima: 0.3, Vitalo: 0.2 },
};
const phrases = {
  positive: ["destaca por su coach con IA que adapta el plan a comida local", "es muy recomendada por usuarios que buscan acompañamiento diario", "ofrece un seguimiento cercano y fácil de usar"],
  neutral: ["es otra opción disponible en la región", "permite registrar comidas y peso", "tiene una versión gratuita con funciones básicas"],
  negative: ["algunos usuarios reportan que su versión gratuita es limitada", "tiene menos contenido adaptado a la cocina peruana"],
};

function fakeAnswer(engine: string, boost: number) {
  const brands = [own, ...competitors].filter((b) => rand() < Math.min(0.95, bias[engine][b.name] + (b === own ? boost : 0)));
  brands.sort(() => rand() - 0.5);
  const lines = brands.map((b, i) => {
    const tone = rand() < 0.6 ? "positive" : rand() < 0.8 ? "neutral" : "negative";
    return { line: `${i + 1}. **${b.name}**: ${pick(phrases[tone])}.`, brand: b.name, tone };
  });
  const text = brands.length
    ? `Estas son algunas opciones populares:\n\n${lines.map((l) => l.line).join("\n")}\n\nLa mejor elección depende de tu presupuesto y de si buscas acompañamiento personalizado.`
    : "No hay una única respuesta: lo ideal es combinar una app de registro de comidas con la orientación de un profesional de la salud.";
  const n = 1 + Math.floor(rand() * 4);
  const sources: Source[] = Array.from(new Set(Array.from({ length: n }, () => pick(sourcePool)))).map((d) => ({
    title: `Artículo en ${d}`,
    url: `https://${d}/articulo`,
    domain: d,
  }));
  return { text, sources, tones: new Map(lines.map((l) => [l.brand, l.tone as "positive" | "neutral" | "negative"])) };
}

async function main() {
  await db.project.deleteMany({ where: { isDemo: true } });
  const project = await db.project.create({
    data: {
      name: own.name,
      domain: own.domain,
      aliases: JSON.stringify(own.aliases),
      competitors: JSON.stringify(competitors),
      country: "PE",
      language: "es",
      isDemo: true,
      prompts: { create: prompts.map((text) => ({ text })) },
    },
    include: { prompts: true },
  });

  const days = 10;
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86400000);
    const boost = ((days - 1 - d) / days) * 0.25; // la marca propia mejora con el tiempo
    const run = await db.run.create({
      data: { projectId: project.id, status: "done", mode: "demo", startedAt: date, finishedAt: date },
    });
    let cost = 0;
    for (const p of project.prompts) {
      for (const engine of ENGINES) {
        const a = fakeAnswer(engine, boost);
        const hits = detectMentions(a.text, a.sources, own, competitors).map((h) => ({ ...h, sentiment: h.mentioned ? a.tones.get(h.brand) ?? null : null }));
        const c = engine === "chatgpt" ? 0.004 : 0.0006 + rand() * 0.01;
        cost += c;
        await db.response.create({
          data: { runId: run.id, promptId: p.id, engine, model: `${engine}-demo`, text: a.text, sources: JSON.stringify(a.sources), mentions: JSON.stringify(hits), costUsd: c, createdAt: date },
        });
      }
    }
    await db.run.update({ where: { id: run.id }, data: { costUsd: cost } });
  }
  console.log(`Demo creada: proyecto ${project.id}`);
}

main().finally(() => db.$disconnect());
