"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { startRun } from "@/lib/runner";
import { PALETTE, cleanDomain, competitorsFromForm, isHexColor } from "@/lib/projects";
import { requireUser } from "@/lib/auth";
import { findProjectFor, limitsFor, runAvailability } from "@/lib/limits";
import { dateTime } from "@/lib/format";

const ProjectInput = z.object({
  name: z.string().trim().min(1, "Falta el nombre de la marca").max(80),
  domain: z.string().trim().max(120),
  aliases: z.string().max(500),
  country: z.string().trim().length(2),
  language: z.string().trim().min(2).max(5),
});

const fail = (path: string, msg: string): never => redirect(`${path}?error=${encodeURIComponent(msg)}`);

function read(form: FormData, maxPrompts: number, errorPath: string) {
  const parsed = ProjectInput.safeParse(
    Object.fromEntries(["name", "domain", "aliases", "country", "language"].map((k) => [k, String(form.get(k) ?? "")])),
  );
  if (!parsed.success) return fail(errorPath, parsed.error.issues[0].message);
  const d = parsed.data;
  // Una casilla por prompt (campos repetidos "prompt"); se ignoran vacíos y duplicados
  const prompts = [...new Set(form.getAll("prompt").map((p) => String(p).trim().slice(0, 500)).filter(Boolean))];
  if (!prompts.length) return fail(errorPath, "Agrega al menos un prompt");
  if (prompts.length > maxPrompts) return fail(errorPath, `Tu plan permite hasta ${maxPrompts} prompts por proyecto (escribiste ${prompts.length}).`);
  return {
    name: d.name,
    domain: cleanDomain(d.domain),
    aliases: JSON.stringify(d.aliases.split(",").map((a) => a.trim()).filter(Boolean)),
    color: isHexColor(form.get("color")) ? String(form.get("color")).toLowerCase() : PALETTE[0],
    competitors: JSON.stringify(competitorsFromForm(form)),
    country: d.country.toUpperCase(),
    language: d.language.toLowerCase(),
    prompts,
  };
}

export async function createProject(form: FormData) {
  const user = await requireUser();
  const limits = limitsFor(user);
  const count = await db.project.count({ where: { userId: user.id } });
  if (count >= limits.maxProjects) fail("/", `Tu plan permite ${limits.maxProjects} proyecto. Edita el que ya tienes.`);
  const { prompts, ...data } = read(form, limits.maxPrompts, "/");
  const project = await db.project.create({ data: { ...data, userId: user.id, prompts: { create: prompts.map((text) => ({ text })) } } });
  redirect(`/p/${project.id}`);
}

export async function updateProject(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id"));
  const found = await findProjectFor(id, user);
  if (!found || found.isDemo) fail("/", "Proyecto no encontrado");
  const { prompts, ...data } = read(form, limitsFor(user).maxPrompts, `/p/${id}/ajustes`);
  const existing = new Set((await db.prompt.findMany({ where: { projectId: id }, select: { text: true } })).map((p) => p.text));
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
  const user = await requireUser();
  const id = String(form.get("id"));
  const project = await findProjectFor(id, user);
  if (!project || project.isDemo) fail("/", "Proyecto no encontrado");
  const avail = await runAvailability(id, user);
  if (!avail.ok) {
    fail(
      `/p/${id}`,
      avail.reason === "interval"
        ? `Tu plan incluye una medición por semana. La próxima estará disponible el ${dateTime(avail.nextAt!)}.`
        : "Alcanzamos el límite de mediciones de este mes. Vuelve a intentarlo el próximo mes.",
    );
  }
  try {
    await startRun(id); // la corrida sigue en segundo plano; la página se refresca sola
  } catch (e) {
    fail(`/p/${id}`, e instanceof Error ? e.message : "Error al ejecutar");
  }
  revalidatePath(`/p/${id}`);
  redirect(`/p/${id}`);
}

export async function deleteProject(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id"));
  const project = await findProjectFor(id, user);
  if (!project || project.isDemo) fail("/", "Proyecto no encontrado");
  await db.project.delete({ where: { id } });
  redirect("/");
}
