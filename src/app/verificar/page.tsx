import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { confirmCode, resendVerification } from "../auth-actions";

export const metadata = { title: "Confirma tu correo", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string; enviado?: string; error?: string }> }) {
  const { email, enviado, error } = await searchParams;
  return (
    <AuthCard title="Confirma tu correo" error={error}>
      <div className="space-y-4 text-sm">
        {enviado && (
          <p className="rounded-lg bg-good-soft px-3 py-2 text-good">
            Te enviamos un código de 6 dígitos{email ? <> a <strong>{email}</strong></> : null}.
          </p>
        )}
        <form action={confirmCode} className="space-y-3">
          {email ? (
            <input type="hidden" name="email" value={email} />
          ) : (
            <label className="label">
              Correo
              <input name="email" type="email" required autoComplete="email" className="input mt-1 font-normal normal-case tracking-normal" />
            </label>
          )}
          <label className="label">
            Código de confirmación
            <input
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              placeholder="123 456"
              autoFocus
              className="input mt-1 text-center font-mono text-2xl tracking-[0.3em] font-normal normal-case"
            />
          </label>
          <button className="btn-primary w-full">Confirmar</button>
        </form>
        <p className="text-muted">Revisa también la carpeta de spam. El código vence en 30 minutos.</p>
        <form action={resendVerification} className="space-y-3 border-t border-line pt-4">
          <label className="label">
            ¿No te llegó? Enviar un código nuevo a
            <input name="email" type="email" required defaultValue={email} autoComplete="email" className="input mt-1 font-normal normal-case tracking-normal" />
          </label>
          <button className="btn-ghost w-full">Enviar código nuevo</button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/ingresar" className="text-accent underline">Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}
