"use client";

import { useMemo, useState } from "react";

export type BrandSeries = { brand: string; own: boolean; color: string; points: { date: string; value: number | null }[] };

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
 * Visibilidad de cada marca por medición (una línea por marca, con el color que eligió el usuario).
 * Hover: línea guía + tooltip con todas las marcas ordenadas. Leyenda siempre visible; la marca propia
 * va más gruesa y con etiqueta directa al final de su línea.
 */
export function BrandTrendChart({ series }: { series: BrandSeries[] }) {
  const n = series[0]?.points.length ?? 0;
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const x = (i: number) => PAD.left + (n <= 1 ? (W - PAD.left - PAD.right) / 2 : (i * (W - PAD.left - PAD.right)) / (n - 1));
  const y = (v: number) => PAD.top + (1 - v / 100) * (H - PAD.top - PAD.bottom);

  // La marca propia se dibuja al final para quedar por encima
  const ordered = useMemo(() => [...series].sort((a, b) => Number(a.own) - Number(b.own)), [series]);
  const labels = useMemo(() => pointLabels((series[0]?.points ?? []).map((p) => p.date)), [series]);
  const visible = ordered.filter((s) => !hidden.has(s.brand));

  if (!n) return <p className="text-sm text-muted">Aún no hay mediciones.</p>;

  // Con una sola medición no hay "línea": se muestran barras para que los empates no queden encimados
  if (n === 1) {
    const rows = [...series]
      .map((s) => ({ s, v: s.points[0].value }))
      .filter((r): r is { s: BrandSeries; v: number } => r.v != null)
      .sort((a, b) => b.v - a.v || Number(b.s.own) - Number(a.s.own));
    return (
      <div>
        <p className="mb-3 text-xs text-muted">Medición del {fmtDate(series[0].points[0].date)}</p>
        <ul className="space-y-3">
          {rows.map(({ s, v }) => (
            <li key={s.brand} className="grid grid-cols-[minmax(0,10rem)_1fr_3rem] items-center gap-3 text-sm">
              <span className={`flex items-center gap-2 truncate ${s.own ? "font-semibold" : ""}`}>
                <span aria-hidden className="inline-block size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                {s.brand} {s.own && <span className="text-xs font-normal text-muted">(tú)</span>}
              </span>
              <span className="h-2.5 overflow-hidden rounded-full bg-surface" role="presentation">
                <span className="block h-full rounded-full" style={{ width: `${Math.max(v, v > 0 ? 2 : 0)}%`, background: s.color }} />
              </span>
              <span className="text-right font-mono tabular-nums">{v}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Desde la próxima medición verás aquí una línea por marca con su evolución.</p>
      </div>
    );
  }

  const path = (s: BrandSeries) => {
    let d = "";
    let pen = false;
    s.points.forEach((p, i) => {
      if (p.value == null) return void (pen = false);
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)} `;
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
          .map((s) => ({ s, v: s.points[hover]?.value }))
          .filter((r): r is { s: BrandSeries; v: number } => r.v != null)
          .sort((a, b) => b.v - a.v);
  const own = series.find((s) => s.own);
  const lastOwn = own ? [...own.points].reverse().find((p) => p.value != null) : undefined;
  const lastOwnIdx = own && lastOwn ? own.points.lastIndexOf(lastOwn) : -1;

  return (
    <div>
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
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Visibilidad por marca en cada medición">
          {[0, 25, 50, 75, 100].map((g) => (
            <g key={g}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeDasharray={g ? "3 4" : undefined} />
              <text x={PAD.left - 8} y={y(g) + 4} fontSize="11" fill="var(--color-muted)" textAnchor="end">{g}%</text>
            </g>
          ))}
          {series[0].points.map((p, i) =>
            n <= 6 || i === 0 || i === n - 1 || (i % Math.ceil(n / 6) === 0 && n - 1 - i >= Math.ceil(n / 6)) ? (
              <text key={i} x={x(i)} y={H - 8} fontSize="11" fill="var(--color-muted)" textAnchor={i === 0 && n > 1 ? "start" : i === n - 1 && n > 1 ? "end" : "middle"}>
                {labels[i]}
              </text>
            ) : null,
          )}

          {hover != null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="2 3" />}

          {visible.map((s) => (
            <g key={s.brand}>
              <path d={path(s)} fill="none" stroke={s.color} strokeWidth={s.own ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" opacity={hover == null || !s.own ? 0.95 : 1} />
              {s.points.map((p, i) =>
                p.value == null ? null : (
                  <circle key={i} cx={x(i)} cy={y(p.value)} r={hover === i ? 5 : s.own ? 4 : 3} fill={s.color} stroke="white" strokeWidth={2} />
                ),
              )}
            </g>
          ))}

          {own && lastOwn?.value != null && !hidden.has(own.brand) && hover == null && (
            <text x={Math.min(x(lastOwnIdx) + 8, W - PAD.right - 2)} y={y(lastOwn.value) - 8} fontSize="12" fontWeight={700} fill="var(--color-ink)" textAnchor={lastOwnIdx === n - 1 ? "end" : "start"}>
              {own.brand} {lastOwn.value}%
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
            <div className="mb-1 font-semibold text-ink">{fmtDateTime(series[0].points[hover].date)}</div>
            <ul className="space-y-0.5">
              {tooltipRows.map(({ s, v }) => (
                <li key={s.brand} className="flex items-center justify-between gap-3">
                  <span className={`flex items-center gap-1.5 ${s.own ? "font-semibold text-ink" : "text-muted"}`}>
                    <span aria-hidden className="inline-block size-2 rounded-full" style={{ background: s.color }} />
                    {s.brand}
                  </span>
                  <span className="font-mono tabular-nums text-ink">{v}%</span>
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
