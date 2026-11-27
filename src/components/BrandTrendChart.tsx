"use client";

import { useMemo, useState } from "react";

export type MetricKey = "visibility" | "share" | "position" | "cited";
export type TrendPoint = { date: string } & Record<MetricKey, number | null>;
export type BrandSeries = { brand: string; own: boolean; color: string; points: TrendPoint[] };

/** Métricas que se pueden ver en el gráfico. La posición va invertida: #1 arriba. */
const METRICS: Record<MetricKey, { label: string; desc: string; kind: "pct" | "pos" }> = {
  visibility: { label: "Visibilidad", desc: "% de respuestas que mencionan a cada marca.", kind: "pct" },
  share: { label: "Share of voice", desc: "Qué parte de todas las menciones de marcas corresponde a cada una.", kind: "pct" },
  position: { label: "Posición media", desc: "Lugar promedio en que la IA nombra a cada marca. Más arriba es mejor (#1).", kind: "pos" },
  cited: { label: "Citado como fuente", desc: "% de respuestas que enlazan al dominio de cada marca.", kind: "pct" },
};
const ORDER: MetricKey[] = ["visibility", "share", "position", "cited"];

const W = 720;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

// Hora de Perú fija: así coinciden el servidor (UTC) y el navegador, y todos ven la misma fecha
const TZ = "America/Lima";
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", timeZone: TZ });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TZ });
/** Etiqueta de cada medición: solo la fecha, o fecha y hora si ese día hubo más de una. */
function pointLabels(dates: string[]) {
  const days = dates.map(fmtDate);
  return dates.map((iso, i) => (days.filter((d) => d === days[i]).length > 1 ? fmtDateTime(iso) : days[i]));
}

/**
 * Evolución de cada marca por medición, con selector de métrica (una línea por marca, con su color).
 * Hover: línea guía + tooltip con todas las marcas ordenadas. Leyenda siempre visible (clic para ocultar);
 * la marca propia va más gruesa y con etiqueta directa. Con una sola medición: un punto por marca con su etiqueta.
 */
export function BrandTrendChart({ series }: { series: BrandSeries[] }) {
  const n = series[0]?.points.length ?? 0;
  const [metric, setMetric] = useState<MetricKey>("visibility");
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const m = METRICS[metric];
  const pos = m.kind === "pos";

  // La marca propia se dibuja al final para quedar por encima
  const ordered = useMemo(() => [...series].sort((a, b) => Number(a.own) - Number(b.own)), [series]);
  const visible = ordered.filter((s) => !hidden.has(s.brand));
  const labels = useMemo(() => pointLabels((series[0]?.points ?? []).map((p) => p.date)), [series]);
  const val = (s: BrandSeries, i: number) => s.points[i]?.[metric] ?? null;
  const fmt = (v: number) => (pos ? `#${v.toFixed(1)}` : `${v}%`);

  // Escala: porcentajes de 0 a 100; posición de #1 (arriba) a la peor posición vista (mínimo #3)
  const maxPos = pos ? Math.max(3, Math.ceil(Math.max(0, ...visible.flatMap((s) => s.points.map((p) => p[metric] ?? 0))))) : 100;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n <= 1 ? (W - PAD.left - PAD.right) / 2 : (i * (W - PAD.left - PAD.right)) / (n - 1));
  const y = (v: number) => (pos ? PAD.top + ((v - 1) / (maxPos - 1)) * plotH : PAD.top + (1 - v / 100) * plotH);
  const grid = pos ? Array.from({ length: maxPos }, (_, k) => k + 1).filter((g) => maxPos <= 6 || g === 1 || g === maxPos || g === Math.round((maxPos + 1) / 2)) : [0, 25, 50, 75, 100];

  if (!n) return <p className="text-sm text-muted">Aún no hay mediciones.</p>;

  const path = (s: BrandSeries) => {
    let d = "";
    let pen = false;
    s.points.forEach((_, i) => {
      const v = val(s, i);
      if (v == null) return void (pen = false);
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
      pen = true;
    });
    return d.trim();
  };

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const i = n <= 1 ? 0 : Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const tooltipRows =
    hover == null
      ? []
      : visible
          .map((s) => ({ s, v: val(s, hover) }))
          .filter((r): r is { s: BrandSeries; v: number } => r.v != null)
          .sort((a, b) => (pos ? a.v - b.v : b.v - a.v));
  const own = series.find((s) => s.own);
  let ownLastIdx = -1;
  if (own) for (let i = n - 1; i >= 0; i--) if (val(own, i) != null) { ownLastIdx = i; break; }
  const ownLast = own && ownLastIdx >= 0 ? val(own, ownLastIdx) : null;

  // Una sola medición: etiquetas al lado de cada punto, separadas si hay empates
  const singleLabels = (() => {
    if (n !== 1) return [];
    const rows = visible
      .map((s) => ({ s, v: val(s, 0) }))
      .filter((r): r is { s: BrandSeries; v: number } => r.v != null)
      .sort((a, b) => a.v * (pos ? 1 : -1) - b.v * (pos ? 1 : -1) || Number(b.s.own) - Number(a.s.own));
    let lastY = -Infinity;
    return rows.map(({ s, v }) => {
      const ly = Math.max(y(v) + 4, lastY + 16);
      lastY = ly;
      return { s, v, ly };
    });
  })();

  return (
    <div>
      {/* Selector de métrica */}
      <div role="tablist" aria-label="Métrica" className="mb-3 flex flex-wrap gap-1.5">
        {ORDER.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={metric === k}
            onClick={() => setMetric(k)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${metric === k ? "bg-accent text-white" : "border border-line bg-white text-muted hover:text-ink"}`}
          >
            {METRICS[k].label}
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-muted">{m.desc} Pasa el cursor para ver los valores; pulsa una marca en la leyenda para ocultarla.</p>

      {/* Leyenda: clic para ocultar/mostrar una marca */}
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {series.map((s) => {
          const off = hidden.has(s.brand);
          return (
            <li key={s.brand}>
              <button
                type="button"
                onClick={() => setHidden((h) => { const nh = new Set(h); if (nh.has(s.brand)) nh.delete(s.brand); else nh.add(s.brand); return nh; })}
                aria-pressed={!off}
                className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-surface ${off ? "text-muted line-through opacity-60" : "text-ink"} ${s.own ? "font-semibold" : ""}`}
              >
                <span aria-hidden className="inline-block h-0.5 w-4 rounded-full" style={{ background: s.color, height: s.own ? 3 : 2 }} />
                {s.brand}
                {s.own && <span className="text-muted">(tú)</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${m.label} por marca en cada medición`}>
          {grid.map((g) => (
            <g key={g}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeDasharray={(pos ? g !== maxPos : g) ? "3 4" : undefined} />
              <text x={PAD.left - 8} y={y(g) + 4} fontSize="11" fill="var(--color-muted)" textAnchor="end">{pos ? `#${g}` : `${g}%`}</text>
            </g>
          ))}
          {series[0].points.map((p, i) =>
            n <= 6 || i === 0 || i === n - 1 || (i % Math.ceil(n / 6) === 0 && n - 1 - i >= Math.ceil(n / 6)) ? (
              <text key={p.date} x={x(i)} y={H - 8} fontSize="11" fill="var(--color-muted)" textAnchor={i === 0 && n > 1 ? "start" : i === n - 1 && n > 1 ? "end" : "middle"}>
                {labels[i]}
              </text>
            ) : null,
          )}

          {hover != null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="2 3" />}

          {n > 1 &&
            visible.map((s) => (
              <g key={s.brand}>
                <path d={path(s)} fill="none" stroke={s.color} strokeWidth={s.own ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" />
                {s.points.map((_, i) => {
                  const v = val(s, i);
                  return v == null ? null : <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5 : s.own ? 4 : 3} fill={s.color} stroke="white" strokeWidth={2} />;
                })}
              </g>
            ))}

          {n === 1 && (
            <>
              {visible.map((s) => {
                const v = val(s, 0);
                return v == null ? null : <circle key={`dot-${s.brand}`} cx={x(0)} cy={y(v)} r={s.own ? 8 : 6} fill={s.color} stroke="white" strokeWidth={2} />;
              })}
              {singleLabels.map(({ s, v, ly }) => (
                <text key={`label-${s.brand}`} x={x(0) + 16} y={ly} fontSize="12" fontWeight={s.own ? 700 : 400} fill="var(--color-ink)">
                  {s.brand} {fmt(v)}
                </text>
              ))}
            </>
          )}

          {n > 1 && own && ownLast != null && !hidden.has(own.brand) && hover == null && (
            <text x={Math.min(x(ownLastIdx) + 8, W - PAD.right - 2)} y={y(ownLast) - 8} fontSize="12" fontWeight={700} fill="var(--color-ink)" textAnchor={ownLastIdx === n - 1 ? "end" : "start"}>
              {own.brand} {fmt(ownLast)}
            </text>
          )}

          <rect
            x={PAD.left - 10}
            y={0}
            width={W - PAD.left - PAD.right + 20}
            height={H}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {hover != null && tooltipRows.length > 0 && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg"
            style={x(hover) > W * 0.6 ? { right: `${((W - x(hover)) / W) * 100 + 2}%` } : { left: `${(x(hover) / W) * 100 + 2}%` }}
          >
            <div className="mb-1 font-semibold text-ink">{fmtDateTime(series[0].points[hover].date)} · {m.label}</div>
            <ul className="space-y-0.5">
              {tooltipRows.map(({ s, v }) => (
                <li key={s.brand} className="flex items-center justify-between gap-3">
                  <span className={`flex items-center gap-1.5 ${s.own ? "font-semibold text-ink" : "text-muted"}`}>
                    <span aria-hidden className="inline-block size-2 rounded-full" style={{ background: s.color }} />
                    {s.brand}
                  </span>
                  <span className="font-mono tabular-nums text-ink">{fmt(v)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {n === 1 && <p className="mt-2 text-xs text-muted">Con la próxima medición verás cómo se mueve cada marca.</p>}
    </div>
  );
}
