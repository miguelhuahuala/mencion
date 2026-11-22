import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { requestReset } from "../account-actions";

export const metadata = { title: "Recuperar contraseña" };
export const dynamic = "force-dynamic";

export default async function ForgotPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string; sent?: string }> }) {
  const { error, email, sent } = await searchParams;
  return (
    <AuthCard title="Recuperar contraseña" subtitle="Te enviaremos un enlace para crear una nueva." error={error}>
      {sent ? (
        <div className="space-y-3 text-sm">
          <p className="rounded-lg bg-good-soft px-3 py-2 text-good">
            Si existe una cuenta con ese correo, te enviamos un enlace. Revisa tu bandeja de entrada y la carpeta de spam.
          </p>
          <p className="text-muted">El enlace vence en 60 minutos.</p>
        </div>
      ) : (
        <form action={requestReset} className="space-y-4">
          <label className="label">
            Correo de tu cuenta
            <input name="email" type="email" required autoComplete="email" defaultValue={email} className="input mt-1 font-normal normal-case tracking-normal" />
          </label>
          <button className="btn-primary w-full">Enviar enlace</button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/ingresar" className="text-accent underline">Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}
