import type { MetadataRoute } from "next";

const SITE = (process.env.SITE_URL ?? "https://menciones.org").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  if (process.env.ALLOW_INDEXING !== "true") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/p/", "/admin", "/cuenta", "/api/", "/verificar", "/restablecer"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
