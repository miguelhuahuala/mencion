import type { Project, Prompt } from "@/generated/prisma/client";
import { MAX_COMPETITORS, OTHER_COLOR, PALETTE, PALETTE_OPTIONS, competitorsOf, ownBrand } from "@/lib/projects";
import { ColorPicker } from "./ColorPicker";
import { CompetitorRows } from "./CompetitorRows";
import { PromptRows } from "./PromptRows";
import { tagsOf } from "@/lib/tags";
import { parseJson } from "@/lib/types";
import { COUNTRIES } from "@/lib/locale";
import { InfoTip } from "./InfoTip";


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
    <form action={action}>
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <Step n={1} title="Tu marca" desc="Cómo te reconoce la IA en sus respuestas." info="El color de tu marca se usa en los gráficos. Las otras formas de escribirla ayudan a detectarla aunque la IA no use el nombre exacto.">
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

      <Step
        n={2}
        title="Mercado"
        desc="Preguntamos como lo haría tu cliente en ese país."
        info="Respuestas localizadas: ChatGPT responde con esa ubicación, y a Claude, Gemini y Perplexity les indicamos el país y el idioma."
      >
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
      </Step>

      <Step
        n={3}
        title="Competidores"
        desc="Las marcas con las que te quieres comparar."
        info={`Hasta ${MAX_COMPETITORS} competidores. Cada uno tiene su color en los gráficos.`}
      >
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
        desc="Las preguntas que tus clientes le hacen a la IA."
        info={`Hasta ${maxPrompts} prompts. Escribe una pregunta completa por casilla, como la haría tu cliente. La etiqueta (p. ej. el producto) sirve para filtrar el panel.`}
      >
        <PromptRows initial={prompts?.filter((p) => p.active).map((p) => ({ text: p.text, tags: tagsOf(p) })) ?? []} max={maxPrompts} suggestLeft={suggestLeft} />
      </Step>

      <div className="flex flex-wrap items-center gap-3 pt-6 pl-10 sm:pl-11">
        <button className="btn-primary">{submitLabel}</button>
        <span className="text-xs text-muted">Cada medición consulta cada prompt en ChatGPT, Claude, Gemini y Perplexity.</span>
      </div>
    </form>
  );
}

/** Un paso del recorrido: número unido al siguiente por una línea vertical, título, una frase y los campos. */
function Step({
  n,
  title,
  desc,
  info,
  children,
}: {
  n: number;
  title: string;
  desc: string;
  info?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="group flex gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-white">{n}</span>
        <span aria-hidden className="mt-2 w-0.5 flex-1 rounded-full bg-accent/20 group-last-of-type:hidden" />
      </div>
      <div className="min-w-0 flex-1 pb-9 group-last-of-type:pb-2">
        <h3 className="flex items-center pt-0.5 font-semibold text-ink">
          {title}
          {info ? <InfoTip label={title} text={info} /> : null}
        </h3>
        <p className="mt-0.5 text-sm text-muted">{desc}</p>
        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}
