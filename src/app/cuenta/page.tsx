import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { limitsFor } from "@/lib/limits";
import { dateTime } from "@/lib/format";
import { changePassword, deleteAccount } from "../account-actions";

export const metadata = { title: "Mi cuenta" };
export const dynamic = "force-dynamic";

const field = "input mt-1 font-normal normal-case tracking-normal";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const user = await requireUser();
  const { error, ok } = await searchParams;
  const projects = await db.project.count({ where: { userId: user.id } });
  const l = limitsFor(user);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-ink">← Mis proyectos</Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Mi cuenta</h1>
      </div>
      {error && <div role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">{error}</div>}
      {ok && <div role="status" className="rounded-xl border border-good/30 bg-good-soft px-4 py-3 text-sm text-good">{ok}</div>}

      <section className="card grid gap-3 p-5 text-sm sm:grid-cols-2">
        <div><div className="label">Correo</div><div className="mt-1">{user.email}</div></div>
        <div><div className="label">Plan</div><div className="mt-1">{user.role === "admin" ? "Administrador (sin límites)" : `Gratis · ${l.maxProjects} proyecto · ${l.maxPrompts} prompts · semanal`}</div></div>
        <div><div className="label">Proyectos</div><div className="mt-1">{projects}</div></div>
        <div><div className="label">Miembro desde</div><div className="mt-1">{dateTime(user.createdAt)}</div></div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Cambiar contraseña</h2>
        <form action={changePassword} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="label">Contraseña actual<input name="current" type="password" required autoComplete="current-password" className={field} /></label>
          <label className="label">Nueva contraseña (mín. 8)<input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} /></label>
          <div className="sm:col-span-2"><button className="btn-primary">Actualizar contraseña</button></div>
        </form>
      </section>

      <section className="card border-bad/30 p-5">
        <h2 className="font-semibold text-bad">Eliminar mi cuenta</h2>
        <p className="mt-1 text-sm text-muted">Se borran tu cuenta, tus proyectos y todo su historial de mediciones. No se puede deshacer.</p>
        <form action={deleteAccount} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="label">Escribe tu correo para confirmar<input name="confirm" type="email" required className={field} placeholder={user.email} /></label>
          <label className="label">Tu contraseña<input name="password" type="password" required autoComplete="current-password" className={field} /></label>
          <div className="sm:col-span-2"><button className="btn border border-bad/40 bg-white text-bad hover:bg-bad-soft">Eliminar cuenta definitivamente</button></div>
        </form>
      </section>
    </div>
  );
}
