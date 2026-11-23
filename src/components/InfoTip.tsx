"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

const WIDTH = 240; // px
const GAP = 8; // margen con el borde de la pantalla

/**
 * Ícono "i" con tooltip. Se abre con el cursor, al tocarlo o al enfocarlo con el teclado (Esc lo cierra).
 * Usa position: fixed y se ajusta para no salirse de la pantalla en móviles.
 */
export function InfoTip({ text, label }: { text: string; label: string }) {
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const place = () => {
      const r = btn.current!.getBoundingClientRect();
      const w = Math.min(WIDTH, window.innerWidth - GAP * 2);
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
  }, [open]);

  return (
    <span className="inline-flex align-middle normal-case tracking-normal">
      <button
        ref={btn}
        type="button"
        aria-label={`Qué es ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="ml-1 inline-flex size-4 cursor-help items-center justify-center rounded-full border border-current text-[9px] font-bold leading-none text-muted opacity-70 hover:opacity-100 focus-visible:opacity-100"
      >
        i
      </button>
      {open && pos && (
        <span
          id={id}
          role="tooltip"
          style={{ left: pos.left, top: pos.top, width: Math.min(WIDTH, window.innerWidth - GAP * 2) }}
          className="pointer-events-none fixed z-50 rounded-lg bg-ink px-3 py-2 text-xs font-normal leading-snug text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}
