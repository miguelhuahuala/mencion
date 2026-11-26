import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { Breadcrumbs, PageCta } from "@/components/Seo";

const TITLE = "Guías de GEO: posiciona tu marca en la IA";
const DESCRIPTION =
  "Guías prácticas sobre GEO: qué es, en qué se diferencia del SEO, cómo aparecer en ChatGPT, qué fuentes usan las IAs y cómo medir tu visibilidad.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guias" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/guias" },
};

export default function GuidesIndex() {
  const [pillar, ...rest] = GUIDES;
  return (
    <div className="space-y-16 pb-8">
      <section className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Guías", href: "/guias" }]} />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Guías para posicionar tu marca en la IA</h1>
        <p className="mt-5 text-lg text-muted text-pretty">
          Todo lo que necesitas para entender el GEO y medir si ChatGPT, Claude, Gemini y Perplexity recomiendan tu marca.
        </p>
      </section>

      <Link href={`/guias/${pillar.slug}`} className="card block p-8 hover:border-accent/40">
        <span className="chip bg-accent-soft text-accent">Empieza aquí</span>
        <h2 className="mt-3 text-2xl font-semibold">{pillar.h1}</h2>
        <p className="mt-2 text-muted">{pillar.description}</p>
      </Link>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((g) => (
          <Link key={g.slug} href={`/guias/${g.slug}`} className="card p-6 hover:border-accent/40">
            <h2 className="font-semibold">{g.short}</h2>
            <p className="mt-2 text-sm text-muted">{g.description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-accent">Leer guía →</span>
          </Link>
        ))}
      </section>

      <PageCta />
    </div>
  );
}
