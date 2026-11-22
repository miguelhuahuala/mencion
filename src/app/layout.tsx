import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://menciones.org"),
  title: { default: "Mencion — visibilidad de tu marca en las IAs", template: "%s · Mencion" },
  description: "Mide cuántas veces ChatGPT, Claude, Gemini y Perplexity mencionan tu marca frente a tu competencia.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-accent font-mono text-sm text-white">“</span>
              Mencion
            </Link>
            <span className="hidden text-xs text-muted sm:inline">Visibilidad de marca en respuestas de IA</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted">
          Datos de IA vía DataForSEO AI Optimization API · Análisis de sentimiento con Claude
        </footer>
      </body>
    </html>
  );
}
