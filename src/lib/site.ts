import { ENGINES } from "./types";

/** Datos del sitio público (SEO, sitemap, pie de página). */
export const SITE = (process.env.SITE_URL ?? "https://menciones.org").replace(/\/$/, "");
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "contacto@menciones.org";
export const absolute = (path: string) => `${SITE}${path === "/" ? "" : path}`;

/** Organización (JSON-LD), reutilizada como autor y editor de las guías. */
export const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "Menciones",
  url: SITE,
  logo: `${SITE}/icon.svg`,
  email: CONTACT_EMAIL,
} as const;

type PublicPage = { path: string; updated: string; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number };

/** Páginas públicas indexables. Al agregar una, súmala aquí para que entre al sitemap. */
export const PUBLIC_PAGES: PublicPage[] = [
  { path: "/", updated: "2026-11-25", changeFrequency: "weekly", priority: 1 },
  { path: "/guias/que-es-geo", updated: "2026-11-25", changeFrequency: "monthly", priority: 0.9 },
  ...ENGINES.map((e) => ({ path: `/ia/${e}`, updated: "2026-11-25", changeFrequency: "monthly" as const, priority: 0.8 })),
  { path: "/planes", updated: "2026-11-25", changeFrequency: "monthly", priority: 0.8 },
  { path: "/metodologia", updated: "2026-11-25", changeFrequency: "monthly", priority: 0.6 },
  { path: "/registro", updated: "2026-11-25", changeFrequency: "yearly", priority: 0.7 },
  { path: "/privacidad", updated: "2026-11-25", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terminos", updated: "2026-11-25", changeFrequency: "yearly", priority: 0.3 },
];
