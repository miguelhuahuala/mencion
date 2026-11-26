import Link from "next/link";
import { GuideLayout, guideMetadata } from "@/components/GuideLayout";

const SLUG = "como-medir-visibilidad-en-ia";
export const metadata = guideMetadata(SLUG);

export default function Page() {
  return (
    <GuideLayout
      slug={SLUG}
      intro="Medir tu visibilidad en la IA se parece a hacer una encuesta: si las preguntas, el mercado o la frecuencia están mal elegidos, el resultado no sirve. Este es el proceso paso a paso."
      toc={[
        ["preguntas", "1. Elige las preguntas"],
        ["competidores", "2. Define a tu competencia"],
        ["mercado", "3. Mide desde el país de tus clientes"],
        ["ias", "4. Consulta varias IAs"],
        ["leer", "5. Lee los resultados"],
        ["frecuencia", "6. Repite la medición"],
      ]}
      related={["kpis-de-geo", "como-elegir-prompts"]}
      faqs={[
        ["¿Puedo medirlo a mano, preguntando yo mismo?", "Puedes hacer pruebas, pero es difícil que sea representativo: tus respuestas pueden estar personalizadas, depender de tu ubicación y variar entre consultas. Para comparar en el tiempo necesitas hacer las mismas preguntas, en las mismas condiciones, de forma periódica."],
        ["¿Cuántas preguntas necesito?", "Con 5 preguntas bien elegidas ya tienes una primera foto útil. Más adelante puedes ampliar a más preguntas por producto o etapa de compra."],
        ["¿Cada cuánto debo medir?", "Una vez por semana es un buen ritmo para ver tendencias sin perderte cambios importantes."],
      ]}
    >
      <h2 id="preguntas" className="scroll-mt-8">1. Elige las preguntas</h2>
      <p>
        Mide lo que tus clientes preguntan de verdad, escrito como lo escribirían: “¿cuál es la mejor cuenta de ahorro para
        independientes?”, no “cuenta ahorro”. Evita incluir el nombre de tu marca: quieres saber si la IA te recomienda por sí
        sola. En <Link href="/guias/como-elegir-prompts">cómo elegir prompts</Link> lo explicamos a fondo.
      </p>

      <h2 id="competidores" className="scroll-mt-8">2. Define a tu competencia</h2>
      <p>
        Sin competidores no hay contexto: un 30 % de visibilidad puede ser excelente o malo según lo que logren los demás. Agrega
        las marcas con las que te comparan al decidir y anota también las otras formas en que se escriben (siglas, nombres
        completos), para no perder menciones.
      </p>

      <h2 id="mercado" className="scroll-mt-8">3. Mide desde el país de tus clientes</h2>
      <p>
        Las respuestas cambian según el país y el idioma. Si tus clientes están en Perú, la medición tiene que hacerse como la
        haría una persona en Perú. De lo contrario verás las marcas que la IA recomienda en otro mercado.
      </p>

      <h2 id="ias" className="scroll-mt-8">4. Consulta varias IAs</h2>
      <p>
        Cada IA consulta y prioriza fuentes distintas. Medir <Link href="/ia/chatgpt">ChatGPT</Link>,{" "}
        <Link href="/ia/claude">Claude</Link>, <Link href="/ia/gemini">Gemini</Link> y{" "}
        <Link href="/ia/perplexity">Perplexity</Link> te muestra si tu presencia es sólida o depende de un solo asistente.
      </p>

      <h2 id="leer" className="scroll-mt-8">5. Lee los resultados</h2>
      <ul>
        <li><strong>Visibilidad:</strong> en qué porcentaje de respuestas apareces.</li>
        <li><strong>Posición:</strong> en qué lugar te nombran cuando apareces.</li>
        <li><strong>Share of voice:</strong> tu peso frente a la competencia.</li>
        <li><strong>Sentiment:</strong> si te presentan de forma positiva, neutral o negativa.</li>
        <li><strong>Fuentes citadas:</strong> qué sitios influyen y si tu web está entre ellos.</li>
      </ul>
      <p>
        Además de los números, lee algunas respuestas completas: te dirán <em>por qué</em> la IA recomienda a otros. Más detalle
        en <Link href="/guias/kpis-de-geo">KPIs de GEO</Link>.
      </p>

      <h2 id="frecuencia" className="scroll-mt-8">6. Repite la medición</h2>
      <p>
        Una medición es una foto; varias forman una tendencia. Mide las mismas preguntas cada semana y relaciona los cambios con
        tus acciones: una nota de prensa, una nueva página, una campaña de reseñas.
      </p>
    </GuideLayout>
  );
}
