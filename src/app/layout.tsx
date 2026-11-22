import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { currentUser } from "@/lib/auth";
import { signOut } from "./auth-actions";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://menciones.org"),
  title: { default: "Mencion — ¿Las IAs recomiendan tu marca?", template: "%s · Mencion" },
  description:
    "Mide gratis cuántas veces ChatGPT, Claude, Gemini y Perplexity mencionan tu marca frente a tu competencia, en qué posición y con qué fuentes.",
  // Solo se indexa en producción (ALLOW_INDEXING=true)
  robots: process.env.ALLOW_INDEXING === "true" ? undefined : { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="es" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-accent font-mono text-sm text-white">“</span>
              Mencion
            </Link>
            {user ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="hidden max-w-[200px] truncate text-muted sm:inline">{user.email}</span>
                {user.role === "admin" && <span className="chip bg-accent-soft text-accent">admin</span>}
                <form action={signOut}>
                  <button className="text-muted hover:text-ink">Salir</button>
                </form>
              </div>
            ) : (
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/ingresar" className="px-2 text-muted hover:text-ink">Ingresar</Link>
                <Link href="/registro" className="btn-primary px-3 py-1.5">Crear cuenta gratis</Link>
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto flex max-w-6xl flex-wrap gap-x-4 gap-y-1 px-4 pb-10 text-xs text-muted">
          <span>Datos de IA vía DataForSEO AI Optimization API</span>
          <Link href="/privacidad" className="hover:text-ink">Política de privacidad</Link>
        </footer>
      </body>
    </html>
  );
}
