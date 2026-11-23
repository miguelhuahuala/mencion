import "server-only";
import { db } from "./db";
import { isAdminEmail, newToken, sha256 } from "./auth";
import { canSendEmail, sendEmail, siteUrl } from "./email";

const VERIFY_HOURS = 24;

/** ¿Hay que pedir confirmación de correo? Solo si el envío de correos está configurado. */
export function verificationRequired() {
  return canSendEmail();
}

/**
 * Envía el correo con el enlace para confirmar la cuenta.
 * Devuelve false si ya se envió uno hace menos de 2 minutos (anti-spam).
 */
export async function sendVerificationEmail(user: { id: string; email: string }) {
  const recent = await db.emailVerification.findFirst({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 2 * 60_000) } },
  });
  if (recent) return false;

  const token = newToken();
  const row = await db.emailVerification.create({
    data: { id: sha256(token), userId: user.id, expiresAt: new Date(Date.now() + VERIFY_HOURS * 3600_000) },
  });
  const link = `${siteUrl()}/api/verificar?token=${token}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Confirma tu correo en Menciones",
      text: `Hola,\n\nGracias por registrarte en Menciones. Confirma tu correo entrando a este enlace (vence en ${VERIFY_HOURS} horas):\n${link}\n\nSi no creaste esta cuenta, ignora este correo.\n\nMenciones`,
      html: `<p>Hola,</p><p>Gracias por registrarte en Menciones. Confirma tu correo para activar tu cuenta (el enlace vence en ${VERIFY_HOURS} horas):</p><p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Confirmar mi correo</a></p><p style="color:#5d6679;font-size:13px">Si no creaste esta cuenta, ignora este correo.</p><p>Menciones</p>`,
    });
  } catch (e) {
    await db.emailVerification.delete({ where: { id: row.id } }).catch(() => {});
    throw e;
  }
  return true;
}

/** Tras confirmar el correo: asigna admin si corresponde y hereda proyectos antiguos. Uso interno (no es una server action). */
export async function activate(userId: string, email: string) {
  if (!isAdminEmail(email)) return;
  await db.user.update({ where: { id: userId }, data: { role: "admin" } });
  // El primer administrador hereda los proyectos creados antes de que existieran las cuentas.
  await db.project.updateMany({ where: { userId: null, isDemo: false }, data: { userId } });
}

/** Valida el token del enlace y marca el correo como confirmado. Devuelve el usuario o null. */
export async function consumeVerification(token: string) {
  const row = token ? await db.emailVerification.findUnique({ where: { id: sha256(token) }, include: { user: true } }) : null;
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;
  await db.$transaction([
    db.emailVerification.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: row.userId }, data: { emailVerifiedAt: row.user.emailVerifiedAt ?? new Date() } }),
  ]);
  await activate(row.userId, row.user.email);
  return row.user;
}
