import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";
import { requestReset, resetPassword } from "../account-actions";

export const metadata = { title: "Nueva contraseña", robots: { index: false } };
export const dynamic = "force-dynamic";

const field = "input mt-1 font-normal normal-case tracking-normal";

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ email?: string; enviado?: string; error?: string }> }) {
  const { email, enviado, error } = await searchParams;
  return (
    <AuthCard title="Crea una nueva contraseña" error={error}>
      <div className="space-y-4 text-sm">
        {enviado && (
          <p className="rounded-lg bg-good-soft px-3 py-2 text-good">
            Si existe una cuenta con {email ? <strong>{email}</strong> : "ese correo"}, te enviamos un código de 6 dígitos.
          </p>
        )}
        <form action={resetPassword} className="space-y-4">
          {email ? (
            <input type="hidden" name="email" value={email} />
          ) : (
            <label className="label">Correo<input name="email" type="email" required autoComplete="email" className={field} /></label>
          )}
          <label className="label">
            Código del correo
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
          <label className="label">
            Nueva contraseña (mínimo 8 caracteres)
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
          </label>
          <SubmitButton pendingText="Guardando…">Guardar contraseña</SubmitButton>
        </form>
        <p className="text-muted">Revisa también la carpeta de spam. El código vence en 30 minutos.</p>
        {email && (
          <form action={requestReset} className="border-t border-line pt-4">
            <input type="hidden" name="email" value={email} />
            <SubmitButton pendingText="Enviando…" className="btn-ghost w-full">Enviar código nuevo</SubmitButton>
          </form>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/ingresar" className="text-accent underline">Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}
