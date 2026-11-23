import "server-only";
import { db } from "./db";
import { isAdminEmail, newToken } from "./auth";
import { MAX_ATTEMPTS, attemptsMessage, codeEmail, codeMatches, hashCode, newCode, spaced } from "./codes";
import { canSendEmail, sendEmail } from "./email";

const CODE_MINUTES = 30;

/** ¿Hay que pedir confirmación de correo? Solo si el envío de correos está configurado. */
export function verificationRequired() {
  return canSendEmail();
}

/**
 * Envía un código de 6 dígitos para confirmar el correo. Usamos código y no enlace porque los
 * filtros de correo corporativo (Safe Links, etc.) bloquean o "abren" los enlaces antes que la persona.
 * Devuelve false si ya se envió uno hace menos de 2 minutos (anti-spam).
 */
export async function sendVerificationEmail(user: { id: string; email: string }) {
  const recent = await db.emailVerification.findFirst({
    where: { userId: user.id, usedAt: null, createdAt: { gt: new Date(Date.now() - 2 * 60_000) } },
  });
  if (recent) return false;

  const code = newCode();
  // Un código nuevo invalida los anteriores
  await db.emailVerification.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
  const row = await db.emailVerification.create({
    data: {
      id: newToken(),
      codeHash: hashCode("verify", user.id, code),
      userId: user.id,
      expiresAt: new Date(Date.now() + CODE_MINUTES * 60_000),
    },
  });
  try {
    await sendEmail({
      to: user.email,
      subject: `${spaced(code)} es tu código de Menciones`,
      ...codeEmail({
        intro: "Tu código para confirmar tu correo en Menciones es:",
        code,
        minutes: CODE_MINUTES,
        outro: "Si no creaste esta cuenta, ignora este correo.",
      }),
    });
  } catch (e) {
    await db.emailVerification.delete({ where: { id: row.id } }).catch(() => {});
    throw e;
  }
  return true;
}

export type CheckResult = { ok: true; userId: string } | { ok: false; error: string };

/** Comprueba el código. Máximo 5 intentos por código. */
export async function checkVerificationCode(email: string, rawCode: string): Promise<CheckResult> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "Código incorrecto o vencido." };
  // Nunca iniciar sesión sin contraseña para una cuenta ya confirmada
  if (user.emailVerifiedAt) return { ok: false, error: "Tu correo ya está confirmado. Ingresa con tu contraseña." };

  const row = await db.emailVerification.findFirst({
    where: { userId: user.id, usedAt: null, codeHash: { not: "" } },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.expiresAt < new Date()) return { ok: false, error: "El código venció. Pide uno nuevo." };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Demasiados intentos. Pide un código nuevo." };

  if (!codeMatches(row.codeHash, "verify", user.id, rawCode)) {
    await db.emailVerification.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: attemptsMessage(row.attempts) };
  }

  await db.$transaction([
    db.emailVerification.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } }),
  ]);
  await activate(user.id, user.email);
  return { ok: true, userId: user.id };
}

/** Tras confirmar el correo: asigna admin si corresponde y hereda proyectos antiguos. Uso interno (no es una server action). */
export async function activate(userId: string, email: string) {
  if (!isAdminEmail(email)) return;
  await db.user.update({ where: { id: userId }, data: { role: "admin" } });
  // El primer administrador hereda los proyectos creados antes de que existieran las cuentas.
  await db.project.updateMany({ where: { userId: null, isDemo: false }, data: { userId } });
}
