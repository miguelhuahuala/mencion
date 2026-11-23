import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";
import { requestReset } from "../account-actions";

export const metadata = { title: "Recuperar contraseña" };
export const dynamic = "force-dynamic";

export default async function ForgotPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string }> }) {
  const { error, email } = await searchParams;
  return (
    <AuthCard title="Recuperar contraseña" subtitle="Te enviaremos un código de 6 dígitos para crear una nueva." error={error}>
      <form action={requestReset} className="space-y-4">
        <label className="label">
          Correo de tu cuenta
          <input name="email" type="email" required autoComplete="email" defaultValue={email} className="input mt-1 font-normal normal-case tracking-normal" />
        </label>
        <SubmitButton pendingText="Enviando código…">Enviar código</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/ingresar" className="text-accent underline">Volver a ingresar</Link>
      </p>
    </AuthCard>
  );
}
