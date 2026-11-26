import Link from "next/link";
import { freeLimits } from "@/lib/limits";
import { ENGINES, ENGINE_LABEL, type Engine } from "@/lib/types";
import { DashboardPreview } from "./DashboardPreview";
import { EngineLogo } from "./EngineLogo";
import { Faq, JsonLd, PageCta } from "./Seo";
import { ORGANIZATION, SITE } from "@/lib/site";

const engineNotes: Record<Engine, string> = {
  chatgpt: "La respuesta tal como la ve un usuario de tu país en chatgpt.com, con sus fuentes.",
  claude: "Con búsqueda web y el contexto de tu país e idioma.",
  gemini: "El asistente de Google, con búsqueda web y el contexto de tu país.",
  perplexity: "El buscador con IA más usado para investigar compras, localizado en tu país.",
};

const values = [
  {
    title: "Sabe si la IA te recomienda",
    text: "Cuando alguien pregunta “¿cuál es la mejor opción?”, ¿aparece tu marca? ¿En qué lugar? Lo medimos en cada IA y en cada pregunta.",
    icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-1 13-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z",
  },
  {
    title: "Compárate con tu competencia",
    text: "Visibilidad, share of voice y posición frente a hasta 10 competidores. Descubre en qué preguntas te están ganando.",
    icon: "M4 20V10h3v10H4Zm6.5 0V4h3v16h-3ZM17 20v-7h3v7h-3Z",
  },
  {
    title: "Descubre qué fuentes citan",
    text: "Las IAs se apoyan en webs concretas: medios, comparadores, foros. Te mostramos cuáles, para que sepas dónde conseguir presencia.",
    icon: "M10.6 13.4a1 1 0 0 1 0-1.4l3.4-3.4a3 3 0 1 1 4.2 4.2l-2 2-1.4-1.4 2-2a1 1 0 0 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0ZM13.4 10.6a1 1 0 0 1 0 1.4L10 15.4a3 3 0 1 1-4.2-4.2l2-2 1.4 1.4-2 2a1 1 0 0 0 1.4 1.4L12 10.6a1 1 0 0 1 1.4 0Z",
  },
  {
    title: "Mide si tu estrategia funciona",
    text: "Cada medición queda guardada. Ve la tendencia semana a semana y comprueba si tu contenido y tu PR mueven la aguja.",
    icon: "M3 17l6-6 4 4 8-8v4h2V3h-8v2h4l-6 6-4-4-7.4 7.4L3 17Z",
  },
];

const steps = [
  ["Configura tu marca", "Tu marca, tu dominio, tus competidores y las preguntas que tus clientes le hacen a la IA."],
  ["Preguntamos a 4 IAs", "Hacemos esas preguntas en ChatGPT, Claude, Gemini y Perplexity, con búsqueda web y desde tu país."],
  ["Mide y actúa", "Ves en cuántas respuestas apareces, en qué posición, frente a quién y qué sitios citan las IAs."],
];

const faqs: [string, string][] = [
  ["¿Por qué importa aparecer en las respuestas de IA?", "Además de buscar en Google, cada vez más personas le preguntan a ChatGPT o Perplexity qué comprar o a quién contratar. Si la IA no te menciona, ese cliente ni siquiera llega a conocerte. Optimizar para esto se conoce como GEO (Generative Engine Optimization)."],
  ["¿Las respuestas corresponden a mi país?", "Sí. Preguntamos como lo haría una persona en el país e idioma que elijas en tu proyecto: ChatGPT responde con esa ubicación y a Claude, Gemini y Perplexity les indicamos el país y el idioma. Así ves las marcas que la IA recomienda en tu mercado, no las de Estados Unidos o España."],
  ["¿De dónde salen los datos?", "Hacemos tus preguntas en cada IA a través de DataForSEO, con búsqueda web activada y localizada en tu país, y analizamos las respuestas reales. No estimamos ni inventamos resultados."],
  ["¿Cada cuánto se mide?", "En el plan gratis, una vez por semana. Cada medición queda guardada para que veas la evolución."],
  ["¿Tengo que instalar algo?", "No. Menciones funciona en el navegador, desde la computadora o el celular. Creas tu cuenta y listo."],
  ["¿Qué hacen con mis datos?", "Solo los usamos para darte el servicio y no los vendemos. Puedes eliminar tu cuenta y todos tus datos cuando quieras desde “Mi cuenta”."],
];

export function Landing({ deleted = false }: { deleted?: boolean }) {
  const l = freeLimits();
  return (
    <div className="space-y-24 pb-8">
      {deleted && (
        <div role="status" className="rounded-xl border border-good/30 bg-good-soft px-4 py-3 text-sm text-good">
          Tu cuenta y todos sus datos se eliminaron.
        </div>
      )}
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-12 pt-6 lg:grid-cols-[1fr_1.15fr] [&>*]:min-w-0">
        <div>
          <p className="chip bg-accent-soft text-accent">GEO · Visibilidad en IA</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Antes de comprarte, tus clientes le preguntan a la IA.
          </h1>
          <p className="mt-5 text-lg text-muted text-pretty">
            Descubre si ChatGPT, Claude, Gemini y Perplexity te recomiendan, en qué posición te ubican y cómo te comparan con tu competencia.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/registro" className="btn-primary px-5 py-2.5 text-base">Empieza gratis</Link>
            <a href="#como-funciona" className="btn-ghost px-5 py-2.5 text-base">Cómo funciona</a>
          </div>
          <p className="mt-3 text-sm text-muted">Gratis, sin tarjeta y sin instalar nada.</p>
        </div>
        <DashboardPreview />
      </section>

      {/* IAs */}
      <section aria-labelledby="ias">
        <p id="ias" className="text-center text-sm font-semibold uppercase tracking-wide text-muted">Medimos tu marca en las IAs que usan tus clientes</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENGINES.map((e) => (
            <Link key={e} href={`/ia/${e}`} className="card flex items-start gap-3 p-5 transition hover:border-accent/40">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface"><EngineLogo engine={e} size={24} /></span>
              <div>
                <div className="font-semibold">{ENGINE_LABEL[e]}</div>
                <p className="mt-0.5 text-sm text-muted">{engineNotes[e]}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Propuesta de valor */}
      <section>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">El SEO de siempre ya no basta</h2>
          <p className="mt-3 text-muted">
            Google te muestra 10 enlaces; la IA da una sola respuesta y nombra a 3 o 4 marcas. Si no estás entre ellas, no existes
            para ese cliente. Menciones te dice dónde estás y qué hacer.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="card p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-accent)" aria-hidden><path d={v.icon} /></svg>
              </span>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="scroll-mt-8">
        <h2 className="text-3xl font-semibold tracking-tight">Cómo funciona</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map(([title, text], i) => (
            <div key={title} className="card p-6">
              <div className="font-mono text-sm text-accent">0{i + 1}</div>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planes */}
      <section className="grid items-start gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Empieza gratis</h2>
          <p className="mt-3 text-muted">
            Sin tarjeta. Crea tu proyecto en un minuto y recibe tu primera medición en las 4 IAs.
          </p>
          <div className="card mt-6 p-6">
            <div className="label">Plan gratis</div>
            <div className="mt-2 text-4xl font-semibold">$0</div>
            <ul className="mt-5 space-y-2 text-sm">
              <li>✓ {l.maxProjects} proyecto: tu marca y hasta 10 competidores</li>
              <li>✓ Hasta {l.maxPrompts} preguntas (prompts)</li>
              <li>✓ ChatGPT, Claude, Gemini y Perplexity</li>
              <li>✓ Respuestas localizadas en tu país e idioma</li>
              <li>✓ 1 medición cada {l.intervalDays} días con historial de tendencia</li>
              <li>✓ Fuentes citadas y comparación con la competencia</li>
            </ul>
            <Link href="/registro" className="btn-primary mt-6 w-full">Crear cuenta gratis</Link>
          </div>
        </div>
        <div className="card p-6 lg:mt-[7.5rem]">
          <div className="label">Agencias y equipos</div>
          <div className="mt-2 text-xl font-semibold">Más marcas, más preguntas, mediciones diarias</div>
          <p className="mt-2 text-sm text-muted">
            Estamos preparando planes para agencias y equipos de marketing. Si te interesa, crea tu cuenta gratis y te avisaremos
            cuando estén disponibles.
          </p>
        </div>
      </section>

      {/* FAQ (con FAQPage) */}
      <div>
        <Faq items={faqs} />
        <p className="mt-4 max-w-3xl text-sm text-muted">
          ¿Quieres saber más? Lee la guía <Link href="/guias/que-es-geo" className="text-accent underline underline-offset-2">Qué es GEO</Link> o
          cómo es nuestra <Link href="/metodologia" className="text-accent underline underline-offset-2">metodología</Link>.
        </p>
      </div>

      <PageCta title="Descubre hoy qué dicen las IAs de tu marca" />

      <JsonLd
        data={[
          { "@context": "https://schema.org", ...ORGANIZATION },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Menciones",
            url: SITE,
            description:
              "Mide si ChatGPT, Claude, Gemini y Perplexity recomiendan tu marca, en qué posición y frente a tu competencia.",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            inLanguage: "es",
            publisher: { "@id": ORGANIZATION["@id"] },
            offers: { "@type": "Offer", name: "Plan gratis", price: "0", priceCurrency: "USD" },
          },
        ]}
      />
    </div>
  );
}
