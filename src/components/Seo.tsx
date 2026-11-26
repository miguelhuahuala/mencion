import Link from "next/link";
import { absolute } from "@/lib/site";

/** Datos estructurados (schema.org) en JSON-LD. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // "<" escapado para que el contenido no pueda cerrar la etiqueta <script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export type Crumb = { name: string; href: string };

/** Migas de pan visibles + BreadcrumbList. "Inicio" se agrega solo. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Inicio", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Migas de pan" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {i < all.length - 1 ? (
                <Link href={c.href} className="hover:text-ink">{c.name}</Link>
              ) : (
                <span aria-current="page" className="text-ink">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absolute(c.href) })),
        }}
      />
    </>
  );
}

/** Preguntas frecuentes desplegables + FAQPage. */
export function Faq({ items, title = "Preguntas frecuentes" }: { items: [string, string][]; title?: string }) {
  return (
    <section className="max-w-3xl">
      <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
        {items.map(([q, a]) => (
          <details key={q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {q}
              <span aria-hidden className="text-muted transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-muted">{a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
    </section>
  );
}

/** Llamada a la acción al final de las páginas públicas. */
export function PageCta({
  title = "Descubre qué dicen las IAs de tu marca",
  text = "Tu primera medición en ChatGPT, Claude, Gemini y Perplexity, gratis.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="rounded-3xl bg-ink px-6 py-12 text-center text-white sm:px-12">
      <h2 className="text-3xl font-semibold tracking-tight text-balance">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-white/70">{text}</p>
      <Link href="/registro" className="btn mt-7 bg-white px-6 py-2.5 text-base text-ink hover:bg-white/90">Empieza gratis</Link>
    </section>
  );
}

/** Estilo de texto largo (guías, metodología, términos) sin depender de un plugin de tipografía. */
export const prose =
  "max-w-3xl text-[17px] leading-relaxed text-ink/90 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink " +
  "[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 " +
  "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-ink";
