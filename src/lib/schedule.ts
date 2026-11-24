import { db } from "./db";
import { startRun } from "./runner";
import { runAvailability } from "./limits";

/**
 * Corrida programada: lanza una medición por proyecto si a su dueño le toca según su plan
 * Es semanal para todos los proyectos (también los del admin, que solo puede medir más seguido a mano)
 * y respeta siempre el presupuesto mensual.
 */
export async function runScheduled() {
  const projects = await db.project.findMany({ where: { isDemo: false }, include: { user: { select: { role: true } } } });
  const results: { project: string; runId?: string; skipped?: string; error?: string; done?: Promise<void> }[] = [];
  for (const p of projects) {
    const owner = p.user ?? { role: "admin" };
    const avail = await runAvailability(p.id, owner, { scheduled: true });
    if (!avail.ok) {
      results.push({ project: p.name, skipped: avail.reason === "interval" ? `próxima ${avail.nextAt!.toISOString()}` : "presupuesto mensual agotado" });
      continue;
    }
    try {
      const { runId, done } = await startRun(p.id);
      results.push({ project: p.name, runId, done });
    } catch (e) {
      results.push({ project: p.name, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return results;
}
