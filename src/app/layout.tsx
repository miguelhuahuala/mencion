import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { currentUser } from "@/lib/auth";
import { signOut } from "./auth-actions";
import { Analytics } from "@/components/Analytics";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://menciones.org"),
  title: { default: "Menciones — ¿Las IAs recomiendan tu marca?", template: "%s · Menciones" },
  description:
    "Mide gratis cuántas veces ChatGPT, Claude, Gemini y Perplexity mencionan tu marca frente a tu competencia, en qué posición y con qué fuentes.",
  applicationName: "Menciones",
  openGraph: {
    type: "website",
    siteName: "Menciones",
    locale: "es_PE",
    url: "/",
    title: "Menciones — ¿Las IAs recomiendan tu marca?",
    description: "Mide gratis tu visibilidad en ChatGPT, Claude, Gemini y Perplexity frente a tu competencia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menciones — ¿Las IAs recomiendan tu marca?",
    description: "Mide gratis tu visibilidad en ChatGPT, Claude, Gemini y Perplexity frente a tu competencia.",
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
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
              Menciones
            </Link>
            {user ? (
              <div className="flex items-center gap-3 text-sm">
                <Link href="/cuenta" className="text-muted hover:text-ink" title={user.email}>
                  Mi cuenta
                </Link>
                {user.role === "admin" && <Link href="/admin" className="chip bg-accent-soft text-accent hover:bg-accent/15">Admin</Link>}
                <form action={signOut}>
                  <button className="text-muted hover:text-ink">Salir</button>
                </form>
              </div>
            ) : (
              <nav className="flex items-center gap-2 text-sm">
                <Link href="/ingresar" className="px-2 text-muted hover:text-ink">Ingresar</Link>
                <Link href="/registro" className="btn-primary whitespace-nowrap px-3 py-1.5">Crear cuenta<span className="hidden sm:inline"> gratis</span></Link>
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-24 text-sm text-muted">
          {/* Enlaces internos a las páginas públicas (SEO) */}
          <nav aria-label="Pie de página" className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-ink">Tu marca en cada IA</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/ia/chatgpt" className="hover:text-ink">ChatGPT</Link></li>
                <li><Link href="/ia/claude" className="hover:text-ink">Claude</Link></li>
                <li><Link href="/ia/gemini" className="hover:text-ink">Gemini</Link></li>
                <li><Link href="/ia/perplexity" className="hover:text-ink">Perplexity</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink">Aprende</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/guias/que-es-geo" className="hover:text-ink">Qué es GEO</Link></li>
                <li><Link href="/metodologia" className="hover:text-ink">Metodología</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink">Menciones</p>
              <ul className="mt-2 space-y-1">
                <li><Link href="/planes" className="hover:text-ink">Planes</Link></li>
                <li><Link href="/registro" className="hover:text-ink">Crear cuenta gratis</Link></li>
                <li><Link href="/terminos" className="hover:text-ink">Términos y condiciones</Link></li>
                <li><Link href="/privacidad" className="hover:text-ink">Política de privacidad</Link></li>
              </ul>
            </div>
          </nav>
          <p className="mt-8 text-xs">© {new Date().getFullYear()} Menciones</p>
        </footer>
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}
