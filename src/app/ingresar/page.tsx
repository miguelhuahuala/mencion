import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";
import { signIn } from "../auth-actions";

export const metadata = { title: "Ingresar" };
export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string }> }) {
  if (await currentUser()) redirect("/");
  const { error, email } = await searchParams;
  return (
    <AuthCard title="Ingresar" error={error}>
      <form action={signIn} className="space-y-4">
        <label className="label">
          Correo
          <input name="email" type="email" required autoComplete="email" defaultValue={email} className="input mt-1 font-normal normal-case tracking-normal" />
        </label>
        <label className="label">
          Contraseña
          <input name="password" type="password" required autoComplete="current-password" className="input mt-1 font-normal normal-case tracking-normal" />
        </label>
        <button className="btn-primary w-full">Ingresar</button>
      </form>
      <p className="mt-3 text-center text-sm">
        <Link href="/recuperar" className="text-muted underline hover:text-ink">¿Olvidaste tu contraseña?</Link>
      </p>
      <p className="mt-4 text-center text-sm text-muted">
        ¿No tienes cuenta? <Link href="/registro" className="text-accent underline">Créala gratis</Link>
      </p>
    </AuthCard>
  );
}
