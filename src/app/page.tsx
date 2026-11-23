import Link from "next/link";
import { db } from "@/lib/db";
import { createProject } from "./actions";
import { ProjectForm } from "@/components/ProjectForm";
import { suggestLeftFor } from "@/lib/suggest";
import { Landing } from "@/components/Landing";
import { hasCredentials } from "@/lib/dataforseo";
import { currentUser, isAdmin } from "@/lib/auth";
import { limitsFor } from "@/lib/limits";
import { showDemo, dateTime } from "@/lib/format";
import { parseJson, type BrandHit } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string; cuenta?: string; bienvenida?: string }> }) {
  const user = await currentUser();
  const { error, cuenta, bienvenida } = await searchParams;
  if (!user) return <Landing deleted={cuenta === "eliminada"} />;
  const admin = isAdmin(user);
  const limits = limitsFor(user);

  const projects = await db.project.findMany({
    where: admin
      ? showDemo() ? {} : { isDemo: false }
      : { OR: [{ userId: user.id }, ...(showDemo() ? [{ isDemo: true }] : [])] },
    orderBy: [{ isDemo: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { email: true } },
      _count: { select: { prompts: { where: { active: true } } } },
      runs: { where: { status: "done" }, orderBy: { startedAt: "desc" }, take: 1 },
    },
  });
  const ownCount = projects.filter((p) => p.userId === user.id).length;
  const canCreate = ownCount < limits.maxProjects;

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tus proyectos</h1>
          <p className="text-sm text-muted">
            {admin
              ? "Cuenta de administrador: sin límites de plan."
              : `Plan gratis: ${limits.maxProjects} proyecto · hasta ${limits.maxPrompts} prompts · 1 medición cada ${limits.intervalDays} días en 4 IAs.`}
          </p>
        </div>
      </div>

      {admin && !hasCredentials() && (
        <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
          <strong>Falta conectar DataForSEO.</strong> Agrega <code className="font-mono">DATAFORSEO_LOGIN</code> y{" "}
          <code className="font-mono">DATAFORSEO_PASSWORD</code> en <code className="font-mono">.env</code>.
        </div>
      )}
      {bienvenida && (
        <div role="status" className="rounded-xl border border-good/30 bg-good-soft px-4 py-3 text-sm text-good">
          ¡Listo! Tu correo está confirmado. Crea tu primer proyecto para empezar a medir.
        </div>
      )}
      {error && <div role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">{error}</div>}

      {cards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ p, run, visibility }) => (
            <Link key={p.id} href={`/p/${p.id}`} className="card block p-5 transition hover:border-accent/40 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold">{p.name}</div>
                  <div className="truncate text-xs text-muted">
                    {p.domain || "sin dominio"} · {p.country}
                    {admin && p.user && p.userId !== user.id ? ` · ${p.user.email}` : ""}
                  </div>
                </div>
                {p.isDemo && <span className="chip bg-warn-soft text-warn">Demo</span>}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="kpi-num">{visibility === null ? "—" : `${visibility}%`}</div>
                  <div className="text-xs text-muted">visibilidad en la última medición</div>
                </div>
                <div className="text-right text-xs text-muted">
                  {p._count.prompts} prompts
                  <br />
                  {run ? dateTime(run.startedAt) : "sin mediciones"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {canCreate ? (
        <section className="card p-6">
          <h2 className="mb-1 font-semibold">{ownCount === 0 ? "Crea tu primer proyecto" : "Nuevo proyecto"}</h2>
          <p className="mb-4 text-sm text-muted">Después de crearlo podrás lanzar la medición con el botón “Ejecutar ahora”.</p>
          <ProjectForm action={createProject} submitLabel="Crear proyecto" maxPrompts={limits.maxPrompts} suggestLeft={await suggestLeftFor(user)} />
        </section>
      ) : (
        <p className="text-sm text-muted">Ya usas el proyecto de tu plan. Puedes cambiar su marca, competidores y prompts en <strong>Ajustes</strong>.</p>
      )}
    </div>
  );
}
