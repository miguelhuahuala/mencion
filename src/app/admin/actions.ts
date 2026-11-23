"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Elimina un usuario y todos sus datos. Solo administradores; no permite borrarse a sí mismo. */
export async function deleteUserAsAdmin(form: FormData) {
  const admin = await requireUser();
  if (admin.role !== "admin") redirect("/");
  const id = String(form.get("id") ?? "");
  const confirm = String(form.get("confirm") ?? "").trim().toLowerCase();
  const target = await db.user.findUnique({ where: { id } });
  if (!target) redirect("/admin?error=" + encodeURIComponent("Usuario no encontrado"));
  if (target.id === admin.id) redirect("/admin?error=" + encodeURIComponent("No puedes eliminar tu propia cuenta desde aquí."));
  if (confirm !== target.email) redirect("/admin?error=" + encodeURIComponent(`Para eliminar escribe exactamente: ${target.email}`));
  await db.user.delete({ where: { id: target.id } }); // en cascada: sesiones, proyectos, mediciones
  revalidatePath("/admin");
  redirect("/admin?ok=" + encodeURIComponent(`Se eliminó ${target.email} y todos sus datos.`));
}
