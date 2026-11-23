import type { Engine, Sentiment } from "@/lib/types";
import { ENGINE_LABEL } from "@/lib/types";
import { EngineLogo } from "./EngineLogo";

export function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className="kpi-num mt-1">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

export function Section({ title, desc, children, aside }: { title: string; desc?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {desc ? <p className="mt-0.5 text-sm text-muted">{desc}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Bar({ value, own, color }: { value: number; own?: boolean; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface" role="presentation">
      <div
        className={`h-full rounded-full ${color ? "" : own ? "bg-accent" : "bg-slate-300"}`}
        style={{ width: `${Math.max(value, value > 0 ? 2 : 0)}%`, background: color }}
      />
    </div>
  );
}

export function EngineTag({ engine }: { engine: Engine }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
      <EngineLogo engine={engine} size={15} />
      {ENGINE_LABEL[engine]}
    </span>
  );
}

const SENT: Record<Sentiment, [string, string]> = {
  positive: ["Positivo", "bg-good-soft text-good"],
  neutral: ["Neutral", "bg-surface text-muted"],
  negative: ["Negativo", "bg-bad-soft text-bad"],
};

export function SentimentChip({ s }: { s: Sentiment | null }) {
  if (!s) return null;
  const [label, cls] = SENT[s];
  return <span className={`chip ${cls}`}>{label}</span>;
}

/** Línea simple de tendencia (0–100 %) en SVG. */
export function TrendLine({ points }: { points: { label: string; value: number }[] }) {
  if (points.length < 2) return <p className="text-sm text-muted">Se necesita más de una corrida para ver la tendencia.</p>;
  const w = 640;
  const h = 160;
  const pad = 28;
  const x = (i: number) => pad + (i * (w - pad * 2)) / (points.length - 1);
  const y = (v: number) => h - pad - (v / 100) * (h - pad * 2);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Tendencia de visibilidad por corrida">
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={pad} x2={w - pad} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeDasharray={g ? "3 4" : undefined} />
          <text x={0} y={y(g) + 4} fontSize="10" fill="var(--color-muted)">{g}%</text>
        </g>
      ))}
      <path d={`${d} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill="var(--color-accent)" opacity="0.08" />
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r="3.5" fill="white" stroke="var(--color-accent)" strokeWidth="2">
            <title>{`${p.label}: ${p.value}%`}</title>
          </circle>
          {(i === 0 || i === points.length - 1) && (
            <text x={x(i)} y={h - 6} fontSize="10" fill="var(--color-muted)" textAnchor={i ? "end" : "start"}>{p.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function DemoBanner() {
  return (
    <div className="mb-6 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
      <strong>Proyecto de demostración.</strong> Marcas, respuestas y fuentes son ficticias (dominios <code>.example</code>) y no provienen
      de ninguna IA. Crea un proyecto propio para medir datos reales vía DataForSEO.
    </div>
  );
}
