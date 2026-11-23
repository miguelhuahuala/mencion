"use client";

import { useEffect, useRef, useState } from "react";

export type PaletteColor = { hex: string; name: string };

/**
 * Selector de color limitado a la paleta validada (colores distinguibles entre sí, también con daltonismo).
 * Envía el valor en un input oculto con el `name` indicado.
 */
export function ColorPicker({
  name,
  value,
  onChange,
  palette,
  label,
  taken = [],
}: {
  name: string;
  value: string;
  onChange?: (hex: string) => void;
  palette: PaletteColor[];
  label: string;
  /** Colores ya usados por otras marcas del proyecto (se marcan para evitar repetirlos). */
  taken?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(value);
  const box = useRef<HTMLDivElement>(null);
  const selected = palette.find((p) => p.hex.toLowerCase() === current.toLowerCase()) ?? palette[0];

  useEffect(() => setCurrent(value), [value]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const pick = (hex: string) => {
    setCurrent(hex);
    onChange?.(hex);
    setOpen(false);
  };

  return (
    <div ref={box} className="relative">
      <input type="hidden" name={name} value={selected.hex} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selected.name}`}
        title={selected.name}
        className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-white hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      >
        <span className="size-6 rounded-md" style={{ background: selected.hex }} />
      </button>
      {open && (
        <div role="listbox" aria-label={label} className="absolute left-0 top-12 z-20 w-max rounded-xl border border-line bg-white p-2 font-normal normal-case tracking-normal shadow-lg">
          <div className="grid grid-cols-4 gap-1.5">
            {palette.map((p) => {
              const isSel = p.hex === selected.hex;
              const isTaken = !isSel && taken.some((t) => t.toLowerCase() === p.hex.toLowerCase());
              return (
                <button
                  key={p.hex}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => pick(p.hex)}
                  title={isTaken ? `${p.name} (ya lo usa otra marca)` : p.name}
                  className={`relative grid size-9 place-items-center rounded-lg border-2 ${isSel ? "border-ink" : "border-transparent hover:border-line"}`}
                >
                  <span className={`size-6 rounded-md ${isTaken ? "opacity-40" : ""}`} style={{ background: p.hex }} />
                  {isSel && <span aria-hidden className="absolute text-xs font-bold text-white">✓</span>}
                </button>
              );
            })}
          </div>
          <p className="mt-2 max-w-44 text-[11px] leading-snug text-muted">Colores elegidos para que las marcas se distingan bien en los gráficos.</p>
        </div>
      )}
    </div>
  );
}
