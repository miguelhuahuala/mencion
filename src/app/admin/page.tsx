import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { monthlyBudget } from "@/lib/limits";
import { dateTime, usd } from "@/lib/format";
import { deleteUserAsAdmin, testDataForSeo } from "./actions";

export const metadata = { title: "Administración", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const me = await requireUser();
  if (me.role !== "admin") redirect("/");
  const { error, ok } = await searchParams;

  const [users, budget] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { projects: true } } },
    }),
    monthlyBudget(),
  ]);
  const verified = users.filter((u) => u.emailVerifiedAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Administración</h1>
          <p className="text-sm text-muted">
            {users.length} usuarios · {verified} con correo confirmado · gasto del mes {usd(budget.spent)} de {budget.cap ? usd(budget.cap) : "sin tope"}
          </p>
        </div>
        <form action={testDataForSeo}>
          <button className="btn-ghost" title="Usa una consulta gratuita de DataForSEO; no consume saldo">Probar conexión con DataForSEO</button>
        </form>
      </div>
      {error && <div role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">{error}</div>}
      {ok && <div role="status" className="rounded-xl border border-good/30 bg-good-soft px-4 py-3 text-sm text-good">{ok}</div>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Proyectos</th>
              <th className="px-4 py-3 font-semibold">Registro</th>
              <th className="px-4 py-3 font-semibold">Eliminar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  {u.email} {u.role === "admin" && <span className="chip ml-1 bg-accent-soft text-accent">admin</span>}
                </td>
                <td className="px-4 py-3">
                  {u.emailVerifiedAt ? <span className="chip bg-good-soft text-good">Confirmado</span> : <span className="chip bg-warn-soft text-warn">Sin confirmar</span>}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">{u._count.projects}</td>
                <td className="px-4 py-3 text-muted">{dateTime(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.id === me.id ? (
                    <span className="text-xs text-muted">tú</span>
                  ) : (
                    <form action={deleteUserAsAdmin} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <input name="confirm" required placeholder="escribe el correo" aria-label={`Confirmar eliminación de ${u.email}`} className="input w-48 py-1 text-xs" />
                      <button className="btn border border-bad/40 bg-white px-3 py-1 text-xs text-bad hover:bg-bad-soft">Eliminar</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">Eliminar borra la cuenta, sus proyectos y todas sus mediciones. No se puede deshacer.</p>
    </div>
  );
}
