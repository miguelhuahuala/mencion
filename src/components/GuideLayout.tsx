import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, guide } from "@/lib/guides";
import { ORGANIZATION, absolute } from "@/lib/site";
import { Breadcrumbs, Faq, JsonLd, PageCta, prose } from "./Seo";

const fmt = (iso: string) => new Date(`${iso}T12:00:00-05:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Lima" });

/** Metadata estándar de una guía. */
export function guideMetadata(slug: string): Metadata {
  const g = guide(slug);
  const path = `/guias/${slug}`;
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: path },
    openGraph: { type: "article", title: g.title, description: g.description, url: path, publishedTime: g.published },
  };
}

/**
 * Plantilla de guía: migas, encabezado, índice, cuerpo con estilo de texto largo, Article (JSON-LD),
 * guías relacionadas, preguntas frecuentes y llamada a la acción.
 */
export function GuideLayout({
  slug,
  intro,
  toc,
  faqs,
  related,
  children,
}: {
  slug: string;
  intro: string;
  toc: [string, string][]; // [id, título]
  faqs: [string, string][];
  related: string[]; // slugs de otras guías
  children: React.ReactNode;
}) {
  const g = guide(slug);
  const path = `/guias/${slug}`;
  const rel = related.map(guide);
  return (
    <div className="space-y-16 pb-8">
      <article>
        <Breadcrumbs items={[{ name: "Guías", href: "/guias" }, { name: g.short, href: path }]} />
        <header className="mt-6 max-w-3xl">
          <span className="chip bg-accent-soft text-accent">Guía</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{g.h1}</h1>
          <p className="mt-5 text-lg text-muted text-pretty">{intro}</p>
          <p className="mt-4 text-sm text-muted">
            Por el equipo de Menciones · <time dateTime={g.published}>{fmt(g.published)}</time>
          </p>
        </header>

        <div className={`mt-10 ${prose}`}>
          <nav aria-label="Contenido" className="card p-5 text-base">
            <p className="font-semibold text-ink">En esta guía</p>
            <ol>
              {toc.map(([id, t]) => (
                <li key={id}><a href={`#${id}`}>{t}</a></li>
              ))}
            </ol>
          </nav>
          {children}
        </div>

        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.h1,
            description: g.description,
            inLanguage: "es",
            datePublished: g.published,
            dateModified: g.published,
            mainEntityOfPage: absolute(path),
            author: ORGANIZATION,
            publisher: ORGANIZATION,
          }}
        />
      </article>

      {rel.length > 0 && (
        <section className="max-w-3xl">
          <h2 className="text-xl font-semibold">Sigue leyendo</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {rel.map((r) => (
              <Link key={r.slug} href={`/guias/${r.slug}`} className="card p-4 hover:border-accent/40">
                <span className="font-medium">{r.short}</span>
                <span className="mt-1 block text-sm text-muted">{r.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Faq items={faqs} />
      <PageCta title="Mide tu marca en la IA" text="Descubre gratis si ChatGPT, Claude, Gemini y Perplexity recomiendan tu marca." />
    </div>
  );
}

/** Las guías que no son la actual, para enlazar desde otras páginas. */
export const otherGuides = (exclude: string) => GUIDES.filter((g) => g.slug !== exclude);
