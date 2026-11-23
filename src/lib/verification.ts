import "server-only";
import { randomInt, timingSafeEqual } from "node:crypto";
import { db } from "./db";
import { isAdminEmail, newToken, sha256 } from "./auth";
import { canSendEmail, sendEmail } from "./email";

const CODE_MINUTES = 30;
const MAX_ATTEMPTS = 5;

/** ¿Hay que pedir confirmación de correo? Solo si el envío de correos está configurado. */
export function verificationRequired() {
  return canSendEmail();
}

const codeHash = (userId: string, code: string) => sha256(`${userId}:${code}`);

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

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  // Un código nuevo invalida los anteriores
  await db.emailVerification.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
  const row = await db.emailVerification.create({
    data: {
      id: newToken(),
      codeHash: codeHash(user.id, code),
      userId: user.id,
      expiresAt: new Date(Date.now() + CODE_MINUTES * 60_000),
    },
  });
  const spaced = `${code.slice(0, 3)} ${code.slice(3)}`;
  try {
    await sendEmail({
      to: user.email,
      subject: `${spaced} es tu código de Menciones`,
      text: `Hola,\n\nTu código para confirmar tu correo en Menciones es: ${code}\n\nEscríbelo en la página de confirmación. Vence en ${CODE_MINUTES} minutos.\n\nSi no creaste esta cuenta, ignora este correo.\n\nMenciones`,
      html: `<p>Hola,</p><p>Tu código para confirmar tu correo en Menciones es:</p><p style="font-family:ui-monospace,Menlo,monospace;font-size:32px;font-weight:700;letter-spacing:6px;color:#0c1222;margin:16px 0">${spaced}</p><p>Escríbelo en la página de confirmación. Vence en ${CODE_MINUTES} minutos.</p><p style="color:#5d6679;font-size:13px">Si no creaste esta cuenta, ignora este correo.</p><p>Menciones</p>`,
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
  const code = rawCode.replace(/\D/g, "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "Código incorrecto o vencido." };
  if (user.emailVerifiedAt) return { ok: true, userId: user.id };

  const row = await db.emailVerification.findFirst({
    where: { userId: user.id, usedAt: null, codeHash: { not: "" } },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.expiresAt < new Date()) return { ok: false, error: "El código venció. Pide uno nuevo." };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: "Demasiados intentos. Pide un código nuevo." };

  const expected = Buffer.from(row.codeHash);
  const given = Buffer.from(codeHash(user.id, code));
  if (code.length !== 6 || expected.length !== given.length || !timingSafeEqual(expected, given)) {
    const left = MAX_ATTEMPTS - row.attempts - 1;
    await db.emailVerification.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, error: left > 0 ? `Código incorrecto. Te quedan ${left} intento${left === 1 ? "" : "s"}.` : "Demasiados intentos. Pide un código nuevo." };
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
