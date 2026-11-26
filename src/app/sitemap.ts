import type { MetadataRoute } from "next";
import { PUBLIC_PAGES, absolute } from "@/lib/site";

/** Todas las páginas públicas indexables (la lista vive en lib/site.ts). */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map((p) => ({
    url: absolute(p.path),
    lastModified: new Date(`${p.updated}T00:00:00-05:00`),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
