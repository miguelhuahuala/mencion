import { timingSafeEqual } from "node:crypto";
import { runScheduled } from "@/lib/schedule";

export const dynamic = "force-dynamic";

/**
 * Corrida programada. Llamar una vez al día desde un cron externo:
 *   GET /api/cron   con cabecera  Authorization: Bearer <CRON_SECRET>
 * Cada proyecto se mide según el plan de su dueño (gratis: semanal).
 * Las corridas siguen en segundo plano (requiere un servidor Node persistente, no serverless).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ok = Boolean(secret) && given.length === secret!.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret!));
  if (!ok) return Response.json({ error: "unauthorized" }, { status: 401 });

  const results = await runScheduled();
  return Response.json({ results: results.map(({ done: _done, ...r }) => r) }, { status: 202 });
}
