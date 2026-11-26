import type { Metadata } from "next";
import Link from "next/link";
import { METRIC_INFO } from "@/lib/metrics";
import { Breadcrumbs, PageCta, prose } from "@/components/Seo";

const TITLE = "Metodología: cómo medimos la visibilidad en IA";
const DESCRIPTION =
  "Cómo consultamos ChatGPT, Claude, Gemini y Perplexity, cómo detectamos tu marca y cómo calculamos visibilidad, posición, share of voice, sentiment y fuentes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/metodologia" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/metodologia" },
};

export default function MethodologyPage() {
  return (
    <div className="space-y-16 pb-8">
      <article>
        <Breadcrumbs items={[{ name: "Metodología", href: "/metodologia" }]} />
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance">Cómo medimos tu visibilidad en la IA</h1>
        <p className="mt-5 max-w-3xl text-lg text-muted text-pretty">
          Trabajamos con respuestas reales de cada IA, no con estimaciones. Aquí explicamos cómo las obtenemos, cómo las analizamos
          y qué límites tiene la medición.
        </p>

        <div className={`mt-6 ${prose}`}>
          <h2>1. Las preguntas</h2>
          <p>
            Cada proyecto tiene una marca, sus competidores y las preguntas (prompts) que sus clientes le hacen a la IA, por ejemplo
            “¿cuál es la mejor cuenta de ahorro?”. Medimos exactamente esas preguntas: los resultados dependen de que se parezcan a
            lo que la gente pregunta de verdad.
          </p>

          <h2>2. Cómo consultamos cada IA</h2>
          <p>
            Hacemos las consultas a través de <strong>DataForSEO</strong>, un proveedor de datos para SEO, desde el país y el idioma
            que eliges en tu proyecto:
          </p>
          <ul>
            <li><strong><Link href="/ia/chatgpt">ChatGPT</Link>:</strong> la respuesta de chatgpt.com tal como la vería una persona en ese país, con búsqueda web y sus fuentes.</li>
            <li><strong><Link href="/ia/claude">Claude</Link>:</strong> con búsqueda web activada y el contexto de tu país e idioma.</li>
            <li><strong><Link href="/ia/gemini">Gemini</Link>:</strong> con búsqueda web activada y el contexto de tu país e idioma.</li>
            <li><strong><Link href="/ia/perplexity">Perplexity</Link>:</strong> localizado en tu país y en tu idioma.</li>
          </ul>
          <p>Guardamos el texto completo de cada respuesta y las fuentes que cita, para que puedas leerlas desde tu panel.</p>

          <h2>3. Cómo detectamos tu marca</h2>
          <p>
            Buscamos en cada respuesta el nombre de tu marca, las otras formas de escribirla que configuraste y tu dominio, sin
            distinguir mayúsculas ni tildes. Hacemos lo mismo con cada competidor. El orden en que aparecen las marcas define su
            posición dentro de esa respuesta.
          </p>

          <h2>4. Las métricas</h2>
          <ul>
            <li><strong>Visibilidad:</strong> {METRIC_INFO.visibility}</li>
            <li><strong>Posición media:</strong> {METRIC_INFO.position}</li>
            <li><strong>Share of voice:</strong> {METRIC_INFO.share}</li>
            <li><strong>Citado como fuente:</strong> {METRIC_INFO.cited}</li>
            <li>
              <strong>Sentiment:</strong> {METRIC_INFO.sentiment} Lo clasifica un modelo de IA (Claude, de Anthropic) leyendo cada
              respuesta en la que apareces.
            </li>
          </ul>

          <h2>5. Frecuencia</h2>
          <p>
            En el plan gratis medimos cada proyecto una vez por semana y guardamos todas las mediciones, para que veas la tendencia.
            Puedes revisar los detalles en <Link href="/planes">planes</Link>.
          </p>

          <h2>6. Límites de la medición</h2>
          <ul>
            <li><strong>Las respuestas varían.</strong> La misma pregunta puede dar respuestas distintas en momentos distintos. Por eso recomendamos mirar la tendencia de varias mediciones y no una sola.</li>
            <li><strong>Es una muestra.</strong> Medimos tus preguntas, no todas las que existen sobre tu categoría.</li>
            <li><strong>Nombres comunes.</strong> Si tu marca es una palabra de uso común, puede haber coincidencias que no se refieren a ti. Revisar las respuestas te ayuda a detectarlo.</li>
            <li><strong>El sentiment es una clasificación automática</strong> y puede equivocarse en textos ambiguos.</li>
          </ul>
          <p>
            ¿Dudas sobre la metodología? Escríbenos por WhatsApp desde el botón de esta página o lee nuestra{" "}
            <Link href="/guias/que-es-geo">guía sobre GEO</Link>.
          </p>
        </div>
      </article>
      <PageCta />
    </div>
  );
}
