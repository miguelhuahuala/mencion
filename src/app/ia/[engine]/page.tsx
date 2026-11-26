import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ENGINES, ENGINE_LABEL, type Engine } from "@/lib/types";
import { ENGINE_PAGES } from "@/lib/engine-pages";
import { METRIC_INFO } from "@/lib/metrics";
import { EngineLogo } from "@/components/EngineLogo";
import { Breadcrumbs, Faq, PageCta } from "@/components/Seo";

export const dynamicParams = false;
export const generateStaticParams = () => ENGINES.map((engine) => ({ engine }));

const isEngine = (v: string): v is Engine => (ENGINES as readonly string[]).includes(v);

export async function generateMetadata({ params }: { params: Promise<{ engine: string }> }): Promise<Metadata> {
  const { engine } = await params;
  if (!isEngine(engine)) return {};
  const p = ENGINE_PAGES[engine];
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/ia/${engine}` },
    openGraph: { title: p.title, description: p.description, url: `/ia/${engine}` },
  };
}

export default async function EnginePage({ params }: { params: Promise<{ engine: string }> }) {
  const { engine } = await params;
  if (!isEngine(engine)) notFound();
  const p = ENGINE_PAGES[engine];
  const label = ENGINE_LABEL[engine];
  const others = ENGINES.filter((e) => e !== engine);

  return (
    <div className="space-y-20 pb-8">
      <section className="max-w-3xl">
        <Breadcrumbs items={[{ name: `Tu marca en ${label}`, href: `/ia/${engine}` }]} />
        <div className="mt-6 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl border border-line bg-white"><EngineLogo engine={engine} size={26} /></span>
          <span className="chip bg-accent-soft text-accent">Visibilidad en {label}</span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{p.h1}</h1>
        <p className="mt-5 text-lg text-muted text-pretty">{p.intro}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/registro" className="btn-primary px-5 py-2.5 text-base">Mide tu marca gratis</Link>
          <Link href="/metodologia" className="btn-ghost px-5 py-2.5 text-base">Cómo medimos</Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Cómo medimos tu marca en {label}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {p.how.map((h) => (
              <li key={h} className="flex gap-3"><span aria-hidden className="mt-0.5 text-accent">✓</span><span>{h}</span></li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Por qué importa</h2>
          <p className="mt-4 text-sm text-muted">{p.why}</p>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold tracking-tight">Qué verás en tu panel</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Visibilidad", METRIC_INFO.visibility],
              ["Posición", METRIC_INFO.position],
              ["Share of voice", METRIC_INFO.share],
              ["Fuentes citadas", METRIC_INFO.cited],
            ] as const
          ).map(([t, d]) => (
            <div key={t} className="card p-5">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-tight">Cómo mejorar tu visibilidad en {label}</h2>
        <ul className="mt-6 space-y-3">
          {p.tips.map((t) => (
            <li key={t} className="flex gap-3"><span aria-hidden className="mt-0.5 font-mono text-accent">→</span><span>{t}</span></li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          ¿Quieres entender el enfoque completo? Lee nuestra guía <Link href="/guias/que-es-geo" className="text-accent underline underline-offset-2">Qué es GEO (Generative Engine Optimization)</Link>.
        </p>
      </section>

      <Faq items={p.faqs} />

      <section>
        <h2 className="text-xl font-semibold">Mide tu marca también en</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {others.map((e) => (
            <Link key={e} href={`/ia/${e}`} className="card flex items-center gap-3 p-4 hover:border-accent/40">
              <span className="grid size-10 place-items-center rounded-xl bg-surface"><EngineLogo engine={e} size={22} /></span>
              <span className="font-medium">Tu marca en {ENGINE_LABEL[e]}</span>
            </Link>
          ))}
        </div>
      </section>

      <PageCta title={`Descubre si ${label} recomienda tu marca`} />
    </div>
  );
}
