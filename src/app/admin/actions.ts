"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/**
 * Prueba las credenciales de DataForSEO con la lista de modelos (consulta gratuita, no consume saldo).
 */
export async function testDataForSeo() {
  const admin = await requireUser();
  if (admin.role !== "admin") redirect("/");
  let msg: string;
  let ok = false;
  try {
    const { hasCredentials, listModels } = await import("@/lib/dataforseo");
    if (!hasCredentials()) throw new Error("Faltan DATAFORSEO_LOGIN o DATAFORSEO_PASSWORD en las variables del servidor.");
    const models = await listModels("claude");
    ok = true;
    msg = `Conexión con DataForSEO correcta (${models.length} modelos de Claude disponibles). No se consumió saldo.`;
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    msg = /401/.test(detail)
      ? "DataForSEO rechazó las credenciales (HTTP 401). Revisa DATAFORSEO_LOGIN y DATAFORSEO_PASSWORD en Railway."
      : `No se pudo conectar con DataForSEO: ${detail}`;
  }
  redirect(`/admin?${ok ? "ok" : "error"}=${encodeURIComponent(msg)}`);
}

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
