"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, hashPassword, newToken, requireUser, sha256, startSession, verifyPassword } from "@/lib/auth";
import { canSendEmail, sendEmail, siteUrl } from "@/lib/email";

const go = (path: string, params: Record<string, string>): never =>
  redirect(`${path}?${new URLSearchParams(params).toString()}`);

const Password = z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200);
const RESET_MINUTES = 60;

/** Paso 1: pedir enlace de recuperación. Nunca revela si el correo existe. */
export async function requestReset(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) go("/recuperar", { error: "Escribe un correo válido", email });
  if (!canSendEmail()) go("/recuperar", { error: "La recuperación por correo aún no está disponible. Escríbenos para ayudarte." });

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    // Máximo un correo cada 2 minutos por cuenta
    const recent = await db.passwordReset.findFirst({ where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 2 * 60_000) } } });
    if (!recent) {
      const token = newToken();
      const reset = await db.passwordReset.create({
        data: { id: sha256(token), userId: user.id, expiresAt: new Date(Date.now() + RESET_MINUTES * 60_000) },
      });
      const link = `${siteUrl()}/restablecer?token=${token}`;
      try {
        await sendEmail({
          to: user.email,
          subject: "Restablece tu contraseña de Menciones",
          text: `Hola,\n\nPara crear una nueva contraseña entra a este enlace (vence en ${RESET_MINUTES} minutos):\n${link}\n\nSi no lo pediste, ignora este correo; tu contraseña no cambiará.\n\nMenciones`,
          html: `<p>Hola,</p><p>Para crear una nueva contraseña pulsa el botón (el enlace vence en ${RESET_MINUTES} minutos):</p><p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Crear nueva contraseña</a></p><p style="color:#5d6679;font-size:13px">Si no lo pediste, ignora este correo; tu contraseña no cambiará.</p><p>Menciones</p>`,
        });
      } catch (e) {
        console.error("[mencion] no se pudo enviar el correo de recuperación:", e);
        // Si el correo no salió, se borra el enlace para permitir reintentar de inmediato
        await db.passwordReset.delete({ where: { id: reset.id } }).catch(() => {});
        go("/recuperar", { error: "No pudimos enviar el correo. Inténtalo de nuevo en unos minutos." });
      }
    }
  }
  go("/recuperar", { sent: "1" });
}

/** Paso 2: definir la nueva contraseña con el token del correo. */
export async function resetPassword(form: FormData) {
  const token = String(form.get("token") ?? "");
  const parsed = Password.safeParse(String(form.get("password") ?? ""));
  if (!parsed.success) go("/restablecer", { token, error: parsed.error.issues[0].message });

  const reset = token ? await db.passwordReset.findUnique({ where: { id: sha256(token) } }) : null;
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    go("/recuperar", { error: "El enlace venció o ya se usó. Pide uno nuevo." });
  }
  await db.$transaction([
    db.user.update({ where: { id: reset!.userId }, data: { passwordHash: await hashPassword(parsed.data!) } }),
    db.passwordReset.update({ where: { id: reset!.id }, data: { usedAt: new Date() } }),
    // Usar el enlace del correo también demuestra que el correo es suyo
    db.user.updateMany({ where: { id: reset!.userId, emailVerifiedAt: null }, data: { emailVerifiedAt: new Date() } }),
    // Cierra todas las sesiones abiertas con la contraseña anterior
    db.session.deleteMany({ where: { userId: reset!.userId } }),
  ]);
  await startSession(reset!.userId);
  go("/cuenta", { ok: "Listo, tu contraseña se actualizó." });
}

/** Cambiar contraseña estando dentro de la cuenta. */
export async function changePassword(form: FormData) {
  const user = await requireUser();
  const current = String(form.get("current") ?? "");
  const parsed = Password.safeParse(String(form.get("password") ?? ""));
  if (!(await verifyPassword(current, user.passwordHash))) go("/cuenta", { error: "La contraseña actual no es correcta" });
  if (!parsed.success) go("/cuenta", { error: parsed.error.issues[0].message });
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data!) } }),
    db.session.deleteMany({ where: { userId: user.id } }),
  ]);
  await startSession(user.id);
  go("/cuenta", { ok: "Tu contraseña se actualizó y se cerraron tus otras sesiones." });
}

/** Eliminar la cuenta y todos sus datos (derecho de cancelación, Ley 29733). */
export async function deleteAccount(form: FormData) {
  const user = await requireUser();
  const confirm = String(form.get("confirm") ?? "").trim().toLowerCase();
  if (confirm !== user.email) go("/cuenta", { error: "Para eliminar tu cuenta escribe tu correo exactamente." });
  if (!(await verifyPassword(String(form.get("password") ?? ""), user.passwordHash))) {
    go("/cuenta", { error: "La contraseña no es correcta" });
  }
  await endSession();
  await db.user.delete({ where: { id: user.id } }); // borra en cascada sesiones, proyectos y mediciones
  redirect("/?cuenta=eliminada");
}
