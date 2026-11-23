import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { findProjectFor, limitsFor } from "@/lib/limits";
import { ProjectForm } from "@/components/ProjectForm";
import { suggestLeftFor } from "@/lib/suggest";
import { deleteProject, updateProject } from "../../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ajustes" };

export default async function SettingsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await requireUser();
  const allowed = await findProjectFor(id, user);
  if (!allowed || allowed.isDemo) notFound();
  const project = await db.project.findUnique({ where: { id }, include: { prompts: true } });
  if (!project || project.isDemo) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/p/${id}`} className="text-sm text-muted hover:text-ink">← {project.name}</Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted">Quitar un prompt lo desactiva; su historial se conserva.</p>
      </div>
      {error && <div role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">{error}</div>}
      <section className="card p-6">
        <ProjectForm action={updateProject} project={project} prompts={project.prompts} submitLabel="Guardar cambios" maxPrompts={limitsFor(user).maxPrompts} suggestLeft={await suggestLeftFor(user)} />
      </section>
      <section className="card flex items-center justify-between gap-4 border-bad/30 p-6">
        <div>
          <h2 className="font-semibold text-bad">Eliminar proyecto</h2>
          <p className="text-sm text-muted">Borra el proyecto, sus prompts y todo el historial de corridas. No se puede deshacer.</p>
        </div>
        <form action={deleteProject}>
          <input type="hidden" name="id" value={id} />
          <button className="btn border border-bad/40 bg-white text-bad hover:bg-bad-soft">Eliminar</button>
        </form>
      </section>
    </div>
  );
}
