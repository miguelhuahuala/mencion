import { ENGINE_LABEL, ENGINES } from "@/lib/types";
import { Bar, TrendLine } from "./ui";
import { EngineLogo } from "./EngineLogo";

/**
 * Vista previa estática del dashboard para la landing.
 * Datos FICTICIOS de ejemplo (se indica en pantalla); no provienen de ninguna IA.
 */
const trend = [38, 41, 40, 46, 49, 47, 53, 58, 61, 64].map((value, i) => ({ label: `Sem ${i + 1}`, value }));
const byEngine = { chatgpt: 72, claude: 58, gemini: 49, perplexity: 77 } as const;
const brands = [
  { brand: "Tu marca", own: true, vis: 64, share: 31, pos: 1.8 },
  { brand: "Competidor A", own: false, vis: 70, share: 34, pos: 1.6 },
  { brand: "Competidor B", own: false, vis: 41, share: 20, pos: 2.7 },
  { brand: "Competidor C", own: false, vis: 31, share: 15, pos: 3.2 },
];
const prompts: [string, (number | null)[]][] = [
  ["¿Cuál es la mejor opción en mi ciudad?", [1, 2, null, 1]],
  ["Alternativas más baratas a Competidor A", [2, 1, 3, 2]],
  ["¿Qué marca recomiendan los expertos?", [null, 2, 2, 1]],
];

export function DashboardPreview() {
  return (
    <div className="relative min-w-0">
      <div aria-hidden className="absolute inset-0 -z-10 sm:-inset-4 rounded-[28px] bg-gradient-to-br from-accent/15 via-transparent to-perplexity/10 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_-20px_rgb(12_18_34/0.35)]">
        <div className="flex items-center gap-2 border-b border-line bg-white px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" /><span className="size-2.5 rounded-full bg-[#febc2e]" /><span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 min-w-0 truncate rounded-md bg-surface px-3 py-0.5 font-mono text-[11px] text-muted">menciones.org/p/tu-marca</span>
          <span className="chip ml-auto shrink-0 bg-warn-soft text-[10px] text-warn">Datos de ejemplo</span>
        </div>

        <div className="space-y-3 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 [&>*]:min-w-0">
            {[
              ["Visibilidad", "64%", "+26 pts en 10 semanas"],
              ["Share of voice", "31%", "vs. 34% del líder"],
              ["Posición media", "#1.8", "entre marcas citadas"],
              ["Citado como fuente", "14", "respuestas enlazan tu web"],
            ].map(([l, v, h]) => (
              <div key={l} className="card p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{l}</div>
                <div className="mt-0.5 font-mono text-xl font-semibold tabular-nums sm:text-2xl">{v}</div>
                <div className="text-[11px] text-muted">{h}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-5 [&>*]:min-w-0">
            <div className="card p-3 md:col-span-3">
              <div className="text-xs font-semibold">Tendencia de visibilidad</div>
              <TrendLine points={trend} />
            </div>
            <div className="card space-y-2.5 p-3 md:col-span-2">
              <div className="text-xs font-semibold">Por IA</div>
              {ENGINES.map((e) => (
                <div key={e}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><EngineLogo engine={e} size={14} />{ENGINE_LABEL[e]}</span>
                    <span className="font-mono tabular-nums">{byEngine[e]}%</span>
                  </div>
                  <Bar value={byEngine[e]} own />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 [&>*]:min-w-0">
            <div className="card p-3">
              <div className="mb-2 text-xs font-semibold">Tú vs. competencia</div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-line">
                  {brands.map((b) => (
                    <tr key={b.brand} className={b.own ? "font-semibold" : ""}>
                      <td className="py-1.5 pr-2 whitespace-nowrap">{b.brand}</td>
                      <td className="w-1/2 py-1.5 pr-2"><Bar value={b.vis} own={b.own} /></td>
                      <td className="py-1.5 text-right font-mono tabular-nums">{b.share}%</td>
                      <td className="py-1.5 pl-2 text-right font-mono tabular-nums text-muted">#{b.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                <span>Prompt por prompt</span>
                <span className="flex gap-2.5">{ENGINES.map((e) => <EngineLogo key={e} engine={e} size={13} />)}</span>
              </div>
              <ul className="divide-y divide-line text-xs">
                {prompts.map(([q, cells]) => (
                  <li key={q} className="flex items-center justify-between gap-2 py-1.5">
                    <span className="truncate text-muted">{q}</span>
                    <span className="flex shrink-0 gap-1.5">
                      {cells.map((c, i) =>
                        c ? <span key={i} className="chip bg-good-soft px-1.5 font-mono text-[10px] text-good">#{c}</span>
                          : <span key={i} className="chip bg-surface px-1.5 text-[10px] text-muted">no</span>,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
