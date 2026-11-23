import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Protección contra "version skew": si una pestaña abierta tiene una versión anterior del sitio,
  // Next detecta el cambio de despliegue y recarga la página completa. Railway expone el commit en build y runtime.
  deploymentId: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 12) || undefined,
  poweredByHeader: false,
  devIndicators: false,
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
