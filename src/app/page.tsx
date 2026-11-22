import Link from "next/link";
import { db } from "@/lib/db";
import { createProject } from "./actions";
import { ProjectForm } from "@/components/ProjectForm";
import { hasCredentials } from "@/lib/dataforseo";
import { showDemo, dateTime } from "@/lib/format";
import { parseJson, type BrandHit } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await db.project.findMany({
    where: showDemo() ? {} : { isDemo: false },
    orderBy: [{ isDemo: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { prompts: { where: { active: true } } } }, runs: { where: { status: "done" }, orderBy: { startedAt: "desc" }, take: 1 } },
  });

  const cards = await Promise.all(
    projects.map(async (p) => {
      const run = p.runs[0];
      if (!run) return { p, run: null, visibility: null };
      const rows = await db.response.findMany({ where: { runId: run.id, error: null }, select: { mentions: true } });
      const vis = rows.filter((r) => parseJson<BrandHit[]>(r.mentions, []).find((h) => h.own)?.mentioned).length;
      return { p, run, visibility: rows.length ? Math.round((vis / rows.length) * 100) : 0 };
    }),
  );

  return (
    <div className="space-y-10">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">¿Las IAs recomiendan tu marca?</h1>
        <p className="mt-2 text-muted">
          Mención pregunta lo mismo que tus clientes a ChatGPT, Claude, Gemini y Perplexity, y mide en cuántas respuestas apareces,
          en qué posición, con qué tono y qué fuentes citan — frente a tu competencia.
        </p>
      </section>

      {!hasCredentials() && (
        <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
          <strong>Falta conectar DataForSEO.</strong> Agrega <code className="font-mono">DATAFORSEO_LOGIN</code> y{" "}
          <code className="font-mono">DATAFORSEO_PASSWORD</code> en <code className="font-mono">.env</code> (credenciales de API de{" "}
          <a className="text-accent underline" href="https://app.dataforseo.com/api-access" target="_blank" rel="noreferrer">app.dataforseo.com/api-access</a>)
          para ejecutar consultas reales.
        </div>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Proyectos</h2>
        {cards.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay proyectos. Crea el primero abajo.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ p, run, visibility }) => (
              <Link key={p.id} href={`/p/${p.id}`} className="card block p-5 transition hover:border-accent/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-muted">{p.domain || "sin dominio"} · {p.country}</div>
                  </div>
                  {p.isDemo && <span className="chip bg-warn-soft text-warn">Demo</span>}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="kpi-num">{visibility === null ? "—" : `${visibility}%`}</div>
                    <div className="text-xs text-muted">visibilidad en la última corrida</div>
                  </div>
                  <div className="text-right text-xs text-muted">
                    {p._count.prompts} prompts
                    <br />
                    {run ? dateTime(run.startedAt) : "sin corridas"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-semibold">Nuevo proyecto</h2>
        <ProjectForm action={createProject} submitLabel="Crear proyecto" />
      </section>
    </div>
  );
}
