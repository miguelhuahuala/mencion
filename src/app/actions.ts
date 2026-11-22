"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { startRun } from "@/lib/runner";
import { parseCompetitorLines } from "@/lib/projects";

const ProjectInput = z.object({
  name: z.string().trim().min(1, "Falta el nombre de la marca").max(80),
  domain: z.string().trim().max(120),
  aliases: z.string().max(500),
  competitors: z.string().max(5000),
  country: z.string().trim().length(2),
  language: z.string().trim().min(2).max(5),
  prompts: z.string().max(20000),
});

function read(form: FormData) {
  const parsed = ProjectInput.parse(Object.fromEntries(["name", "domain", "aliases", "competitors", "country", "language", "prompts"].map((k) => [k, String(form.get(k) ?? "")])));
  return {
    name: parsed.name,
    domain: parsed.domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase(),
    aliases: JSON.stringify(parsed.aliases.split(",").map((a) => a.trim()).filter(Boolean)),
    competitors: JSON.stringify(parseCompetitorLines(parsed.competitors).slice(0, 10)),
    country: parsed.country.toUpperCase(),
    language: parsed.language.toLowerCase(),
    prompts: parsed.prompts.split("\n").map((p) => p.trim()).filter(Boolean).slice(0, 100).map((p) => p.slice(0, 500)),
  };
}

export async function createProject(form: FormData) {
  const { prompts, ...data } = read(form);
  const project = await db.project.create({ data: { ...data, prompts: { create: prompts.map((text) => ({ text })) } } });
  redirect(`/p/${project.id}`);
}

export async function updateProject(form: FormData) {
  const id = String(form.get("id"));
  const { prompts, ...data } = read(form);
  const project = await db.project.findUniqueOrThrow({ where: { id }, include: { prompts: true } });
  if (project.isDemo) throw new Error("El proyecto de demostración no se puede editar.");
  const existing = new Map(project.prompts.map((p) => [p.text, p]));
  await db.$transaction([
    db.project.update({ where: { id }, data }),
    // Desactiva los prompts quitados (se conserva su historial) y crea/reactiva los nuevos
    db.prompt.updateMany({ where: { projectId: id, text: { notIn: prompts } }, data: { active: false } }),
    db.prompt.updateMany({ where: { projectId: id, text: { in: prompts } }, data: { active: true } }),
    ...prompts.filter((t) => !existing.has(t)).map((text) => db.prompt.create({ data: { projectId: id, text } })),
  ]);
  redirect(`/p/${id}`);
}

export async function runNow(form: FormData) {
  const id = String(form.get("id"));
  try {
    await startRun(id); // la corrida sigue en segundo plano; la página se refresca sola
  } catch (e) {
    redirect(`/p/${id}?error=${encodeURIComponent(e instanceof Error ? e.message : "Error al ejecutar")}`);
  }
  revalidatePath(`/p/${id}`);
  redirect(`/p/${id}`);
}

export async function deleteProject(form: FormData) {
  const id = String(form.get("id"));
  await db.project.delete({ where: { id, isDemo: false } });
  redirect("/");
}
