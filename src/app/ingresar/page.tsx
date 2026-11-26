import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";
import { signIn } from "../auth-actions";
import { SubmitButton } from "@/components/SubmitButton";

// Página de acceso: no compite por búsquedas
export const metadata = { title: "Ingresar", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string; n?: string }> }) {
  if (await currentUser()) redirect("/");
  const { error, email, n } = await searchParams;
  const attempt = Number(n) || 0;
  return (
    <AuthCard title="Ingresar" error={error} attempt={attempt}>
      <form action={signIn} className="space-y-4">
        <input type="hidden" name="n" value={attempt} />
        <label className="label">
          Correo
          <input name="email" type="email" required autoComplete="email" defaultValue={email} className="input mt-1 font-normal normal-case tracking-normal" />
        </label>
        <label className="label">
          Contraseña
          <input key={attempt} name="password" type="password" required autoComplete="current-password" autoFocus={attempt > 0} className="input mt-1 font-normal normal-case tracking-normal" />
        </label>
        <SubmitButton pendingText="Ingresando…">Ingresar</SubmitButton>
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
