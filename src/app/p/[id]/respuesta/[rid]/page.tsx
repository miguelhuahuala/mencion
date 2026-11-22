import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { dateTime, showDemo, usd } from "@/lib/format";
import { parseJson, type BrandHit, type Engine, type Source } from "@/lib/types";
import { DemoBanner, EngineTag, SentimentChip } from "@/components/ui";
import { Markdown, plain } from "@/components/Markdown";

export const dynamic = "force-dynamic";
export const metadata = { title: "Respuesta" };

export default async function ResponsePage({ params }: { params: Promise<{ id: string; rid: string }> }) {
  const { id, rid } = await params;
  const r = await db.response.findUnique({ where: { id: rid }, include: { prompt: true, run: { include: { project: true } } } });
  if (!r || r.run.projectId !== id || (r.run.project.isDemo && !showDemo())) notFound();
  const hits = parseJson<BrandHit[]>(r.mentions, []);
  const sources = parseJson<Source[]>(r.sources, []);

  return (
    <div className="space-y-6">
      {r.run.project.isDemo && <DemoBanner />}
      <div>
        <Link href={`/p/${id}`} className="text-sm text-muted hover:text-ink">← {r.run.project.name}</Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">“{r.prompt.text}”</h1>
        <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
          <EngineTag engine={r.engine as Engine} /> <span className="font-mono text-xs">{r.model}</span> · {dateTime(r.createdAt)} · {usd(r.costUsd)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="card p-5 lg:col-span-2">
          <h2 className="label mb-3">Respuesta de la IA</h2>
          {r.error ? (
            <p className="text-sm text-bad">{r.error}</p>
          ) : (
            r.text ? <Markdown text={r.text} /> : <p className="text-sm text-muted">(respuesta vacía)</p>
          )}
        </article>

        <aside className="space-y-6">
          <div className="card p-5">
            <h2 className="label mb-3">Marcas detectadas</h2>
            <ul className="space-y-3 text-sm">
              {hits.map((h) => (
                <li key={h.brand}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={h.own ? "font-semibold" : ""}>{h.brand}</span>
                    <span className="flex items-center gap-1">
                      {h.mentioned ? <span className="chip bg-good-soft font-mono text-good">#{h.position}</span> : <span className="chip bg-surface text-muted">no</span>}
                      {h.cited && <span className="chip bg-accent-soft text-accent">fuente</span>}
                      <SentimentChip s={h.sentiment} />
                    </span>
                  </div>
                  {h.snippet && <p className="mt-1 text-xs text-muted">{plain(h.snippet)}</p>}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="label mb-3">Fuentes citadas ({sources.length})</h2>
            {sources.length === 0 ? (
              <p className="text-sm text-muted">Sin fuentes.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {sources.map((s) => (
                  <li key={s.url} className="truncate">
                    <a href={s.url} target="_blank" rel="noreferrer nofollow" className="text-accent hover:underline">{s.domain}</a>
                    <span className="text-muted"> — {s.title}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
