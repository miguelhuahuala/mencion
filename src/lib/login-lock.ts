/**
 * Bloqueo de ingreso por contraseñas incorrectas (por cuenta):
 *  1.º y 2.º error → mensaje normal.
 *  3.er error      → aviso: si vuelve a fallar se bloquea 5 minutos (o puede recuperar la contraseña).
 *  4.º error       → bloqueo de 5 minutos (ni con la contraseña correcta).
 *  Error después de un bloqueo de 5 min → bloqueo hasta crear una nueva contraseña.
 * Un ingreso correcto o una contraseña nueva reinician todo.
 */
export const LOCK_MINUTES = 5;
const WARN_AT = 3;
const LOCK_AT = 4;

const FORGOT = "“¿Olvidaste tu contraseña?”";

export const MSG = {
  wrong: "Correo o contraseña incorrectos.",
  warn: `Correo o contraseña incorrectos. Si vuelves a fallar, el ingreso a esta cuenta se bloqueará ${LOCK_MINUTES} minutos. Si no la recuerdas, usa ${FORGOT}.`,
  locked: `Por seguridad bloqueamos el ingreso a esta cuenta por ${LOCK_MINUTES} minutos. Si vuelves a fallar después, solo podrás entrar creando una nueva contraseña con ${FORGOT}.`,
  stillLocked: (min: number) =>
    `El ingreso a esta cuenta está bloqueado por ${min} ${min === 1 ? "minuto" : "minutos"} más. También puedes crear una nueva contraseña con ${FORGOT}.`,
  hardLocked: `Por seguridad, el ingreso con contraseña a esta cuenta está bloqueado. Crea una nueva contraseña con ${FORGOT} para volver a entrar.`,
};

type LockState = { failedLogins: number; lockedUntil: Date | null; loginLocked: boolean };

/** ¿Se puede siquiera intentar? (se evalúa antes de comprobar la contraseña) */
export function blockedMessage(u: LockState, now = new Date()): string | null {
  if (u.loginLocked) return MSG.hardLocked;
  if (u.lockedUntil && u.lockedUntil > now) {
    return MSG.stillLocked(Math.max(1, Math.ceil((u.lockedUntil.getTime() - now.getTime()) / 60_000)));
  }
  return null;
}

/** Qué hacer tras una contraseña incorrecta: nuevo estado y mensaje. */
export function afterFailure(u: LockState, now = new Date()): { data: Partial<LockState>; message: string } {
  // Ya hubo un bloqueo de 5 minutos (vencido) y vuelve a fallar → solo recuperar contraseña
  if (u.lockedUntil && u.lockedUntil <= now) {
    return { data: { loginLocked: true, failedLogins: u.failedLogins + 1 }, message: MSG.hardLocked };
  }
  const failed = u.failedLogins + 1;
  if (failed >= LOCK_AT) {
    return { data: { failedLogins: failed, lockedUntil: new Date(now.getTime() + LOCK_MINUTES * 60_000) }, message: MSG.locked };
  }
  return { data: { failedLogins: failed }, message: failed >= WARN_AT ? MSG.warn : MSG.wrong };
}

/** Estado limpio (ingreso correcto o contraseña nueva). */
export const UNLOCKED = { failedLogins: 0, lockedUntil: null, loginLocked: false } as const;
