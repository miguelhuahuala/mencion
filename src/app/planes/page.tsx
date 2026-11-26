import type { Metadata } from "next";
import Link from "next/link";
import { freeLimits } from "@/lib/limits";
import { SITE } from "@/lib/site";
import { Breadcrumbs, Faq, JsonLd, PageCta } from "@/components/Seo";

const TITLE = "Planes y precios: empieza gratis";
const DESCRIPTION =
  "Mide gratis tu visibilidad en ChatGPT, Claude, Gemini y Perplexity: 1 proyecto, hasta 5 preguntas y una medición semanal. Sin tarjeta.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/planes" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/planes" },
};

export default function PlansPage() {
  const l = freeLimits();
  const faqs: [string, string][] = [
    ["¿Necesito tarjeta para empezar?", "No. El plan gratis no pide tarjeta ni datos de pago."],
    ["¿Qué pasa cuando llego al límite del plan gratis?", `Puedes seguir viendo tus resultados. La siguiente medición estará disponible ${l.intervalDays} días después de la anterior.`],
    ["¿Habrá planes de pago?", "Sí, estamos preparando planes para agencias y equipos de marketing con más marcas, más preguntas y mediciones más frecuentes."],
    ["¿Puedo eliminar mi cuenta?", "Sí, cuando quieras desde “Mi cuenta”. Se borran tu cuenta y todos sus datos."],
  ];
  return (
    <div className="space-y-20 pb-8">
      <section className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Planes", href: "/planes" }]} />
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Empieza gratis, sin tarjeta</h1>
        <p className="mt-5 text-lg text-muted text-pretty">
          Mide tu marca en ChatGPT, Claude, Gemini y Perplexity con el plan gratis. Para agencias y equipos estamos preparando
          planes con más capacidad.
        </p>
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="label">Plan gratis</h2>
          <div className="mt-2 text-4xl font-semibold">$0</div>
          <ul className="mt-5 space-y-2 text-sm">
            <li>✓ {l.maxProjects} proyecto: tu marca y hasta 10 competidores</li>
            <li>✓ Hasta {l.maxPrompts} preguntas (prompts)</li>
            <li>✓ ChatGPT, Claude, Gemini y Perplexity</li>
            <li>✓ Respuestas localizadas en tu país e idioma</li>
            <li>✓ 1 medición cada {l.intervalDays} días con historial de tendencia</li>
            <li>✓ Visibilidad, posición, share of voice y fuentes citadas</li>
            <li>✓ Sugerencias de las preguntas más buscadas en tu categoría</li>
          </ul>
          <Link href="/registro" className="btn-primary mt-6 w-full">Crear cuenta gratis</Link>
        </div>
        <div className="card p-6">
          <h2 className="label">Agencias y equipos</h2>
          <div className="mt-2 text-xl font-semibold">Próximamente</div>
          <p className="mt-2 text-sm text-muted">
            Más marcas, más preguntas y mediciones más frecuentes. Crea tu cuenta gratis y te avisaremos cuando estén disponibles,
            o escríbenos por WhatsApp desde el botón de esta página.
          </p>
        </div>
      </section>

      <Faq items={faqs} />
      <PageCta />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Menciones",
          url: SITE,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", name: "Plan gratis", price: "0", priceCurrency: "USD" },
        }}
      />
    </div>
  );
}
