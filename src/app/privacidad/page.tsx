export const metadata = { title: "Política de privacidad" };

const CONTACT = process.env.CONTACT_EMAIL ?? "contacto@menciones.org";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold tracking-tight">Política de privacidad</h1>
      <p className="text-muted">Última actualización: noviembre de 2026.</p>

      <h2 className="pt-2 font-semibold">Qué datos tratamos</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Tu correo electrónico y tu contraseña (guardada cifrada con un hash; nadie puede leerla).</li>
        <li>Lo que configuras en tus proyectos: marcas, dominios, competidores y prompts.</li>
        <li>Los resultados de las mediciones: las respuestas de las IAs y las fuentes que citan.</li>
      </ul>

      <h2 className="pt-2 font-semibold">Para qué los usamos</h2>
      <p>
        Solo para darte el servicio: identificarte al ingresar y medir la visibilidad de las marcas que configuras. No vendemos
        ni cedemos tus datos a terceros con fines comerciales.
      </p>

      <h2 className="pt-2 font-semibold">Con quién se comparten</h2>
      <p>
        Los prompts que configuras se envían a DataForSEO, que los consulta en ChatGPT, Claude, Gemini y Perplexity. Tu correo
        no se envía a esos servicios.
      </p>

      <h2 className="pt-2 font-semibold">Tus derechos</h2>
      <p>
        De acuerdo con la Ley N.° 29733, Ley de Protección de Datos Personales del Perú, puedes pedir acceso, rectificación,
        cancelación u oposición al tratamiento de tus datos escribiendo a{" "}
        <a className="text-accent underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>. Si eliminas tu proyecto, se borran también
        sus mediciones.
      </p>

      <h2 className="pt-2 font-semibold">Cookies</h2>
      <p>Usamos una única cookie técnica para mantener tu sesión iniciada. No usamos cookies publicitarias.</p>
    </article>
  );
}
