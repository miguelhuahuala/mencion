/**
 * Corre todos los proyectos reales (no demo). Pensado para un cron diario:
 *   0 7 * * *  cd /ruta/mencion && npm run track
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { startRun } from "../src/lib/runner";

async function main() {
  const projects = await db.project.findMany({ where: { isDemo: false } });
  for (const p of projects) {
    console.log(`→ ${p.name}`);
    const { runId, done } = await startRun(p.id);
    await done;
    const run = await db.run.findUniqueOrThrow({ where: { id: runId } });
    console.log(`  ${run.status} · $${run.costUsd.toFixed(4)} · ${run.errorCount} errores`);
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
