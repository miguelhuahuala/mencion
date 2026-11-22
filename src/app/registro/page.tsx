import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { freeLimits } from "@/lib/limits";
import { AuthCard } from "@/components/AuthCard";
import { signUp } from "../auth-actions";

export const metadata = { title: "Crear cuenta" };
export const dynamic = "force-dynamic";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string }> }) {
  if (await currentUser()) redirect("/");
  const { error, email } = await searchParams;
  const l = freeLimits();
  return (
    <AuthCard
      title="Crea tu cuenta gratis"
      subtitle={`Plan gratis: ${l.maxProjects} proyecto, ${l.maxPrompts} prompts y una medición cada ${l.intervalDays} días en 4 IAs.`}
      error={error}
    >
      <form action={signUp} className="space-y-4">
        <label className="label">
          Correo
          <input name="email" type="email" required autoComplete="email" defaultValue={email} className="input mt-1 font-normal normal-case tracking-normal" />
        </label>
        <label className="label">
          Contraseña (mínimo 8 caracteres)
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="input mt-1 font-normal normal-case tracking-normal" />
        </label>
        <label className="flex items-start gap-2 text-sm text-muted">
          <input name="consent" type="checkbox" required className="mt-1" />
          <span>
            Acepto la <Link href="/privacidad" className="text-accent underline" target="_blank">política de privacidad</Link> y el
            tratamiento de mis datos para usar el servicio.
          </span>
        </label>
        <button className="btn-primary w-full">Crear cuenta</button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        ¿Ya tienes cuenta? <Link href="/ingresar" className="text-accent underline">Ingresa</Link>
      </p>
    </AuthCard>
  );
}
