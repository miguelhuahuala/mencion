"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

const WIDTH = 240; // px
const GAP = 8; // margen con el borde de la pantalla

/** Estado y posición de un tooltip anclado a un botón (position: fixed, ajustado para no salirse de la pantalla). */
function useTip(width: number) {
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const place = () => {
      const r = btn.current!.getBoundingClientRect();
      const w = Math.min(width, window.innerWidth - GAP * 2);
      const left = Math.min(Math.max(GAP, r.left + r.width / 2 - w / 2), window.innerWidth - w - GAP);
      setPos({ left, top: r.bottom + 6 });
    };
    place();
    window.addEventListener("scroll", place, { passive: true, capture: true });
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, [open, width]);

  const handlers = {
    ref: btn,
    type: "button" as const,
    "aria-describedby": open ? id : undefined,
    "aria-expanded": open,
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    // Clic o toque solo abre (con el cursor ya estaba abierto); se cierra al salir, al tocar fuera o con Esc
    onClick: () => setOpen(true),
    onKeyDown: (e: React.KeyboardEvent) => e.key === "Escape" && setOpen(false),
  };
  const bubble = (text: string) =>
    open && pos ? (
      <span
        id={id}
        role="tooltip"
        style={{ left: pos.left, top: pos.top, width: Math.min(width, window.innerWidth - GAP * 2) }}
        className="pointer-events-none fixed z-50 rounded-lg bg-ink px-3 py-2 text-left text-xs font-normal leading-snug text-white shadow-lg"
      >
        {text}
      </span>
    ) : null;
  return { handlers, bubble };
}

/**
 * Ícono "i" con tooltip. Se abre con el cursor, al tocarlo o al enfocarlo con el teclado (Esc lo cierra).
 * Usa position: fixed y se ajusta para no salirse de la pantalla en móviles.
 */
export function InfoTip({ text, label }: { text: string; label: string }) {
  const { handlers, bubble } = useTip(WIDTH);
  return (
    <span className="inline-flex align-middle normal-case tracking-normal">
      <button
        {...handlers}
        aria-label={`Qué es ${label}`}
        className="ml-1 inline-flex size-4 cursor-help items-center justify-center rounded-full border border-current text-[9px] font-bold leading-none text-muted opacity-70 hover:opacity-100 focus-visible:opacity-100"
      >
        i
      </button>
      {bubble(text)}
    </span>
  );
}

/** Tooltip sobre cualquier contenido (p. ej. una etiqueta), con el mismo estilo que InfoTip. */
export function Hint({ text, children, width = 200 }: { text: string; children: React.ReactNode; width?: number }) {
  const { handlers, bubble } = useTip(width);
  return (
    <span className="inline-flex">
      <button {...handlers} className="cursor-help rounded-full">
        {children}
      </button>
      {bubble(text)}
    </span>
  );
}
