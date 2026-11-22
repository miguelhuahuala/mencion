import type { Project, Prompt } from "@/generated/prisma/client";
import { competitorLines, competitorsOf } from "@/lib/projects";
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
}: {
  action: (form: FormData) => Promise<void>;
  project?: Project;
  prompts?: Prompt[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <label className="label">
        Marca
        <input name="name" required maxLength={80} defaultValue={project?.name} placeholder="Kaus" className="input mt-1 font-normal normal-case tracking-normal" />
      </label>
      <label className="label">
        Dominio
        <input name="domain" maxLength={120} defaultValue={project?.domain} placeholder="kaus.pe" className="input mt-1 font-normal normal-case tracking-normal" />
      </label>
      <label className="label sm:col-span-2">
        Otras formas de escribir la marca (separadas por coma)
        <input name="aliases" defaultValue={project ? parseJson<string[]>(project.aliases, []).join(", ") : ""} placeholder="Kaus App, Kaus Coach" className="input mt-1 font-normal normal-case tracking-normal" />
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
      <label className="label sm:col-span-2">
        Competidores — uno por línea: <span className="font-mono normal-case">Marca | dominio.com | alias</span>
        <textarea name="competitors" rows={4} defaultValue={project ? competitorLines(competitorsOf(project)) : ""} placeholder={"MyFitnessPal | myfitnesspal.com\nYazio | yazio.com"} className="input mt-1 font-mono text-xs font-normal normal-case tracking-normal" />
      </label>
      <label className="label sm:col-span-2">
        Prompts a seguir — uno por línea (lo que tus clientes le preguntan a la IA)
        <textarea name="prompts" rows={7} required defaultValue={prompts?.filter((p) => p.active).map((p) => p.text).join("\n")} placeholder={"¿Cuál es la mejor app para bajar de peso en Perú?\nApps con coach de nutrición con IA en español"} className="input mt-1 text-sm font-normal normal-case tracking-normal" />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button className="btn-primary">{submitLabel}</button>
        <span className="text-xs text-muted">Cada corrida consulta cada prompt en ChatGPT, Claude, Gemini y Perplexity.</span>
      </div>
    </form>
  );
}
