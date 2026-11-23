"use client";

import { siWhatsapp } from "simple-icons";

const PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51941463855";
const MESSAGE = "Hola quiero saber más de Menciones";
const HREF = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Botón flotante para escribir por WhatsApp. Registra el clic en GA4 como evento "whatsapp_click". */
export function WhatsAppButton() {
  return (
    <a
      href={HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
      onClick={() => window.gtag?.("event", "whatsapp_click", { location: window.location.pathname })}
      className="group fixed right-4 z-50 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_8px_24px_rgb(0_0_0/0.18)] transition hover:scale-105 hover:shadow-[0_10px_28px_rgb(0_0_0/0.24)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 sm:right-6"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <svg viewBox="0 0 24 24" width={28} height={28} fill="currentColor" aria-hidden>
        <path d={siWhatsapp.path} />
      </svg>
      <span className="hidden pr-1 text-sm font-semibold sm:group-hover:inline">¿Consultas?</span>
    </a>
  );
}
