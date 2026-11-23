import type { MetadataRoute } from "next";

const SITE = (process.env.SITE_URL ?? "https://menciones.org").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/registro`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/ingresar`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
