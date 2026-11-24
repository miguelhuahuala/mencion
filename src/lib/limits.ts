import { db } from "./db";
import { showDemo } from "./format";

const num = (v: string | undefined, d: number) => (v && !Number.isNaN(Number(v)) ? Number(v) : d);

/** Límites del plan gratis (configurables por variables de entorno). */
export function freeLimits() {
  return {
    maxProjects: num(process.env.FREE_MAX_PROJECTS, 1),
    maxPrompts: num(process.env.FREE_MAX_PROMPTS, 5),
    intervalDays: num(process.env.FREE_RUN_INTERVAL_DAYS, 7),
  };
}

export function limitsFor(user: { role: string } | null) {
  if (user?.role === "admin") return { maxProjects: Infinity, maxPrompts: 100, intervalDays: 0 };
  return freeLimits();
}

/** Tope de gasto mensual de toda la plataforma (protege tu saldo de DataForSEO). 0 = sin tope. */
export async function monthlyBudget() {
  const cap = num(process.env.MAX_MONTHLY_SPEND_USD, 30);
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const agg = await db.run.aggregate({ _sum: { costUsd: true }, where: { startedAt: { gte: start }, mode: { not: "demo" } } });
  // También cuentan las búsquedas de "Sugerir prompts"
  const sugg = await db.suggestion.aggregate({ _sum: { costUsd: true }, where: { createdAt: { gte: start } } });
  const spent = (agg._sum.costUsd ?? 0) + (sugg._sum.costUsd ?? 0);
  return { cap, spent, exhausted: cap > 0 && spent >= cap };
}

/**
 * ¿Se puede lanzar una medición del proyecto ahora?
 * Manual: según el plan (admin sin espera). Programada (cron): semanal para todos y siempre dentro del tope mensual.
 */
export async function runAvailability(projectId: string, user: { role: string } | null, { scheduled = false } = {}) {
  const { intervalDays } = scheduled ? freeLimits() : limitsFor(user);
  if (intervalDays > 0) {
    const last = await db.run.findFirst({
      where: { projectId, status: { in: ["done", "running"] } },
      orderBy: { startedAt: "desc" },
    });
    if (last) {
      const nextAt = new Date(last.startedAt.getTime() + intervalDays * 86400_000);
      if (nextAt > new Date()) return { ok: false as const, reason: "interval" as const, nextAt };
    }
  }
  if ((scheduled || user?.role !== "admin") && (await monthlyBudget()).exhausted) {
    return { ok: false as const, reason: "budget" as const, nextAt: null };
  }
  return { ok: true as const };
}

/** Proyecto visible para el usuario: propio, cualquiera si es admin, o la demo si está activa. */
export async function findProjectFor(id: string, user: { id: string; role: string } | null) {
  const project = await db.project.findUnique({ where: { id } });
  if (!project) return null;
  if (project.isDemo) return showDemo() ? project : null;
  if (!user) return null;
  if (user.role === "admin" || project.userId === user.id) return project;
  return null;
}
