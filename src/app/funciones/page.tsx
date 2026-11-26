import type { Metadata } from "next";
import Link from "next/link";
import { FEATURES } from "@/lib/feature-pages";
import { Breadcrumbs, PageCta } from "@/components/Seo";

const TITLE = "Funciones: mide tu marca en ChatGPT y otras IAs";
const DESCRIPTION =
  "Todo lo que mide Menciones en ChatGPT, Claude, Gemini y Perplexity: visibilidad, share of voice, posición, sentiment, fuentes y sugerencias de prompts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/funciones" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/funciones" },
};

export default function FeaturesIndex() {
  return (
    <div className="space-y-16 pb-8">
      <section className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Funciones", href: "/funciones" }]} />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Todo lo que mide Menciones</h1>
        <p className="mt-5 text-lg text-muted text-pretty">
          Cinco métricas para saber cómo te ve la IA frente a tu competencia, y una herramienta para descubrir qué le preguntan
          tus clientes.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Link key={f.slug} href={`/funciones/${f.slug}`} className="card p-6 hover:border-accent/40">
            <h2 className="font-semibold">{f.short}</h2>
            <p className="mt-2 text-sm text-muted">{f.what}</p>
            <span className="mt-4 inline-block text-sm font-medium text-accent">Ver más →</span>
          </Link>
        ))}
      </section>
      <PageCta />
    </div>
  );
}
