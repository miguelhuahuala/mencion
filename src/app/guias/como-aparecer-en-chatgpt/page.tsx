import Link from "next/link";
import { GuideLayout, guideMetadata } from "@/components/GuideLayout";

const SLUG = "como-aparecer-en-chatgpt";
export const metadata = guideMetadata(SLUG);

export default function Page() {
  return (
    <GuideLayout
      slug={SLUG}
      intro="No hay un botón para aparecer en ChatGPT ni una forma de pagar por una mención. Lo que sí puedes hacer es trabajar en las señales que usa para responder y medir si funciona."
      toc={[
        ["como-responde", "Cómo arma ChatGPT una respuesta"],
        ["punto-de-partida", "1. Mide tu punto de partida"],
        ["fuentes", "2. Gana presencia en las fuentes que cita"],
        ["tu-web", "3. Haz que tu web sea fácil de citar"],
        ["reputacion", "4. Cuida tu reputación"],
        ["medir", "5. Mide cada semana"],
        ["que-no", "Lo que no funciona"],
      ]}
      related={["que-fuentes-usan-las-ia", "como-elegir-prompts"]}
      faqs={[
        ["¿Cuánto tarda en notarse un cambio?", "Depende de la acción. Una mejora en una fuente muy citada puede notarse en semanas si ChatGPT la consulta con búsqueda web; lo que depende del entrenamiento del modelo tarda mucho más. Por eso conviene medir de forma periódica."],
        ["¿Sirve preguntarle a ChatGPT por mi marca muchas veces?", "No. Que tú le preguntes no cambia lo que responde a otras personas."],
        ["¿Aparecer en ChatGPT es igual en todos los países?", "No. Con búsqueda web y ubicación, las respuestas cambian según el país. Mide desde el mercado de tus clientes."],
      ]}
    >
      <h2 id="como-responde" className="scroll-mt-8">Cómo arma ChatGPT una respuesta</h2>
      <p>
        Cuando alguien pregunta “¿qué banco tiene la mejor app?”, ChatGPT combina dos cosas: lo que aprendió durante su
        entrenamiento y, cuando usa búsqueda web, lo que encuentra en ese momento en internet. Con búsqueda web, además,
        muestra las fuentes que consultó. Esas fuentes son tu mejor pista sobre qué influye en la respuesta.
      </p>

      <h2 id="punto-de-partida" className="scroll-mt-8">1. Mide tu punto de partida</h2>
      <p>
        Antes de cambiar nada, averigua si hoy apareces. Elige las preguntas que hacen tus clientes, define a tus competidores y
        mide en qué porcentaje de respuestas apareces y en qué lugar. Puedes hacerlo gratis en{" "}
        <Link href="/ia/chatgpt">Menciones para ChatGPT</Link>.
      </p>

      <h2 id="fuentes" className="scroll-mt-8">2. Gana presencia en las fuentes que cita</h2>
      <p>
        Revisa qué dominios aparecen como fuente en tus preguntas clave: comparadores, medios, blogs especializados, foros o
        directorios. Luego trabaja para estar bien presentado ahí: notas de prensa con datos útiles, fichas completas en
        comparadores, reseñas de clientes reales y colaboraciones con medios de tu sector.
      </p>

      <h2 id="tu-web" className="scroll-mt-8">3. Haz que tu web sea fácil de citar</h2>
      <ul>
        <li>Explica en una frase qué ofreces, para quién y en qué te diferencias.</li>
        <li>Publica datos concretos y actualizados: precios, tasas, condiciones, cobertura.</li>
        <li>Responde preguntas reales en páginas propias, con títulos que coincidan con cómo pregunta la gente.</li>
        <li>Mantén tu web rápida y accesible para que pueda ser leída sin problemas.</li>
      </ul>

      <h2 id="reputacion" className="scroll-mt-8">4. Cuida tu reputación</h2>
      <p>
        ChatGPT resume lo que dicen varias fuentes. Si las reseñas o los foros repiten una queja, puede aparecer en la respuesta.
        Responder a las críticas, resolver los problemas de fondo y pedir reseñas a clientes satisfechos ayuda a que el resumen
        sea favorable. El <Link href="/funciones/sentiment-de-marca-ia">sentiment</Link> te muestra cómo te está presentando.
      </p>

      <h2 id="medir" className="scroll-mt-8">5. Mide cada semana</h2>
      <p>
        Las respuestas varían. Una sola consulta no dice mucho; la tendencia de varias semanas sí. Mide las mismas preguntas de
        forma periódica y compara con tu competencia para saber si tus acciones funcionan.
      </p>

      <h2 id="que-no" className="scroll-mt-8">Lo que no funciona</h2>
      <ul>
        <li><strong>Llenar tu web de palabras clave.</strong> La IA prioriza contenido útil y claro, no repeticiones.</li>
        <li><strong>Reseñas o menciones falsas.</strong> Además de ser engañosas, pueden dañar tu reputación cuando se detectan.</li>
        <li><strong>Esperar resultados inmediatos.</strong> Es un trabajo de reputación y contenido, no un ajuste técnico de un día.</li>
      </ul>
    </GuideLayout>
  );
}
