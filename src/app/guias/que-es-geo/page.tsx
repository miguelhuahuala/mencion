import type { Metadata } from "next";
import Link from "next/link";
import { ENGINES, ENGINE_LABEL } from "@/lib/types";
import { ORGANIZATION, absolute } from "@/lib/site";
import { Breadcrumbs, Faq, JsonLd, PageCta, prose } from "@/components/Seo";
import { otherGuides } from "@/components/GuideLayout";

const PATH = "/guias/que-es-geo";
const TITLE = "Qué es GEO (Generative Engine Optimization)";
const DESCRIPTION =
  "Qué es GEO, en qué se diferencia del SEO, cómo deciden las IAs qué marcas recomendar y cómo medir tu visibilidad en ChatGPT, Claude, Gemini y Perplexity.";
const PUBLISHED = "2026-11-25";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", title: TITLE, description: DESCRIPTION, url: PATH, publishedTime: PUBLISHED },
};

const faqs: [string, string][] = [
  ["¿GEO reemplaza al SEO?", "No. El SEO sigue siendo la base: muchas respuestas de IA se apoyan en páginas que ya posicionan bien en buscadores. GEO agrega una capa más: lograr que la IA te nombre y te recomiende dentro de su respuesta."],
  ["¿Qué diferencia hay entre GEO y AEO?", "AEO (Answer Engine Optimization) se usa para hablar de optimizar contenido para respuestas directas, como fragmentos destacados o asistentes de voz. GEO se centra en las respuestas generadas por modelos de IA como ChatGPT o Gemini. En la práctica, ambos términos se usan de forma parecida."],
  ["¿Se puede pagar para aparecer en las respuestas de una IA?", "Las respuestas que medimos son orgánicas: no hay un sistema para comprar menciones dentro de ellas. Por eso importan tu reputación, tu contenido y las fuentes que la IA consulta."],
  ["¿Cada cuánto debo medir mi visibilidad en IA?", "Las respuestas cambian con el tiempo y entre consultas. Medir las mismas preguntas de forma periódica, por ejemplo cada semana, te permite ver la tendencia en lugar de quedarte con una sola foto."],
];

export default function GeoGuide() {
  return (
    <div className="space-y-16 pb-8">
      <article>
        <Breadcrumbs items={[{ name: "Guías", href: "/guias" }, { name: "Qué es GEO", href: PATH }]} />
        <header className="mt-6 max-w-3xl">
          <span className="chip bg-accent-soft text-accent">Guía</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Qué es GEO y por qué tu marca necesita aparecer en las respuestas de la IA
          </h1>
          <p className="mt-5 text-lg text-muted text-pretty">
            Tus clientes siguen buscando en Google, pero cada vez más también le preguntan a la IA qué comprar o a quién contratar.
            GEO es lo que haces para que, en esa respuesta, aparezca tu marca.
          </p>
          <p className="mt-4 text-sm text-muted">
            Por el equipo de Menciones · <time dateTime={PUBLISHED}>25 de noviembre de 2026</time>
          </p>
        </header>

        <div className={`mt-10 ${prose}`}>
          <nav aria-label="Contenido" className="card p-5 text-base">
            <p className="font-semibold text-ink">En esta guía</p>
            <ol>
              <li><a href="#definicion">Qué es GEO</a></li>
              <li><a href="#por-que-importa">Por qué importa ahora</a></li>
              <li><a href="#geo-vs-seo">GEO vs. SEO</a></li>
              <li><a href="#como-deciden">Cómo deciden las IAs qué marcas mencionar</a></li>
              <li><a href="#metricas">Las métricas de GEO</a></li>
              <li><a href="#como-empezar">Cómo empezar en 5 pasos</a></li>
              <li><a href="#errores">Errores comunes</a></li>
            </ol>
          </nav>

          <h2 id="definicion" className="scroll-mt-8">Qué es GEO</h2>
          <p>
            <strong>GEO (Generative Engine Optimization)</strong> es el conjunto de acciones para que los asistentes de IA, como
            ChatGPT, Claude, Gemini o Perplexity, mencionen y recomienden tu marca cuando alguien les hace una pregunta sobre tu
            categoría.
          </p>
          <p>
            Si alguien pregunta “¿cuál es la cuenta de ahorro con mejor tasa?”, la IA no muestra diez enlaces: escribe una respuesta
            y nombra a unas pocas marcas. GEO busca que la tuya esté entre ellas, bien ubicada y bien descrita.
          </p>

          <h2 id="por-que-importa" className="scroll-mt-8">Por qué importa ahora</h2>
          <p>
            Durante años, la pregunta del marketing digital fue “¿en qué posición aparezco en Google?”. Hoy hay otra igual de
            importante: <strong>“¿qué responde la IA cuando mis clientes preguntan por mi categoría?”</strong>.
          </p>
          <ul>
            <li><strong>Menos espacio:</strong> una respuesta de IA suele nombrar solo a unas pocas marcas. Si no estás, el cliente compara sin ti.</li>
            <li><strong>Más confianza:</strong> la respuesta llega como una recomendación, no como una lista de anuncios y enlaces.</li>
            <li><strong>Poca visibilidad:</strong> no hay una consola oficial que te diga cuántas veces te mencionan las IAs. Si no lo mides, no lo sabes.</li>
          </ul>

          <h2 id="geo-vs-seo" className="scroll-mt-8">GEO vs. SEO</h2>
          <p>GEO no reemplaza al SEO: lo complementa. Estas son las diferencias principales:</p>
        </div>

        <div className="mt-6 max-w-3xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-semibold"></th>
                <th className="py-2 pr-4 font-semibold">SEO</th>
                <th className="py-2 font-semibold">GEO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                ["Dónde compites", "Resultados de buscadores", "Respuestas de asistentes de IA"],
                ["Qué buscas", "Aparecer alto en la lista de enlaces", "Que la IA te nombre y te recomiende"],
                ["Cómo se mide", "Posición, clics, tráfico", "Visibilidad, posición en la respuesta, share of voice, sentiment"],
                ["Qué influye", "Contenido, enlaces, aspectos técnicos", "Tu contenido y, sobre todo, las fuentes que la IA consulta"],
                ["Herramientas", "Search Console, herramientas SEO", "Herramientas de monitoreo en IA, como Menciones"],
              ].map(([k, a, b]) => (
                <tr key={k}>
                  <th className="py-3 pr-4 font-medium">{k}</th>
                  <td className="py-3 pr-4 text-muted">{a}</td>
                  <td className="py-3 text-muted">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={prose}>
          <h2 id="como-deciden" className="scroll-mt-8">Cómo deciden las IAs qué marcas mencionar</h2>
          <p>Ninguna IA publica una fórmula exacta, pero hay dos fuentes de información que pesan en sus respuestas:</p>
          <ol>
            <li>
              <strong>Lo que aprendieron al entrenarse.</strong> Los modelos se entrenan con grandes volúmenes de texto público. Las
              marcas que aparecen con frecuencia y en buenos contextos tienen más probabilidades de ser recordadas.
            </li>
            <li>
              <strong>Lo que encuentran al buscar en la web.</strong> Muchas respuestas se generan consultando páginas en el momento:
              medios, comparadores, reseñas, foros y webs de marcas. Por eso las <strong>fuentes citadas</strong> son una pista
              directa de qué sitios influyen en la respuesta.
            </li>
          </ol>
          <p>
            Además, la respuesta cambia según el país y el idioma de quien pregunta. Una marca puede ser recomendada en México y no
            en Perú. Por eso conviene medir desde el mercado de tus clientes.
          </p>

          <h2 id="metricas" className="scroll-mt-8">Las métricas de GEO</h2>
          <ul>
            <li><strong>Visibilidad:</strong> en qué porcentaje de las respuestas aparece tu marca.</li>
            <li><strong>Posición:</strong> en qué lugar te nombra la IA frente a las otras marcas de la respuesta.</li>
            <li><strong>Share of voice:</strong> qué parte de todas las menciones de tu categoría son tuyas frente a tu competencia.</li>
            <li><strong>Sentiment:</strong> si la IA te presenta de forma positiva, neutral o negativa.</li>
            <li><strong>Fuentes citadas:</strong> qué sitios usa la IA para responder y si tu web está entre ellos.</li>
          </ul>
          <p>
            En la <Link href="/metodologia">metodología de Menciones</Link> explicamos cómo calculamos cada una.
          </p>

          <h2 id="como-empezar" className="scroll-mt-8">Cómo empezar en 5 pasos</h2>
          <ol>
            <li><strong>Elige las preguntas de tus clientes.</strong> Escríbelas como las haría una persona real: “¿qué banco tiene la mejor app?”, no “banco app”.</li>
            <li><strong>Define a tu competencia.</strong> Las marcas con las que te comparan cuando alguien decide.</li>
            <li><strong>Mide tu punto de partida</strong> en las IAs que usan tus clientes, en su país e idioma.</li>
            <li><strong>Revisa las fuentes citadas</strong> y busca presencia en ellas: reseñas, comparadores, medios, directorios.</li>
            <li><strong>Mide otra vez cada semana</strong> para saber si tus acciones mueven la aguja.</li>
          </ol>

          <h2 id="errores" className="scroll-mt-8">Errores comunes</h2>
          <ul>
            <li><strong>Medir una sola vez.</strong> Las respuestas varían; una sola consulta no es representativa.</li>
            <li><strong>Usar preguntas que nadie hace.</strong> Si el prompt no se parece a lo que preguntan tus clientes, el resultado no te sirve.</li>
            <li><strong>Mirar solo tu marca.</strong> Sin tu competencia al lado, no sabes si un 30 % de visibilidad es bueno o malo.</li>
            <li><strong>Ignorar el país.</strong> Medir en un mercado distinto al de tus clientes da una foto equivocada.</li>
          </ul>
        </div>

        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Qué es GEO y por qué tu marca necesita aparecer en las respuestas de la IA",
            description: DESCRIPTION,
            inLanguage: "es",
            datePublished: PUBLISHED,
            dateModified: PUBLISHED,
            mainEntityOfPage: absolute(PATH),
            author: ORGANIZATION,
            publisher: ORGANIZATION,
          }}
        />
      </article>

      <section className="max-w-3xl">
        <h2 className="text-xl font-semibold">Profundiza en cada tema</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {otherGuides("que-es-geo").map((g) => (
            <Link key={g.slug} href={`/guias/${g.slug}`} className="card p-4 hover:border-accent/40">
              <span className="font-medium">{g.short}</span>
              <span className="mt-1 block text-sm text-muted">{g.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-3xl">
        <h2 className="text-xl font-semibold">Mide tu marca en cada IA</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ENGINES.map((e) => (
            <Link key={e} href={`/ia/${e}`} className="card p-4 font-medium hover:border-accent/40">
              ¿{ENGINE_LABEL[e]} recomienda tu marca? →
            </Link>
          ))}
        </div>
      </section>

      <Faq items={faqs} />

      <PageCta title="Mide tu GEO hoy" text="Descubre gratis si ChatGPT, Claude, Gemini y Perplexity recomiendan tu marca." />
    </div>
  );
}
