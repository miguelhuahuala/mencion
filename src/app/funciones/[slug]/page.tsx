import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURES, feature } from "@/lib/feature-pages";
import { guide } from "@/lib/guides";
import { Breadcrumbs, Faq, PageCta } from "@/components/Seo";

export const dynamicParams = false;
export const generateStaticParams = () => FEATURES.map((f) => ({ slug: f.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const f = feature((await params).slug);
  if (!f) return {};
  const path = `/funciones/${f.slug}`;
  return { title: f.title, description: f.description, alternates: { canonical: path }, openGraph: { title: f.title, description: f.description, url: path } };
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const f = feature((await params).slug);
  if (!f) notFound();
  const g = guide(f.guide);
  const others = FEATURES.filter((x) => x.slug !== f.slug);

  return (
    <div className="space-y-20 pb-8">
      <section className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Funciones", href: "/funciones" }, { name: f.short, href: `/funciones/${f.slug}` }]} />
        <span className="chip mt-6 bg-accent-soft text-accent">{f.short}</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{f.h1}</h1>
        <p className="mt-5 text-lg text-muted text-pretty">{f.intro}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/registro" className="btn-primary px-5 py-2.5 text-base">Empieza gratis</Link>
          <Link href="/metodologia" className="btn-ghost px-5 py-2.5 text-base">Ver metodología</Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Qué es</h2>
          <p className="mt-3 text-muted">{f.what}</p>
          <div className="mt-5 rounded-xl bg-surface p-4 text-sm">
            <span className="font-semibold">Ejemplo: </span>
            {f.example}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Cómo lo calculamos</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {f.how.map((h, i) => (
              <li key={h} className="flex gap-3">
                <span className="font-mono text-accent">0{i + 1}</span>
                <span>{h}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-tight">Para qué te sirve</h2>
        <ul className="mt-6 space-y-3">
          {f.useFor.map((u) => (
            <li key={u} className="flex gap-3"><span aria-hidden className="mt-0.5 text-accent">✓</span><span>{u}</span></li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Profundiza en la guía <Link href={`/guias/${g.slug}`} className="text-accent underline underline-offset-2">{g.short}</Link>.
        </p>
      </section>

      <Faq items={f.faqs} />

      <section>
        <h2 className="text-xl font-semibold">Otras funciones</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {others.map((o) => (
            <Link key={o.slug} href={`/funciones/${o.slug}`} className="card p-4 text-sm font-medium hover:border-accent/40">{o.short} →</Link>
          ))}
        </div>
      </section>

      <PageCta />
    </div>
  );
}
