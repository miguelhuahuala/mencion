import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { startRun } from "@/lib/runner";

export const dynamic = "force-dynamic";

/**
 * Lanza una corrida para cada proyecto real. Llamar una vez al día desde un cron externo:
 *   GET /api/cron   con cabecera  Authorization: Bearer <CRON_SECRET>
 * Las corridas siguen en segundo plano (requiere un servidor Node persistente, no serverless).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ok = Boolean(secret) && given.length === secret!.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret!));
  if (!ok) return Response.json({ error: "unauthorized" }, { status: 401 });

  const projects = await db.project.findMany({ where: { isDemo: false }, select: { id: true, name: true } });
  const started: { project: string; runId?: string; error?: string }[] = [];
  for (const p of projects) {
    try {
      const { runId } = await startRun(p.id);
      started.push({ project: p.name, runId });
    } catch (e) {
      started.push({ project: p.name, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return Response.json({ started }, { status: 202 });
}
