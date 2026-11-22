import Link from "next/link";
import { freeLimits } from "@/lib/limits";

const steps = [
  ["Configura tu marca", "Tu marca, tu dominio, tus competidores y las preguntas que tus clientes le hacen a la IA."],
  ["Preguntamos a 4 IAs", "Hacemos esas preguntas en ChatGPT, Claude, Gemini y Perplexity, con búsqueda web y desde tu país."],
  ["Mide y actúa", "Ves en cuántas respuestas apareces, en qué posición, frente a quién y qué sitios citan las IAs."],
];

const metrics = [
  ["Visibilidad", "% de respuestas que mencionan tu marca"],
  ["Share of voice", "Tus menciones frente a las de tu competencia"],
  ["Posición", "Si la IA te nombra primero o al final"],
  ["Fuentes", "Los dominios que citan las IAs y dónde conviene aparecer"],
];

export function Landing() {
  const l = freeLimits();
  return (
    <div className="space-y-16 py-4">
      <section className="max-w-3xl">
        <p className="chip bg-accent-soft text-accent">Para equipos de marketing y SEO</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">¿Las IAs recomiendan tu marca?</h1>
        <p className="mt-4 text-lg text-muted">
          Cada vez más clientes le preguntan a ChatGPT antes que a Google. Mencion mide en cuántas respuestas de ChatGPT, Claude,
          Gemini y Perplexity aparece tu marca, en qué posición y con qué fuentes, frente a tu competencia.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/registro" className="btn-primary px-5 py-2.5 text-base">Empieza gratis</Link>
          <Link href="/ingresar" className="btn-ghost px-5 py-2.5 text-base">Ya tengo cuenta</Link>
        </div>
        <p className="mt-3 text-sm text-muted">Sin tarjeta y sin instalar nada: funciona en el navegador.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {steps.map(([title, text], i) => (
          <div key={title} className="card p-5">
            <div className="font-mono text-sm text-accent">0{i + 1}</div>
            <h2 className="mt-2 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Lo que mides</h2>
          <ul className="mt-4 space-y-3">
            {metrics.map(([m, d]) => (
              <li key={m} className="flex gap-3">
                <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                <span><strong>{m}:</strong> <span className="text-muted">{d}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <div className="label">Plan gratis</div>
          <div className="mt-2 text-3xl font-semibold">$0</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>✓ {l.maxProjects} proyecto (tu marca y hasta 10 competidores)</li>
            <li>✓ Hasta {l.maxPrompts} prompts</li>
            <li>✓ ChatGPT, Claude, Gemini y Perplexity</li>
            <li>✓ 1 medición cada {l.intervalDays} días e historial de tendencia</li>
          </ul>
          <Link href="/registro" className="btn-primary mt-6 w-full">Crear cuenta gratis</Link>
        </div>
      </section>
    </div>
  );
}
