import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { resendVerification } from "../auth-actions";

export const metadata = { title: "Confirma tu correo", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string; enviado?: string; error?: string }> }) {
  const { email, enviado, error } = await searchParams;
  return (
    <AuthCard title="Confirma tu correo" error={error}>
      <div className="space-y-4 text-sm">
        {enviado && (
          <p className="rounded-lg bg-good-soft px-3 py-2 text-good">
            Te enviamos un enlace{email ? <> a <strong>{email}</strong></> : null}. Ábrelo para activar tu cuenta.
          </p>
        )}
        <p className="text-muted">
          Revisa tu bandeja de entrada y la carpeta de spam. El enlace vence en 24 horas. Después de confirmar entrarás
          directamente a tu cuenta.
        </p>
        <form action={resendVerification} className="space-y-3 border-t border-line pt-4">
          <label className="label">
            ¿No te llegó? Reenviar a
            <input name="email" type="email" required defaultValue={email} autoComplete="email" className="input mt-1 font-normal normal-case tracking-normal" />
          </label>
          <button className="btn-ghost w-full">Reenviar correo de confirmación</button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/ingresar" className="text-accent underline">Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}
