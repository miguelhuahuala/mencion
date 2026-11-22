/**
 * Corrida programada desde la terminal (misma lógica que /api/cron):
 *   0 7 * * *  cd /ruta/mencion && npm run track
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { runScheduled } from "../src/lib/schedule";

async function main() {
  const results = await runScheduled();
  for (const r of results) {
    if (r.skipped) console.log(`→ ${r.project}: omitido (${r.skipped})`);
    else if (r.error) console.log(`→ ${r.project}: error (${r.error})`);
    else {
      await r.done;
      const run = await db.run.findUniqueOrThrow({ where: { id: r.runId! } });
      console.log(`→ ${r.project}: ${run.status} · $${run.costUsd.toFixed(4)} · ${run.errorCount} errores`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
