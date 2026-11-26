import Link from "next/link";
import { GuideLayout, guideMetadata } from "@/components/GuideLayout";

const SLUG = "que-fuentes-usan-las-ia";
export const metadata = guideMetadata(SLUG);

export default function Page() {
  return (
    <GuideLayout
      slug={SLUG}
      intro="Cuando una IA busca en la web para responder, se apoya en páginas concretas. Esas fuentes son la forma más directa de entender por qué recomienda a unas marcas y no a otras."
      toc={[
        ["dos-origenes", "De dónde sale la información"],
        ["tipos", "Qué tipo de sitios suelen aparecer"],
        ["descubrir", "Cómo descubrir las fuentes de tu categoría"],
        ["estar", "Cómo conseguir presencia en ellas"],
        ["tu-dominio", "Que tu web sea una fuente"],
      ]}
      related={["como-aparecer-en-chatgpt", "geo-vs-seo"]}
      faqs={[
        ["¿Las fuentes son las mismas en todas las IAs?", "No necesariamente. Cada IA busca y prioriza de forma distinta, por eso conviene revisar las fuentes de cada una."],
        ["¿Una fuente citada garantiza que me recomienden?", "No, pero es una señal fuerte de qué información está leyendo la IA. Si una fuente muy citada no te menciona o habla mal de ti, es un buen lugar para empezar."],
      ]}
    >
      <h2 id="dos-origenes" className="scroll-mt-8">De dónde sale la información</h2>
      <p>Las respuestas de una IA combinan dos orígenes:</p>
      <ol>
        <li><strong>Su entrenamiento:</strong> lo que el modelo aprendió de grandes volúmenes de texto público. No se ve en la respuesta y cambia lento.</li>
        <li><strong>La búsqueda web:</strong> páginas que consulta en el momento de responder. Estas sí suelen mostrarse como fuentes.</li>
      </ol>
      <p>
        Por eso medimos con búsqueda web activada: así ves las fuentes y puedes actuar sobre ellas.{" "}
        <Link href="/ia/perplexity">Perplexity</Link> siempre las muestra; en las demás IAs aparecen según la respuesta.
      </p>

      <h2 id="tipos" className="scroll-mt-8">Qué tipo de sitios suelen aparecer</h2>
      <ul>
        <li><strong>Comparadores y rankings</strong> de tu categoría (“las mejores tarjetas de crédito de 2026”).</li>
        <li><strong>Medios</strong> generales y especializados.</li>
        <li><strong>Sitios de reseñas y foros</strong>, donde opinan usuarios reales.</li>
        <li><strong>Webs de las propias marcas</strong>, sobre todo páginas con datos claros.</li>
        <li><strong>Fuentes institucionales</strong>, como reguladores o asociaciones del sector.</li>
      </ul>

      <h2 id="descubrir" className="scroll-mt-8">Cómo descubrir las fuentes de tu categoría</h2>
      <p>
        Mide tus preguntas clave y revisa qué dominios se repiten como fuente. En Menciones lo ves en la sección{" "}
        <Link href="/funciones/fuentes-citadas-por-ia">fuentes citadas</Link>: los dominios más citados y en qué porcentaje de
        respuestas aparecen. Lee también qué dicen esas páginas sobre ti y sobre tu competencia.
      </p>

      <h2 id="estar" className="scroll-mt-8">Cómo conseguir presencia en ellas</h2>
      <ul>
        <li><strong>Comparadores:</strong> asegúrate de que tu ficha esté completa y actualizada.</li>
        <li><strong>Medios:</strong> ofrece datos, estudios o expertos que aporten a sus notas.</li>
        <li><strong>Reseñas:</strong> pide opiniones a clientes satisfechos y responde a las críticas.</li>
        <li><strong>Foros:</strong> participa de forma transparente, aportando información útil.</li>
      </ul>

      <h2 id="tu-dominio" className="scroll-mt-8">Que tu web sea una fuente</h2>
      <p>
        Si la IA cita tu dominio, no solo te nombra: usa tu información como referencia. Para lograrlo, publica páginas que
        respondan de forma directa las preguntas de tus clientes, con datos concretos y actualizados. La métrica “citado como
        fuente” te dice si lo estás consiguiendo.
      </p>
    </GuideLayout>
  );
}
