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
}: {
  action: (form: FormData) => Promise<void>;
  project?: Project;
  prompts?: Prompt[];
  submitLabel: string;
  maxPrompts: number;
}) {
  const brandColor = project ? ownBrand(project).color! : PALETTE[0];
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="label">
        Marca y su color en los gráficos
        <div className="mt-1 flex gap-2">
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
      <label className="label">
        Dominio
        <input name="domain" maxLength={120} defaultValue={project?.domain} placeholder="viabcp.com" className="input mt-1 font-normal normal-case tracking-normal" />
      </label>
      <label className="label sm:col-span-2">
        Otras formas de escribir la marca (separadas por coma)
        <input name="aliases" defaultValue={project ? parseJson<string[]>(project.aliases, []).join(", ") : ""} placeholder="Banco de Crédito del Perú, Banco de Credito" className="input mt-1 font-normal normal-case tracking-normal" />
      </label>
      <label className="label">
        País de tus clientes
        <select name="country" defaultValue={project?.country ?? "PE"} className="input mt-1 font-normal normal-case tracking-normal">
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </label>
      <label className="label">
        Idioma
        <select name="language" defaultValue={project?.language ?? "es"} className="input mt-1 font-normal normal-case tracking-normal">
          <option value="es">Español</option>
          <option value="en">Inglés</option>
          <option value="pt">Portugués</option>
        </select>
      </label>
      <p className="-mt-1 flex gap-2 rounded-lg bg-accent-soft px-3 py-2 text-xs text-ink sm:col-span-2">
        <span aria-hidden>📍</span>
        <span>
          <strong>Respuestas localizadas:</strong> preguntamos como lo haría una persona en el país e idioma que elijas. ChatGPT
          responde con esa ubicación, y a Claude, Gemini y Perplexity les indicamos el país y el idioma. Así ves las marcas que la
          IA recomienda a <em>tus</em> clientes, no las de otro mercado.
        </span>
      </p>
      <fieldset className="sm:col-span-2">
        <legend className="label mb-2">Competidores y su color en los gráficos (hasta {MAX_COMPETITORS})</legend>
        <CompetitorRows
          initial={project ? competitorsOf(project).map((c) => ({ name: c.name, domain: c.domain, aliases: c.aliases, color: c.color! })) : []}
          palette={PALETTE_OPTIONS}
          otherColor={OTHER_COLOR}
          max={MAX_COMPETITORS}
          brandColor={brandColor}
        />
      </fieldset>
      <fieldset className="sm:col-span-2">
        <legend className="label mb-1">Prompts a seguir (hasta {maxPrompts})</legend>
        <p className="mb-2 text-xs text-muted">
          Una pregunta completa por casilla, tal como tus clientes se la harían a la IA. Cada casilla se mide por separado. Usa etiquetas (p. ej. el producto) para agruparlos y filtrar el panel; separa varias con comas.
        </p>
        <PromptRows initial={prompts?.filter((p) => p.active).map((p) => ({ text: p.text, tags: tagsOf(p) })) ?? []} max={maxPrompts} />
      </fieldset>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button className="btn-primary">{submitLabel}</button>
        <span className="text-xs text-muted">Cada medición consulta cada prompt en ChatGPT, Claude, Gemini y Perplexity.</span>
      </div>
    </form>
  );
}
