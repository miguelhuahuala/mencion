"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, hashPassword, isAdminEmail, startSession, verifyPassword } from "@/lib/auth";
import { activate, checkVerificationCode, sendVerificationEmail, verificationRequired } from "@/lib/verification";

const back = (path: string, error: string, email?: string, form?: FormData) => {
  // n = número de intento fallido; permite que la página muestre que el error es nuevo
  const n = Math.min(99, Number(form?.get("n") ?? 0) + 1);
  return redirect(`${path}?error=${encodeURIComponent(error)}${email ? `&email=${encodeURIComponent(email)}` : ""}&n=${n}`);
};

const pending = (email: string, extra: Record<string, string> = {}) =>
  redirect(`/verificar?${new URLSearchParams({ email, ...extra }).toString()}`);

const Signup = z.object({
  email: z.string().trim().toLowerCase().email("Correo no válido").max(200),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200),
  consent: z.literal("on", { message: "Debes aceptar la política de privacidad" }),
});

export async function signUp(form: FormData) {
  const parsed = Signup.safeParse({
    email: form.get("email"),
    password: form.get("password"),
    consent: form.get("consent") ?? "",
  });
  const email = String(form.get("email") ?? "");
  if (!parsed.success) return back("/registro", parsed.error.issues[0].message, email, form);

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return back("/registro", "Ya existe una cuenta con ese correo. Ingresa.", email, form);

  const mustVerify = verificationRequired();
  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "user", // el rol de admin se asigna al confirmar el correo
      consentAt: new Date(),
      emailVerifiedAt: mustVerify ? null : new Date(),
    },
  });

  if (mustVerify) {
    try {
      await sendVerificationEmail(user);
    } catch (e) {
      console.error("[menciones] no se pudo enviar la verificación:", e);
      return pending(user.email, { error: "Creamos tu cuenta, pero no pudimos enviar el correo. Pulsa “Enviar código nuevo”." });
    }
    return pending(user.email, { enviado: "1" });
  }

  await activate(user.id, user.email);
  await startSession(user.id);
  redirect("/");
}

export async function signIn(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  // Mismo mensaje en ambos casos para no revelar qué correos están registrados
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return back("/ingresar", "Correo o contraseña incorrectos", email, form);
  }
  if (!user.emailVerifiedAt) {
    // Si no tiene un código vigente (p. ej. cuentas creadas cuando se usaba enlace), se le envía uno ahora
    const active = await db.emailVerification.findFirst({
      where: { userId: user.id, usedAt: null, codeHash: { not: "" }, expiresAt: { gt: new Date() }, attempts: { lt: 5 } },
    });
    if (!active) {
      try {
        await sendVerificationEmail(user);
      } catch (e) {
        console.error("[menciones] no se pudo enviar el código al ingresar:", e);
        return pending(user.email, { error: "Debes confirmar tu correo, pero no pudimos enviarte el código. Pulsa “Enviar código nuevo”." });
      }
      return pending(user.email, { enviado: "1" });
    }
    return pending(user.email, { error: "Antes de ingresar confirma tu correo con el código que te enviamos." });
  }
  if (isAdminEmail(user.email) && user.role !== "admin") {
    await db.user.update({ where: { id: user.id }, data: { role: "admin" } });
  }
  await startSession(user.id);
  redirect("/");
}

/** Reenviar el correo de confirmación. No revela si el correo existe. */
export async function resendVerification(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  if (user && !user.emailVerifiedAt) {
    try {
      const sent = await sendVerificationEmail(user);
      if (!sent) return pending(email, { error: "Ya te enviamos un código hace un momento. Espera 2 minutos para pedir otro." });
    } catch (e) {
      console.error("[menciones] no se pudo reenviar la verificación:", e);
      return pending(email, { error: "No pudimos enviar el correo. Inténtalo de nuevo en unos minutos." });
    }
  }
  return pending(email, { enviado: "1" });
}

/** Confirmar el correo con el código de 6 dígitos; si es correcto, inicia sesión. */
export async function confirmCode(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const code = String(form.get("code") ?? "");
  const result = await checkVerificationCode(email, code);
  if (!result.ok) return pending(email, { error: result.error });
  await startSession(result.userId);
  redirect("/?bienvenida=1");
}

export async function signOut() {
  await endSession();
  redirect("/");
}
