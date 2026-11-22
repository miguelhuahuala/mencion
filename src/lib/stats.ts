import { db } from "./db";
import { ENGINES, parseJson, type BrandHit, type Engine, type Source } from "./types";

export type ParsedResponse = {
  id: string;
  promptId: string;
  engine: Engine;
  model: string;
  text: string;
  error: string | null;
  sources: Source[];
  hits: BrandHit[];
};

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}

export async function projectDashboard(projectId: string) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { prompts: { orderBy: { createdAt: "asc" } } },
  });
  const runs = await db.run.findMany({ where: { projectId }, orderBy: { startedAt: "asc" } });
  const latest = [...runs].reverse().find((r) => r.status === "done") ?? null;
  const running = runs.find((r) => r.status === "running") ?? null;

  const rows = latest ? await db.response.findMany({ where: { runId: latest.id } }) : [];
  const responses: ParsedResponse[] = rows.map((r) => ({
    id: r.id,
    promptId: r.promptId,
    engine: r.engine as Engine,
    model: r.model,
    text: r.text,
    error: r.error,
    sources: parseJson<Source[]>(r.sources, []),
    hits: parseJson<BrandHit[]>(r.mentions, []),
  }));
  const ok = responses.filter((r) => !r.error);
  const ownHit = (r: ParsedResponse) => r.hits.find((h) => h.own);

  // Visibilidad: % de respuestas donde aparece la marca propia
  const visible = ok.filter((r) => ownHit(r)?.mentioned);
  const byEngine = ENGINES.map((engine) => {
    const set = ok.filter((r) => r.engine === engine);
    return { engine, total: set.length, visibility: pct(set.filter((r) => ownHit(r)?.mentioned).length, set.length) };
  }).filter((e) => e.total > 0);

  // Share of voice: menciones de cada marca sobre el total de menciones de marcas seguidas
  const brandNames = ok[0]?.hits.map((h) => ({ brand: h.brand, own: h.own })) ?? [];
  const counts = brandNames.map(({ brand, own }) => {
    const hitsFor = ok.map((r) => r.hits.find((h) => h.brand === brand)).filter((h): h is BrandHit => Boolean(h?.mentioned));
    const positions = hitsFor.map((h) => h.position!).filter(Boolean);
    return {
      brand,
      own,
      mentions: hitsFor.length,
      visibility: pct(hitsFor.length, ok.length),
      avgPosition: positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : null,
      cited: ok.filter((r) => r.hits.find((h) => h.brand === brand)?.cited).length,
      positive: hitsFor.filter((h) => h.sentiment === "positive").length,
      neutral: hitsFor.filter((h) => h.sentiment === "neutral").length,
      negative: hitsFor.filter((h) => h.sentiment === "negative").length,
    };
  });
  const totalMentions = counts.reduce((a, c) => a + c.mentions, 0);
  const shareOfVoice = counts
    .map((c) => ({ ...c, share: pct(c.mentions, totalMentions) }))
    .sort((a, b) => b.mentions - a.mentions);

  // Dominios más citados como fuente
  const domainCount = new Map<string, number>();
  for (const r of ok) for (const d of new Set(r.sources.map((s) => s.domain).filter(Boolean))) domainCount.set(d, (domainCount.get(d) ?? 0) + 1);
  const topDomains = [...domainCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([domain, count]) => ({ domain, count, share: pct(count, ok.length) }));

  // Tendencia: visibilidad propia por corrida terminada
  const doneRuns = runs.filter((r) => r.status === "done").slice(-14);
  const trendRows = doneRuns.length
    ? await db.response.findMany({ where: { runId: { in: doneRuns.map((r) => r.id) }, error: null }, select: { runId: true, mentions: true } })
    : [];
  const trend = doneRuns.map((run) => {
    const set = trendRows.filter((t) => t.runId === run.id);
    const vis = set.filter((t) => parseJson<BrandHit[]>(t.mentions, []).find((h) => h.own)?.mentioned).length;
    return { runId: run.id, date: run.startedAt, visibility: pct(vis, set.length), costUsd: run.costUsd };
  });

  const own = shareOfVoice.find((s) => s.own);
  return {
    project,
    latest,
    running,
    runsCount: runs.length,
    responses,
    kpis: {
      visibility: pct(visible.length, ok.length),
      answers: ok.length,
      errors: responses.length - ok.length,
      avgPosition: own?.avgPosition ?? null,
      share: own?.share ?? 0,
      citedIn: own?.cited ?? 0,
      cost: latest?.costUsd ?? 0,
    },
    byEngine,
    shareOfVoice,
    topDomains,
    trend,
  };
}

export type Dashboard = Awaited<ReturnType<typeof projectDashboard>>;
