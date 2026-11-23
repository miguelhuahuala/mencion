import { db } from "./db";
import { askEngine, hasCredentials, isSandbox } from "./dataforseo";
import { addSentiment, detectMentions } from "./analysis";
import { competitorsOf, ownBrand } from "./projects";
import { ENGINES, type Engine } from "./types";

const CONCURRENCY = 6;

async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(limit, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift()!);
    }),
  );
}

/** Crea una corrida y la ejecuta. Devuelve el id de la corrida; `done` resuelve al terminar. */
export async function startRun(projectId: string, engines: readonly Engine[] = ENGINES) {
  if (!hasCredentials()) throw new Error("Configura DATAFORSEO_LOGIN y DATAFORSEO_PASSWORD en .env para ejecutar consultas reales.");
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId }, include: { prompts: { where: { active: true } } } });
  if (project.isDemo) throw new Error("El proyecto de demostración no se ejecuta contra la API.");
  if (!project.prompts.length) throw new Error("Agrega al menos un prompt antes de ejecutar.");
  // Una corrida "running" de hace más de 30 min quedó huérfana (p. ej. reinicio del servidor): se marca fallida.
  await db.run.updateMany({
    where: { projectId, status: "running", startedAt: { lt: new Date(Date.now() - 30 * 60_000) } },
    data: { status: "failed", finishedAt: new Date() },
  });
  const running = await db.run.findFirst({ where: { projectId, status: "running" } });
  if (running) return { runId: running.id, done: Promise.resolve() };

  const run = await db.run.create({ data: { projectId, mode: isSandbox() ? "sandbox" : "live" } });
  const own = ownBrand(project);
  const competitors = competitorsOf(project);
  const jobs = project.prompts.flatMap((p) => engines.map((engine) => ({ prompt: p, engine })));

  const done = (async () => {
    let cost = 0;
    let errors = 0;
    await pool(jobs, CONCURRENCY, async ({ prompt, engine }) => {
      try {
        const answer = await askEngine(engine, prompt.text, { country: project.country, language: project.language });
        let hits = detectMentions(answer.text, answer.sources, own, competitors);
        try {
          hits = await addSentiment(prompt.text, answer.text, hits);
        } catch (e) {
          console.error("[mencion] sentimiento falló:", e);
        }
        cost += answer.costUsd;
        await db.response.create({
          data: {
            runId: run.id,
            promptId: prompt.id,
            engine,
            model: answer.model,
            text: answer.text,
            sources: JSON.stringify(answer.sources),
            mentions: JSON.stringify(hits),
            costUsd: answer.costUsd,
          },
        });
      } catch (e) {
        errors++;
        console.error(`[menciones] medición ${run.id} · ${engine} falló:`, e instanceof Error ? e.message : e);
        await db.response.create({
          data: { runId: run.id, promptId: prompt.id, engine, error: e instanceof Error ? e.message : String(e) },
        });
      }
    });
    await db.run.update({
      where: { id: run.id },
      data: { status: errors === jobs.length ? "failed" : "done", finishedAt: new Date(), costUsd: cost, errorCount: errors },
    });
    console.log(`[menciones] medición ${run.id} terminó: ${jobs.length - errors}/${jobs.length} ok, $${cost.toFixed(4)}`);
  })().catch(async (e) => {
    console.error("[menciones] medición falló:", e);
    await db.run.update({ where: { id: run.id }, data: { status: "failed", finishedAt: new Date() } });
  });

  return { runId: run.id, done };
}
