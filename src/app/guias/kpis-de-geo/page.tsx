import Link from "next/link";
import { GuideLayout, guideMetadata } from "@/components/GuideLayout";

const SLUG = "kpis-de-geo";
export const metadata = guideMetadata(SLUG);

export default function Page() {
  return (
    <GuideLayout
      slug={SLUG}
      intro="Para gestionar tu presencia en la IA necesitas métricas claras. Estas son las cinco que usamos, cómo se calculan y qué decisiones te ayudan a tomar."
      toc={[
        ["visibilidad", "Visibilidad"],
        ["posicion", "Posición"],
        ["share", "Share of voice"],
        ["sentiment", "Sentiment"],
        ["fuentes", "Fuentes citadas"],
        ["juntas", "Cómo leerlas juntas"],
      ]}
      related={["como-medir-visibilidad-en-ia", "que-es-geo"]}
      faqs={[
        ["¿Cuál es la métrica más importante?", "Para empezar, la visibilidad: si no apareces, lo demás no importa. Después, el share of voice te dice si ganas frente a tu competencia."],
        ["¿Cómo las reporto a mi equipo?", "Una buena práctica es reportar visibilidad y share of voice como métricas principales, y usar posición, sentiment y fuentes para explicar los cambios."],
      ]}
    >
      <h2 id="visibilidad" className="scroll-mt-8">Visibilidad</h2>
      <p>
        <strong>Qué es:</strong> el porcentaje de respuestas que mencionan tu marca. <strong>Cómo se calcula:</strong>{" "}
        respuestas que te mencionan ÷ respuestas obtenidas. Con 5 preguntas en 4 IAs hay 20 respuestas; si apareces en 8, tu
        visibilidad es 40 %. <strong>Úsala para:</strong> saber tu punto de partida y si mejoras.{" "}
        <Link href="/funciones/visibilidad-en-ia">Más sobre visibilidad</Link>.
      </p>

      <h2 id="posicion" className="scroll-mt-8">Posición</h2>
      <p>
        <strong>Qué es:</strong> el lugar en que te nombra la IA entre las marcas que sigues. <strong>Cómo se calcula:</strong>{" "}
        según el orden en que aparecen las marcas en la respuesta; la posición media promedia tus lugares cuando apareces. Menor
        es mejor. <strong>Úsala para:</strong> distinguir entre “aparecer al final” y “ser la primera recomendación”.{" "}
        <Link href="/funciones/posicion-en-respuestas-ia">Más sobre posición</Link>.
      </p>

      <h2 id="share" className="scroll-mt-8">Share of voice</h2>
      <p>
        <strong>Qué es:</strong> qué parte de las menciones de tu categoría son tuyas. <strong>Cómo se calcula:</strong> tus
        menciones ÷ menciones de todas las marcas que sigues. <strong>Úsala para:</strong> saber si ganas o pierdes terreno frente
        a cada competidor. <Link href="/funciones/share-of-voice-ia">Más sobre share of voice</Link>.
      </p>

      <h2 id="sentiment" className="scroll-mt-8">Sentiment</h2>
      <p>
        <strong>Qué es:</strong> si la IA te presenta de forma positiva, neutral o negativa. <strong>Cómo se calcula:</strong> un
        modelo de IA clasifica cada mención; mostramos el porcentaje positivo y el detalle de las tres categorías.{" "}
        <strong>Úsala para:</strong> detectar problemas de reputación en las respuestas.{" "}
        <Link href="/funciones/sentiment-de-marca-ia">Más sobre sentiment</Link>.
      </p>

      <h2 id="fuentes" className="scroll-mt-8">Fuentes citadas</h2>
      <p>
        <strong>Qué es:</strong> los sitios que la IA enlaza al responder, y cuántas respuestas enlazan a tu dominio.{" "}
        <strong>Úsala para:</strong> decidir dónde conseguir presencia.{" "}
        <Link href="/funciones/fuentes-citadas-por-ia">Más sobre fuentes citadas</Link>.
      </p>

      <h2 id="juntas" className="scroll-mt-8">Cómo leerlas juntas</h2>
      <ul>
        <li><strong>Visibilidad alta, posición baja:</strong> te nombran, pero detrás de otros. Revisa por qué la IA prefiere a tus competidores.</li>
        <li><strong>Visibilidad baja en una sola IA:</strong> mira sus fuentes; probablemente te falta presencia en lo que esa IA consulta.</li>
        <li><strong>Buena visibilidad, sentiment bajo:</strong> te mencionan, pero no bien. Es un tema de reputación.</li>
        <li><strong>Share of voice cayendo:</strong> un competidor está ganando terreno; compara en qué preguntas.</li>
      </ul>
      <p>Todas las métricas se calculan sobre tus preguntas y mediciones. Detalles en nuestra <Link href="/metodologia">metodología</Link>.</p>
    </GuideLayout>
  );
}
