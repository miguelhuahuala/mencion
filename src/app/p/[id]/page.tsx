import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { findProjectFor, runAvailability } from "@/lib/limits";
import { projectDashboard } from "@/lib/stats";
import { hasCredentials } from "@/lib/dataforseo";
import { canAnalyzeSentiment } from "@/lib/analysis";
import { dateShort, dateTime, usd } from "@/lib/format";
import { ENGINE_LABEL } from "@/lib/types";
import { Bar, DemoBanner, EngineTag, Kpi, Section, TrendLine } from "@/components/ui";
import { runNow } from "../../actions";
import { AutoRefresh } from "./AutoRefresh";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await findProjectFor(id, await currentUser());
  return { title: p?.name ?? "Proyecto" };
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await currentUser();
  if (!(await findProjectFor(id, user))) notFound();

  const d = await projectDashboard(id);
  const { project, kpis } = d;
  const activePrompts = project.prompts.filter((p) => p.active);
  const engines = d.byEngine.map((e) => e.engine);
  const hasSentiment = d.shareOfVoice.some((s) => s.positive + s.neutral + s.negative > 0);
  const avail = project.isDemo || d.running ? null : await runAvailability(id, user);
  const blocked = avail && !avail.ok ? avail : null;

  return (
    <div className="space-y-6">
      {d.running && <AutoRefresh />}
      {project.isDemo && <DemoBanner />}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-ink">← Proyectos</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-sm text-muted">
            {project.domain || "sin dominio"} · {project.country} · {activePrompts.length} prompts ·{" "}
            {d.latest ? `última corrida ${dateTime(d.latest.startedAt)}` : "sin corridas todavía"}
          </p>
        </div>
        {!project.isDemo && (
          <div className="flex gap-2">
            <Link href={`/p/${id}/ajustes`} className="btn-ghost">Ajustes</Link>
            <form action={runNow}>
              <input type="hidden" name="id" value={id} />
              <button className="btn-primary" disabled={Boolean(d.running) || !hasCredentials() || Boolean(blocked)}>
                {d.running ? "Ejecutando…" : "Ejecutar ahora"}
              </button>
            </form>
          </div>
        )}
      </div>

      {blocked && (
        <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
          {blocked.reason === "interval"
            ? <>Tu plan incluye una medición por semana. La próxima estará disponible el <strong className="text-ink">{dateTime(blocked.nextAt!)}</strong>.</>
            : "Alcanzamos el límite de mediciones de este mes. Vuelve a intentarlo el próximo mes."}
        </div>
      )}
      {!project.isDemo && !hasCredentials() && (
        <div className="rounded-xl border border-line bg-white px-4 py-3 text-sm">
          Para ejecutar, agrega <code className="font-mono">DATAFORSEO_LOGIN</code> y <code className="font-mono">DATAFORSEO_PASSWORD</code> en{" "}
          <code className="font-mono">.env</code> y reinicia el servidor.
        </div>
      )}
      {error && <div className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">{error}</div>}
      {d.running && (
        <div className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
          Consultando {activePrompts.length} prompts × 4 IAs… puede tardar unos minutos. Esta página se actualiza sola.
        </div>
      )}

      {!d.latest ? (
        <div className="card p-10 text-center text-muted">
          Todavía no hay resultados. Pulsa <strong>Ejecutar ahora</strong> para hacer la primera medición.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Kpi label="Visibilidad" value={`${kpis.visibility}%`} hint={`de ${kpis.answers} respuestas te mencionan`} />
            <Kpi label="Share of voice" value={`${kpis.share}%`} hint="de las menciones de marcas" />
            <Kpi label="Posición media" value={kpis.avgPosition ? `#${kpis.avgPosition.toFixed(1)}` : "—"} hint="entre las marcas citadas" />
            <Kpi label="Citado como fuente" value={kpis.citedIn} hint="respuestas enlazan tu dominio" />
            <Kpi label="Costo corrida" value={usd(kpis.cost)} hint={kpis.errors ? `${kpis.errors} consultas con error` : "DataForSEO + LLM"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Section title="Tendencia de visibilidad" desc="% de respuestas que mencionan tu marca, por corrida">
                <TrendLine points={d.trend.map((t) => ({ label: dateShort(t.date), value: t.visibility }))} />
              </Section>
            </div>
            <div className="lg:col-span-2">
              <Section title="Por IA" desc="Visibilidad en cada motor">
                <ul className="space-y-3">
                  {d.byEngine.map((e) => (
                    <li key={e.engine}>
                      <div className="mb-1 flex justify-between text-sm">
                        <EngineTag engine={e.engine} />
                        <span className="font-mono tabular-nums">{e.visibility}%</span>
                      </div>
                      <Bar value={e.visibility} own />
                    </li>
                  ))}
                </ul>
              </Section>
            </div>
          </div>

          <Section
            title="Tú vs. competencia"
            desc="Menciones en la última corrida"
            aside={!hasSentiment && !canAnalyzeSentiment() ? <span className="text-xs text-muted">Sentimiento: agrega ANTHROPIC_API_KEY</span> : undefined}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="pb-2 font-semibold">Marca</th>
                    <th className="w-1/3 pb-2 font-semibold">Visibilidad</th>
                    <th className="pb-2 text-right font-semibold">Share</th>
                    <th className="pb-2 text-right font-semibold">Pos. media</th>
                    <th className="pb-2 text-right font-semibold">Citada</th>
                    {hasSentiment && <th className="pb-2 text-right font-semibold">+ / = / −</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {d.shareOfVoice.map((s) => (
                    <tr key={s.brand} className={s.own ? "font-semibold" : ""}>
                      <td className="py-2.5">
                        {s.brand} {s.own && <span className="chip ml-1 bg-accent-soft text-accent">tú</span>}
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <Bar value={s.visibility} own={s.own} />
                          <span className="w-10 text-right font-mono text-xs tabular-nums">{s.visibility}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums">{s.share}%</td>
                      <td className="py-2.5 text-right font-mono tabular-nums">{s.avgPosition ? `#${s.avgPosition.toFixed(1)}` : "—"}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums">{s.cited}</td>
                      {hasSentiment && (
                        <td className="py-2.5 text-right font-mono text-xs tabular-nums">
                          <span className="text-good">{s.positive}</span> / <span className="text-muted">{s.neutral}</span> / <span className="text-bad">{s.negative}</span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Prompt por prompt" desc="¿Te menciona cada IA? El número es tu posición entre las marcas nombradas. Pulsa para leer la respuesta.">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="pb-2 font-semibold">Prompt</th>
                    {engines.map((e) => (
                      <th key={e} className="pb-2 text-center font-semibold">{ENGINE_LABEL[e]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {activePrompts.map((p) => (
                    <tr key={p.id}>
                      <td className="max-w-md py-2.5 pr-4">{p.text}</td>
                      {engines.map((e) => {
                        const r = d.responses.find((x) => x.promptId === p.id && x.engine === e);
                        const own = r?.hits.find((h) => h.own);
                        let cell: React.ReactNode = <span className="text-muted">·</span>;
                        if (r?.error) cell = <span className="chip bg-bad-soft text-bad">error</span>;
                        else if (own?.mentioned) cell = <span className="chip bg-good-soft font-mono text-good">#{own.position}</span>;
                        else if (r) cell = <span className="chip bg-surface text-muted">no</span>;
                        return (
                          <td key={e} className="py-2.5 text-center">
                            {r ? <Link href={`/p/${id}/respuesta/${r.id}`} className="hover:opacity-70">{cell}</Link> : cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Fuentes que más citan las IAs" desc="Dominios enlazados en las respuestas: ahí conviene tener presencia (PR, reseñas, artículos).">
            {d.topDomains.length === 0 ? (
              <p className="text-sm text-muted">Las respuestas de esta corrida no incluyeron fuentes.</p>
            ) : (
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {d.topDomains.map((t) => (
                  <li key={t.domain}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className={t.domain === project.domain ? "font-semibold text-accent" : ""}>{t.domain}</span>
                      <span className="font-mono text-xs tabular-nums text-muted">{t.count} resp. · {t.share}%</span>
                    </div>
                    <Bar value={t.share} own={t.domain === project.domain} />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
