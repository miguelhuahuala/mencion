import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";
import { Breadcrumbs, prose } from "@/components/Seo";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de uso de Menciones, la herramienta para medir la visibilidad de tu marca en las respuestas de la IA.",
  alternates: { canonical: "/terminos" },
};

export default function TermsPage() {
  return (
    <article className="pb-8">
      <Breadcrumbs items={[{ name: "Términos y condiciones", href: "/terminos" }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Términos y condiciones</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: 25 de noviembre de 2026.</p>

      <div className={`mt-2 ${prose}`}>
        <h2>1. El servicio</h2>
        <p>
          Menciones (menciones.org) es una herramienta que consulta asistentes de IA, como ChatGPT, Claude, Gemini y Perplexity,
          con las preguntas que configuras, y analiza si mencionan tu marca y la de tus competidores. Al crear una cuenta aceptas
          estos términos y nuestra <Link href="/privacidad">política de privacidad</Link>.
        </p>

        <h2>2. Tu cuenta</h2>
        <p>
          Eres responsable de mantener segura tu contraseña y de lo que se haga desde tu cuenta. Debes usar un correo válido y
          datos verdaderos. Puedes eliminar tu cuenta y todos sus datos cuando quieras desde “Mi cuenta”.
        </p>

        <h2>3. Plan gratis y límites</h2>
        <p>
          El plan gratis tiene límites de proyectos, preguntas y frecuencia de medición, que se muestran en{" "}
          <Link href="/planes">planes</Link>. Podemos ajustar esos límites o el funcionamiento del servicio para mantenerlo
          estable; si un cambio te afecta de forma importante, lo avisaremos.
        </p>

        <h2>4. Uso aceptable</h2>
        <ul>
          <li>No uses el servicio para fines ilegales ni para enviar contenido ofensivo, engañoso o que infrinja derechos de terceros.</li>
          <li>No intentes eludir los límites, acceder a cuentas ajenas ni afectar el funcionamiento del servicio.</li>
          <li>No automatices el registro de cuentas ni el uso del servicio sin nuestra autorización.</li>
        </ul>

        <h2>5. Resultados de las IAs</h2>
        <p>
          Los resultados son respuestas generadas por servicios de IA de terceros. Pueden variar entre consultas, contener errores
          y cambiar con el tiempo. Los mostramos tal como los obtenemos y los analizamos de forma automática, por lo que{" "}
          <strong>no garantizamos su exactitud ni que reflejen lo que verá cada usuario</strong>. Úsalos como referencia para tus
          decisiones, no como única fuente. Más detalles en nuestra <Link href="/metodologia">metodología</Link>.
        </p>

        <h2>6. Servicios de terceros</h2>
        <p>
          Para hacer las consultas usamos proveedores externos, como DataForSEO y los propios servicios de IA. Menciones no está
          afiliada ni respaldada por OpenAI, Anthropic, Google ni Perplexity; sus nombres y marcas pertenecen a sus dueños.
        </p>

        <h2>7. Propiedad intelectual</h2>
        <p>
          El software, el diseño y la marca Menciones nos pertenecen. Los datos que configuras (marcas, competidores y preguntas)
          son tuyos y solo los usamos para darte el servicio.
        </p>

        <h2>8. Responsabilidad</h2>
        <p>
          El servicio se ofrece “tal cual”. En la medida que permita la ley, no somos responsables por decisiones tomadas a partir
          de los resultados, ni por interrupciones o fallas de servicios de terceros.
        </p>

        <h2>9. Suspensión</h2>
        <p>Podemos suspender cuentas que incumplan estos términos o pongan en riesgo el servicio.</p>

        <h2>10. Cambios</h2>
        <p>
          Podemos actualizar estos términos. La fecha de la última actualización aparece arriba; si el cambio es importante, te lo
          avisaremos por correo.
        </p>

        <h2>11. Ley aplicable y contacto</h2>
        <p>
          Estos términos se rigen por las leyes de la República del Perú. Para cualquier consulta escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    </article>
  );
}
