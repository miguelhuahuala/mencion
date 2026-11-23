import type { Project, Prompt } from "@/generated/prisma/client";
import { MAX_COMPETITORS, OTHER_COLOR, PALETTE, competitorsOf, ownBrand } from "@/lib/projects";
import { CompetitorRows } from "./CompetitorRows";
import { PromptRows } from "./PromptRows";
import { parseJson } from "@/lib/types";

const COUNTRIES: [string, string][] = [
  ["PE", "Perú"], ["MX", "México"], ["CO", "Colombia"], ["CL", "Chile"], ["AR", "Argentina"],
  ["EC", "Ecuador"], ["ES", "España"], ["US", "Estados Unidos"], ["BR", "Brasil"],
];

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
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="label">
        Marca y su color en los gráficos
        <div className="mt-1 flex gap-2">
          <input
            type="color"
            name="color"
            defaultValue={project ? ownBrand(project).color : PALETTE[0]}
            aria-label="Color de tu marca"
            className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-line bg-white p-1"
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
        País de búsqueda
        <select name="country" defaultValue={project?.country ?? "PE"} className="input mt-1 font-normal normal-case tracking-normal">
          {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
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
      <fieldset className="sm:col-span-2">
        <legend className="label mb-2">Competidores y su color en los gráficos (hasta {MAX_COMPETITORS})</legend>
        <CompetitorRows
          initial={project ? competitorsOf(project).map((c) => ({ name: c.name, domain: c.domain, aliases: c.aliases, color: c.color! })) : []}
          palette={PALETTE}
          otherColor={OTHER_COLOR}
          max={MAX_COMPETITORS}
        />
      </fieldset>
      <fieldset className="sm:col-span-2">
        <legend className="label mb-1">Prompts a seguir (hasta {maxPrompts})</legend>
        <p className="mb-2 text-xs text-muted">
          Una pregunta completa por casilla, tal como tus clientes se la harían a la IA. Cada casilla se mide por separado.
        </p>
        <PromptRows initial={prompts?.filter((p) => p.active).map((p) => p.text) ?? []} max={maxPrompts} />
      </fieldset>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button className="btn-primary">{submitLabel}</button>
        <span className="text-xs text-muted">Cada medición consulta cada prompt en ChatGPT, Claude, Gemini y Perplexity.</span>
      </div>
    </form>
  );
}
