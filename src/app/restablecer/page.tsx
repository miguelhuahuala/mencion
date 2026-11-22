import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { resetPassword } from "../account-actions";

export const metadata = { title: "Nueva contraseña", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  if (!token) {
    return (
      <AuthCard title="Enlace incompleto" error="Falta el código del enlace.">
        <Link href="/recuperar" className="btn-primary w-full">Pedir un enlace nuevo</Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Crea una nueva contraseña" error={error}>
      <form action={resetPassword} className="space-y-4">
        <input type="hidden" name="token" value={token} />
        <label className="label">
          Nueva contraseña (mínimo 8 caracteres)
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="input mt-1 font-normal normal-case tracking-normal" />
        </label>
        <button className="btn-primary w-full">Guardar contraseña</button>
      </form>
    </AuthCard>
  );
}
