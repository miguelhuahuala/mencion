import Link from "next/link";
import { GuideLayout, guideMetadata } from "@/components/GuideLayout";

const SLUG = "geo-vs-seo";
export const metadata = guideMetadata(SLUG);

export default function Page() {
  return (
    <GuideLayout
      slug={SLUG}
      intro="El SEO te pone en la lista de resultados de Google. El GEO busca que la IA te nombre dentro de su respuesta. No compiten entre sí: el segundo se apoya mucho en el primero."
      toc={[
        ["resumen", "La diferencia en una frase"],
        ["comparacion", "Comparación punto por punto"],
        ["en-comun", "Lo que tienen en común"],
        ["que-cambia", "Lo que cambia con la IA"],
        ["combinar", "Cómo combinarlos en tu estrategia"],
      ]}
      related={["que-es-geo", "como-aparecer-en-chatgpt"]}
      faqs={[
        ["¿Tengo que elegir entre SEO y GEO?", "No. Un buen SEO suele ayudar al GEO, porque muchas respuestas de IA con búsqueda web se basan en páginas bien posicionadas. Lo que cambia es qué mides y dónde buscas presencia."],
        ["¿Mis herramientas de SEO miden el GEO?", "La mayoría mide posiciones y tráfico en buscadores. Para saber si la IA te menciona necesitas consultar a las IAs y analizar sus respuestas, que es lo que hace una herramienta de monitoreo como Menciones."],
        ["¿El GEO trae tráfico a mi web?", "A veces, cuando la IA enlaza tu sitio como fuente. Pero su valor principal es otro: estar en la recomendación que el cliente lee antes de decidir, aunque no haga clic."],
      ]}
    >
      <h2 id="resumen" className="scroll-mt-8">La diferencia en una frase</h2>
      <p>
        <strong>SEO</strong> es aparecer cuando alguien <em>busca</em>. <strong>GEO</strong> es aparecer cuando alguien{" "}
        <em>pregunta</em> a una IA. En el primer caso compites por un lugar en una lista de enlaces; en el segundo, por una
        mención dentro de un texto que la IA escribe.
      </p>

      <h2 id="comparacion" className="scroll-mt-8">Comparación punto por punto</h2>
      <ul>
        <li><strong>Dónde compites.</strong> SEO: resultados de buscadores. GEO: respuestas de asistentes como ChatGPT, Claude, Gemini o Perplexity.</li>
        <li><strong>Cuántos ganan.</strong> SEO: hay una página de resultados con varios enlaces. GEO: la respuesta suele nombrar solo a unas pocas marcas.</li>
        <li><strong>Qué mides.</strong> SEO: posición, impresiones, clics y tráfico. GEO: visibilidad, posición dentro de la respuesta, share of voice, sentiment y fuentes citadas.</li>
        <li><strong>Qué influye.</strong> SEO: contenido, enlaces y aspectos técnicos de tu web. GEO: tu contenido, pero también —y mucho— lo que dicen de ti otros sitios que la IA consulta.</li>
        <li><strong>Cómo lo sigues.</strong> SEO: Search Console y herramientas de posicionamiento. GEO: herramientas que consultan a las IAs y analizan sus respuestas.</li>
      </ul>

      <h2 id="en-comun" className="scroll-mt-8">Lo que tienen en común</h2>
      <p>Las buenas prácticas de siempre siguen valiendo, porque las IAs con búsqueda web leen las mismas páginas que los buscadores:</p>
      <ul>
        <li>Contenido claro que responde preguntas reales de tus clientes.</li>
        <li>Información verificable y actualizada sobre tus productos, precios y condiciones.</li>
        <li>Presencia en medios, directorios y comparadores reconocidos de tu sector.</li>
        <li>Una web rápida, rastreable y bien estructurada.</li>
      </ul>

      <h2 id="que-cambia" className="scroll-mt-8">Lo que cambia con la IA</h2>
      <ul>
        <li><strong>La reputación pesa más.</strong> La IA resume lo que dicen varias fuentes; si las reseñas o comparadores hablan mal de ti, eso se nota en la respuesta.</li>
        <li><strong>Importa el texto, no solo el enlace.</strong> No basta con estar enlazado: la IA tiene que entender qué haces y para quién.</li>
        <li><strong>La competencia es directa.</strong> En una misma respuesta aparecen tus competidores al lado; por eso el share of voice y la posición son clave.</li>
        <li><strong>Las respuestas varían.</strong> La misma pregunta puede dar respuestas distintas; hay que medir de forma periódica.</li>
      </ul>

      <h2 id="combinar" className="scroll-mt-8">Cómo combinarlos en tu estrategia</h2>
      <ol>
        <li><strong>Parte de tu investigación de palabras clave</strong> y conviértela en preguntas completas: “mejor cuenta de ahorro” → “¿cuál es la mejor cuenta de ahorro en Perú?”.</li>
        <li><strong>Mide esas preguntas en las IAs</strong> y compara: ¿apareces en Google pero no en ChatGPT, o al revés?</li>
        <li><strong>Revisa las fuentes que citan las IAs</strong> y súmalas a tu plan de contenidos y relaciones públicas.</li>
        <li><strong>Reporta ambas cosas juntas:</strong> tráfico orgánico por un lado y visibilidad en IA por otro.</li>
      </ol>
      <p>
        Si recién empiezas, lee primero <Link href="/guias/que-es-geo">qué es GEO</Link> y luego{" "}
        <Link href="/guias/como-medir-visibilidad-en-ia">cómo medir tu visibilidad en IA</Link>.
      </p>
    </GuideLayout>
  );
}
