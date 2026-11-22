"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, hashPassword, isAdminEmail, startSession, verifyPassword } from "@/lib/auth";

const back = (path: string, error: string, email?: string) =>
  redirect(`${path}?error=${encodeURIComponent(error)}${email ? `&email=${encodeURIComponent(email)}` : ""}`);

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
  if (!parsed.success) return back("/registro", parsed.error.issues[0].message, email);

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return back("/registro", "Ya existe una cuenta con ese correo. Ingresa.", email);

  const admin = isAdminEmail(parsed.data.email);
  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      role: admin ? "admin" : "user",
      consentAt: new Date(),
    },
  });
  // El primer administrador hereda los proyectos creados antes de que existieran las cuentas.
  if (admin) await db.project.updateMany({ where: { userId: null, isDemo: false }, data: { userId: user.id } });
  await startSession(user.id);
  redirect("/");
}

export async function signIn(form: FormData) {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  // Mismo mensaje en ambos casos para no revelar qué correos están registrados
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return back("/ingresar", "Correo o contraseña incorrectos", email);
  }
  if (isAdminEmail(user.email) && user.role !== "admin") {
    await db.user.update({ where: { id: user.id }, data: { role: "admin" } });
  }
  await startSession(user.id);
  redirect("/");
}

export async function signOut() {
  await endSession();
  redirect("/");
}
