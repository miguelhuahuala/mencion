import Link from "next/link";
import { GuideLayout, guideMetadata } from "@/components/GuideLayout";

const SLUG = "como-elegir-prompts";
export const metadata = guideMetadata(SLUG);

export default function Page() {
  return (
    <GuideLayout
      slug={SLUG}
      intro="Tus resultados son tan buenos como las preguntas que mides. Un prompt mal elegido te da una foto que no refleja lo que viven tus clientes."
      toc={[
        ["buen-prompt", "Qué hace un buen prompt"],
        ["tipos", "Tipos de preguntas que conviene medir"],
        ["cuantos", "Cuántos prompts usar"],
        ["encontrar", "Cómo encontrar los más buscados"],
        ["agrupar", "Agrúpalos con etiquetas"],
        ["errores", "Errores comunes"],
      ]}
      related={["como-medir-visibilidad-en-ia", "kpis-de-geo"]}
      faqs={[
        ["¿Puedo cambiar mis prompts después?", "Sí, pero ten en cuenta que al cambiarlos la comparación con mediciones anteriores pierde sentido. Mantén un grupo estable de preguntas para seguir la tendencia."],
        ["¿Incluyo el nombre de mi marca en la pregunta?", "En general no: quieres saber si la IA te recomienda por sí sola. Las preguntas con tu marca sirven para otra cosa, como revisar qué dice la IA de ti."],
      ]}
    >
      <h2 id="buen-prompt" className="scroll-mt-8">Qué hace un buen prompt</h2>
      <ul>
        <li><strong>Es una pregunta completa</strong>, como la escribiría una persona: “¿qué banco tiene la mejor app para pagar servicios?”.</li>
        <li><strong>Es neutral:</strong> no menciona tu marca ni la de tus competidores.</li>
        <li><strong>Tiene intención de decisión:</strong> la persona está eligiendo algo, así que la respuesta nombra opciones.</li>
        <li><strong>Es de tu mercado:</strong> usa el vocabulario y el contexto de tu país.</li>
      </ul>

      <h2 id="tipos" className="scroll-mt-8">Tipos de preguntas que conviene medir</h2>
      <ul>
        <li><strong>“¿Cuál es la mejor…?”</strong> La recomendación directa de tu categoría.</li>
        <li><strong>Por necesidad:</strong> “¿qué cuenta de ahorro conviene para independientes?”.</li>
        <li><strong>Por comparación:</strong> “¿qué alternativas hay a…?” o “¿cuál es más barata…?”.</li>
        <li><strong>Por atributo:</strong> “¿qué tarjeta no cobra membresía?”.</li>
      </ul>

      <h2 id="cuantos" className="scroll-mt-8">Cuántos prompts usar</h2>
      <p>
        Empieza con 5 preguntas que representen lo más importante de tu negocio. Cada pregunta se mide en 4 IAs, así que 5
        preguntas ya te dan 20 respuestas por medición. Con el tiempo puedes ampliar a más productos o etapas de compra.
      </p>

      <h2 id="encontrar" className="scroll-mt-8">Cómo encontrar los más buscados</h2>
      <p>
        Puedes partir de tu investigación de palabras clave, de las preguntas que recibe tu equipo comercial o de las que llegan
        a atención al cliente. En Menciones también puedes usar{" "}
        <Link href="/funciones/descubrir-prompts">descubrir prompts</Link>: escribes un producto o categoría y te sugiere las
        preguntas más buscadas en tu país, con su volumen estimado y listas para agregar.
      </p>

      <h2 id="agrupar" className="scroll-mt-8">Agrúpalos con etiquetas</h2>
      <p>
        Si mides varios productos, ponle a cada prompt una etiqueta (por ejemplo “Tarjetas” o “Préstamos”). Así puedes filtrar
        el panel y ver tu visibilidad por producto.
      </p>

      <h2 id="errores" className="scroll-mt-8">Errores comunes</h2>
      <ul>
        <li><strong>Palabras clave sueltas</strong> (“tarjeta crédito”) en vez de preguntas completas.</li>
        <li><strong>Preguntas demasiado amplias</strong> (“¿qué es una tarjeta?”), que no llevan a recomendar marcas.</li>
        <li><strong>Cambiar las preguntas en cada medición</strong>, lo que impide ver la tendencia.</li>
      </ul>
    </GuideLayout>
  );
}
