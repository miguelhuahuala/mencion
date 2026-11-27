import { db } from "./db";
import { ENGINES, parseJson, type BrandHit, type Engine, type Source } from "./types";
import { OTHER_COLOR, competitorsOf, ownBrand } from "./projects";
import { allTags, hasTag } from "./tags";

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

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** ¿Este registro de una medición corresponde a la marca? La propia por "own"; las demás por nombre sin mayúsculas ni tildes. */
function sameBrand(h: BrandHit, b: { name: string; own: boolean }) {
  return b.own ? h.own : !h.own && fold(h.brand) === fold(b.name);
}

/** tag: si se indica, todas las métricas se calculan solo con los prompts que tienen esa etiqueta. */
export async function projectDashboard(projectId: string, tag?: string | null) {
  const project = await db.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { prompts: { orderBy: { createdAt: "asc" } } },
  });
  const tags = allTags(project.prompts.filter((p) => p.active));
  const activeTag = tag ? tags.find((t) => t.toLowerCase() === tag.toLowerCase()) ?? null : null;
  // Incluye prompts desactivados con esa etiqueta, para no perder su historial en la tendencia
  const inTag = activeTag ? new Set(project.prompts.filter((p) => hasTag(p, activeTag)).map((p) => p.id)) : null;
  const keep = (r: { promptId: string }) => !inTag || inTag.has(r.promptId);
  const runs = await db.run.findMany({ where: { projectId }, orderBy: { startedAt: "asc" } });
  const latest = [...runs].reverse().find((r) => r.status === "done") ?? null;
  const running = runs.find((r) => r.status === "running") ?? null;
  // Si la última medición falló, se muestran sus errores en el dashboard
  const lastRun = runs[runs.length - 1] ?? null;
  const failedRun = lastRun?.status === "failed" ? lastRun : null;
  const failedErrors = failedRun
    ? [
        ...new Set(
          (await db.response.findMany({ where: { runId: failedRun.id, error: { not: null } }, select: { engine: true, error: true } })).map(
            (r) => `${r.engine}: ${r.error}`,
          ),
        ),
      ].slice(0, 6)
    : [];

  const rows = (latest ? await db.response.findMany({ where: { runId: latest.id } }) : []).filter(keep);
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

  // Marcas actuales del proyecto. Cada medición guarda el nombre que tenía la marca ese día, así que se emparejan
  // así: la propia por la marca "own" (sobrevive a cambios de nombre) y los competidores sin distinguir mayúsculas ni tildes.
  const brands = [{ ...ownBrand(project), own: true }, ...competitorsOf(project).map((c) => ({ ...c, own: false }))];
  const ownHit = (r: ParsedResponse) => r.hits.find((h) => h.own);
  const hitOf = (hits: BrandHit[], b: { name: string; own: boolean }) => hits.find((h) => sameBrand(h, b));

  // Visibilidad: % de respuestas donde aparece la marca propia
  const visible = ok.filter((r) => ownHit(r)?.mentioned);
  const byEngine = ENGINES.map((engine) => {
    const set = ok.filter((r) => r.engine === engine);
    return { engine, total: set.length, visibility: pct(set.filter((r) => ownHit(r)?.mentioned).length, set.length) };
  }).filter((e) => e.total > 0);

  // Share of voice: menciones de cada marca sobre el total de menciones de marcas seguidas.
  // Solo las marcas que se midieron en esta corrida (una agregada después no aparece con 0 %).
  const measured = brands.filter((b) => ok.some((r) => hitOf(r.hits, b)));
  const counts = measured.map((b) => {
    const hitsFor = ok.map((r) => hitOf(r.hits, b)).filter((h): h is BrandHit => Boolean(h?.mentioned));
    const positions = hitsFor.map((h) => h.position!).filter(Boolean);
    return {
      brand: b.name,
      own: b.own,
      color: b.color ?? OTHER_COLOR,
      mentions: hitsFor.length,
      visibility: pct(hitsFor.length, ok.length),
      avgPosition: positions.length ? positions.reduce((a, c) => a + c, 0) / positions.length : null,
      cited: ok.filter((r) => hitOf(r.hits, b)?.cited).length,
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
  for (const r of ok) for (const d of new Set(r.sources.map((s) => s.domain.replace(/^www\./, "")).filter(Boolean))) domainCount.set(d, (domainCount.get(d) ?? 0) + 1);
  const topDomains = [...domainCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([domain, count]) => ({ domain, count, share: pct(count, ok.length) }));

  // Tendencia: visibilidad propia por corrida terminada
  const doneRuns = runs.filter((r) => r.status === "done").slice(-14);
  const trendRows = doneRuns.length
    ? await db.response.findMany({ where: { runId: { in: doneRuns.map((r) => r.id) }, error: null }, select: { runId: true, promptId: true, mentions: true } }).then((rs) => rs.filter(keep))
    : [];
  const trend = doneRuns.map((run) => {
    const set = trendRows.filter((t) => t.runId === run.id);
    const vis = set.filter((t) => parseJson<BrandHit[]>(t.mentions, []).find((h) => h.own)?.mentioned).length;
    return { runId: run.id, date: run.startedAt, visibility: pct(vis, set.length), costUsd: run.costUsd };
  });

  // Evolución por marca y por medición de las 4 métricas (visibilidad, share of voice, posición media y citado como fuente)
  const parsedTrend = trendRows.map((t) => ({ runId: t.runId, hits: parseJson<BrandHit[]>(t.mentions, []) }));
  const brandTrend = brands.map((b) => ({
    brand: b.name,
    own: b.own,
    color: b.color ?? OTHER_COLOR,
    points: doneRuns.map((run) => {
      const set = parsedTrend.filter((t) => t.runId === run.id);
      const mine = set.map((t) => hitOf(t.hits, b));
      // null = esa marca aún no se seguía en esa medición
      if (!mine.some(Boolean)) return { date: run.startedAt, visibility: null, share: null, position: null, cited: null };
      const mentioned = mine.filter((h): h is BrandHit => Boolean(h?.mentioned));
      const allMentions = set.reduce((a, t) => a + t.hits.filter((h) => h.mentioned).length, 0);
      const positions = mentioned.map((h) => h.position).filter((p): p is number => p != null);
      return {
        date: run.startedAt,
        visibility: pct(mentioned.length, set.length),
        share: pct(mentioned.length, allMentions),
        position: positions.length ? Math.round((positions.reduce((a, c) => a + c, 0) / positions.length) * 10) / 10 : null,
        cited: pct(mine.filter((h) => h?.cited).length, set.length),
      };
    }),
  }));

  const own = shareOfVoice.find((s) => s.own);
  return {
    project,
    tags,
    activeTag,
    latest,
    running,
    failedRun,
    failedErrors,
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
    brandTrend,
  };
}

export type Dashboard = Awaited<ReturnType<typeof projectDashboard>>;
