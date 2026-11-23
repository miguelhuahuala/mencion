import "server-only";
import { randomInt, timingSafeEqual } from "node:crypto";
import { sha256 } from "./auth";

/**
 * Códigos de 6 dígitos enviados por correo (confirmación de cuenta y recuperación de contraseña).
 * Se usan en lugar de enlaces porque los filtros de correo corporativo bloquean o "abren" los enlaces.
 */
export const MAX_ATTEMPTS = 5;

export function newCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export const spaced = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`;

export function hashCode(purpose: "verify" | "reset", userId: string, code: string) {
  return sha256(`${purpose}:${userId}:${code}`);
}

/** Compara en tiempo constante; acepta el código con o sin espacios. */
export function codeMatches(stored: string, purpose: "verify" | "reset", userId: string, raw: string) {
  const code = raw.replace(/\D/g, "");
  if (code.length !== 6 || !stored) return false;
  const a = Buffer.from(stored);
  const b = Buffer.from(hashCode(purpose, userId, code));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function attemptsMessage(attemptsBefore: number) {
  const left = MAX_ATTEMPTS - attemptsBefore - 1;
  return left > 0 ? `Código incorrecto. Te quedan ${left} intento${left === 1 ? "" : "s"}.` : "Demasiados intentos. Pide un código nuevo.";
}

export function codeEmail(opts: { intro: string; code: string; minutes: number; outro: string }) {
  const s = spaced(opts.code);
  return {
    text: `Hola,\n\n${opts.intro} ${opts.code}\n\nVence en ${opts.minutes} minutos.\n\n${opts.outro}\n\nMenciones`,
    html: `<p>Hola,</p><p>${opts.intro}</p><p style="font-family:ui-monospace,Menlo,monospace;font-size:32px;font-weight:700;letter-spacing:6px;color:#0c1222;margin:16px 0">${s}</p><p>Vence en ${opts.minutes} minutos.</p><p style="color:#5d6679;font-size:13px">${opts.outro}</p><p>Menciones</p>`,
  };
}
