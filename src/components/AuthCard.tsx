export function AuthCard({ title, subtitle, error, children }: { title: string; subtitle?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-sm py-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      {error ? (
        <div role="alert" className="mt-4 rounded-lg border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">
          {error}
        </div>
      ) : null}
      <div className="card mt-5 p-5">{children}</div>
    </div>
  );
}
