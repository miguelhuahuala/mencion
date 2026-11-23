import type { Project, Prompt } from "@/generated/prisma/client";
import { MAX_COMPETITORS, OTHER_COLOR, PALETTE, PALETTE_OPTIONS, competitorsOf, ownBrand } from "@/lib/projects";
import { ColorPicker } from "./ColorPicker";
import { CompetitorRows } from "./CompetitorRows";
import { PromptRows } from "./PromptRows";
import { tagsOf } from "@/lib/tags";
import { parseJson } from "@/lib/types";
import { COUNTRIES } from "@/lib/locale";


export function ProjectForm({
  action,
  project,
  prompts,
  submitLabel,
  maxPrompts,
  suggestLeft,
}: {
  action: (form: FormData) => Promise<void>;
  project?: Project;
  prompts?: Prompt[];
  submitLabel: string;
  maxPrompts: number;
  /** Búsquedas de "Sugerir prompts" que le quedan (null = sin límite; undefined = no disponible). */
  suggestLeft?: number | null;
}) {
  const brandColor = project ? ownBrand(project).color! : PALETTE[0];
  const field = "input mt-1.5 font-normal normal-case tracking-normal";
  const fieldLabel = "block text-sm font-medium text-ink";
  return (
    <form action={action} className="divide-y divide-line">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <Step n={1} title="Tu marca" desc="Cómo te reconocemos en las respuestas de la IA. El color se usa en los gráficos.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className={fieldLabel}>Marca</span>
            <div className="mt-1.5 flex gap-2">
              <ColorPicker
                name="color"
                value={brandColor}
                palette={PALETTE_OPTIONS}
                label="Color de tu marca"
                taken={project ? competitorsOf(project).map((c) => c.color!) : []}
              />
              <input name="name" required maxLength={80} defaultValue={project?.name} placeholder="BCP" aria-label="Marca" className="input font-normal normal-case tracking-normal" />
            </div>
          </div>
          <label className={fieldLabel}>
            Dominio
            <input name="domain" maxLength={120} defaultValue={project?.domain} placeholder="viabcp.com" className={field} />
          </label>
          <label className={`${fieldLabel} sm:col-span-2`}>
            Otras formas de escribir la marca <span className="font-normal text-muted">(opcional, separadas por coma)</span>
            <input name="aliases" defaultValue={project ? parseJson<string[]>(project.aliases, []).join(", ") : ""} placeholder="Banco de Crédito del Perú, Banco de Credito" className={field} />
          </label>
        </div>
      </Step>

      <Step n={2} title="Mercado" desc="Preguntamos como lo haría una persona de ese país, para ver las marcas que la IA recomienda a tus clientes.">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={fieldLabel}>
            País de tus clientes
            <select name="country" defaultValue={project?.country ?? "PE"} className={field}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>
          <label className={fieldLabel}>
            Idioma
            <select name="language" defaultValue={project?.language ?? "es"} className={field}>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
            </select>
          </label>
        </div>
        <p className="mt-3 flex gap-2 text-xs text-muted">
          <span aria-hidden>📍</span>
          <span>
            <strong className="font-semibold text-ink">Respuestas localizadas:</strong> ChatGPT responde con esa ubicación, y a Claude, Gemini y
            Perplexity les indicamos el país y el idioma.
          </span>
        </p>
      </Step>

      <Step n={3} title="Competidores" desc={`Hasta ${MAX_COMPETITORS} marcas con las que te comparas. Cada una con su color en los gráficos.`}>
        <CompetitorRows
          initial={project ? competitorsOf(project).map((c) => ({ name: c.name, domain: c.domain, aliases: c.aliases, color: c.color! })) : []}
          palette={PALETTE_OPTIONS}
          otherColor={OTHER_COLOR}
          max={MAX_COMPETITORS}
          brandColor={brandColor}
        />
      </Step>

      <Step
        n={4}
        title="Prompts a seguir"
        desc={`Hasta ${maxPrompts}. Una pregunta completa por casilla, como la haría tu cliente. La etiqueta (p. ej. el producto) sirve para filtrar el panel.`}
      >
        <PromptRows initial={prompts?.filter((p) => p.active).map((p) => ({ text: p.text, tags: tagsOf(p) })) ?? []} max={maxPrompts} suggestLeft={suggestLeft} />
      </Step>

      <div className="flex flex-wrap items-center gap-3 pt-6">
        <button className="btn-primary">{submitLabel}</button>
        <span className="text-xs text-muted">Cada medición consulta cada prompt en ChatGPT, Claude, Gemini y Perplexity.</span>
      </div>
    </form>
  );
}

/** Un paso del formulario: título y explicación a la izquierda, campos a la derecha (apilado en móvil). */
function Step({ n, title, desc, children }: { n: number; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 py-6 first:pt-0 md:grid-cols-[13rem_1fr] md:gap-8">
      <div>
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft font-mono text-xs text-accent">{n}</span>
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">{desc}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
