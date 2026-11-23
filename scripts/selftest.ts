/**
 * Prueba de extremo a extremo SIN gastar créditos: simula respuestas de DataForSEO
 * con la forma documentada y ejecuta el runner real sobre una base temporal.
 *   npm run selftest
 */
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
const DB = "./selftest.db";
rmSync(DB, { force: true });
process.env.DATABASE_URL = `file:${DB}`;
process.env.DATAFORSEO_LOGIN = "test";
process.env.DATAFORSEO_PASSWORD = "test";
delete process.env.ANTHROPIC_API_KEY;
execSync("npx prisma migrate deploy", { stdio: "ignore", env: process.env });

const calls: string[] = [];
const bodies: { url: string; body: Record<string, unknown> }[] = [];
globalThis.fetch = (async (url: string, init?: RequestInit) => {
  calls.push(String(url));
  const body = JSON.parse(String(init?.body ?? "[{}]"))[0] ?? {};
  bodies.push({ url: String(url), body });
  let result: Record<string, unknown>;
  if (String(url).includes("llm_scraper")) {
    result = {
      model: "gpt-4o",
      markdown: `Para "${body.keyword}": 1. **Rival Uno** es popular. 2. **Acme** destaca. Más en acme.example.`,
      sources: [{ title: "Reseña", url: "https://www.acme.example/blog", domain: "acme.example" }],
    };
  } else if (String(url).includes("gemini")) {
    throw new Error("simulated network failure");
  } else {
    result = {
      model_name: body.model_name,
      items: [{ type: "message", sections: [{ type: "text", text: "Te recomiendo Rival Uno y también ÁCME.", annotations: [{ title: "Rival", url: "https://rival1.example/x" }] }] }],
    };
  }
  return new Response(JSON.stringify({ status_code: 20000, status_message: "Ok.", tasks: [{ status_code: 20000, status_message: "Ok.", cost: 0.002, result: [result] }] }));
}) as typeof fetch;

async function main() {
  const { db } = await import("../src/lib/db");
  const { startRun } = await import("../src/lib/runner");
  const { projectDashboard } = await import("../src/lib/stats");
  const p = await db.project.create({
    data: {
      name: "Acme", domain: "acme.example",
      competitors: JSON.stringify([{ name: "Rival Uno", domain: "rival1.example", aliases: [] }]),
      prompts: { create: [{ text: "mejor app?" }, { text: "alternativas?" }] },
    },
  });
  const { done } = await startRun(p.id);
  await done;
  const d = await projectDashboard(p.id);
  const assert = (c: unknown, m: string) => { if (!c) { console.error("FAIL:", m); process.exitCode = 1; } else console.log("ok  ", m); };
  assert(calls.length === 8, `8 llamadas (2 prompts × 4 IAs), hubo ${calls.length}`);
  assert(d.latest?.status === "done", "corrida terminada");
  assert(d.kpis.errors === 2, "2 errores de Gemini registrados");
  assert(d.kpis.answers === 6, "6 respuestas válidas");
  assert(d.kpis.visibility === 100, `visibilidad 100% (tildes/mayúsculas normalizadas), fue ${d.kpis.visibility}`);
  const chat = d.responses.find((r) => r.engine === "chatgpt")!;
  assert(chat.hits.find((h) => h.own)?.position === 2, "ChatGPT: Acme en posición #2");
  assert(chat.hits.find((h) => h.own)?.cited, "ChatGPT: dominio propio citado (www. quitado)");
  const claude = d.responses.find((r) => r.engine === "claude")!;
  assert(claude.sources[0]?.domain === "rival1.example", "Claude: fuente extraída de annotations");
  assert(Math.abs((d.latest?.costUsd ?? 0) - 0.012) < 1e-9, "costo sumado = 6 × $0.002");
  // Localización: ChatGPT por ubicación (Perú = 2604); Claude, Gemini y Perplexity con mensaje de sistema de país
  const byEngine = (k: string) => bodies.filter((b) => b.url.includes(`/${k}/`)).map((b) => b.body);
  assert(byEngine("chat_gpt").every((b) => b.location_code === 2604 && !b.system_message), "ChatGPT: ubicación Perú (2604), sin mensaje de sistema");
  for (const k of ["claude", "gemini", "perplexity"]) {
    assert(byEngine(k).every((b) => typeof b.system_message === "string" && /Perú/.test(b.system_message as string) && (b.system_message as string).length <= 500), `${k}: mensaje de sistema con Perú (≤ 500 caracteres)`);
  }
  await db.$disconnect();
  rmSync(DB, { force: true });
}
main();
