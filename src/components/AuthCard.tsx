export function AuthCard({
  title,
  subtitle,
  error,
  attempt,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  error?: string;
  /** Número de envío: solo sirve para volver a animar el aviso en cada error (no se muestra). */
  attempt?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-sm py-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      {error ? (
        <div
          key={attempt ?? error}
          role="alert"
          aria-live="assertive"
          className="mt-4 flex items-start gap-2 rounded-lg border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad motion-safe:animate-shake"
        >
          <span aria-hidden>⚠️</span>
          <span>
            {error}
          </span>
        </div>
      ) : null}
      <div className="card mt-5 p-5">{children}</div>
    </div>
  );
}
