"use client";

import { useState } from "react";
import { ColorPicker, type PaletteColor } from "./ColorPicker";

type Row = { key: number; name: string; domain: string; aliases: string; color: string };

const field = "input font-normal normal-case tracking-normal";

/** Filas editables de competidores (nombre, dominio, alias y color). Envía campos repetidos comp_*. */
export function CompetitorRows({
  initial,
  palette,
  otherColor,
  max,
  brandColor,
}: {
  initial: { name: string; domain: string; aliases: string[]; color: string }[];
  palette: PaletteColor[];
  otherColor: string;
  max: number;
  brandColor: string;
}) {
  const hexes = palette.map((p) => p.hex).filter((h) => h !== otherColor);
  const colorFor = (i: number) => hexes[i + 1] ?? otherColor;
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length ? initial : [{ name: "", domain: "", aliases: [], color: colorFor(0) }]).map((c, i) => ({
      key: i,
      name: c.name,
      domain: c.domain,
      aliases: c.aliases.join(", "),
      color: c.color,
    })),
  );
  const [nextKey, setNextKey] = useState(rows.length);

  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: number) => setRows((rs) => rs.filter((r) => r.key !== key));
  const add = () => {
    setRows((rs) => {
      // Primer color de la paleta que no esté en uso
      const used = new Set([brandColor, ...rs.map((r) => r.color)].map((c) => c.toLowerCase()));
      const color = hexes.find((c) => !used.has(c.toLowerCase())) ?? otherColor;
      return [...rs, { key: nextKey, name: "", domain: "", aliases: "", color }];
    });
    setNextKey((k) => k + 1);
  };

  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[2.5rem_1fr_1fr_1fr_2rem] gap-2 px-1 text-xs font-medium text-muted sm:grid">
        <span>Color</span>
        <span>Marca</span>
        <span>Dominio</span>
        <span>Alias (opcional)</span>
        <span />
      </div>
      {rows.map((r, i) => (
        <div key={r.key} className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-2 sm:grid-cols-[2.5rem_1fr_1fr_1fr_2rem]">
          <ColorPicker
            name="comp_color"
            value={r.color}
            onChange={(hex) => update(r.key, { color: hex })}
            palette={palette}
            label={`Color del competidor ${i + 1}`}
            taken={[brandColor, ...rows.filter((x) => x.key !== r.key).map((x) => x.color)]}
          />
          <input
            name="comp_name"
            value={r.name}
            onChange={(e) => update(r.key, { name: e.target.value })}
            placeholder={i === 0 ? "Interbank" : "Marca"}
            aria-label={`Competidor ${i + 1}: marca`}
            maxLength={80}
            className={field}
          />
          <button
            type="button"
            onClick={() => remove(r.key)}
            aria-label={`Quitar competidor ${i + 1}`}
            title="Quitar"
            className="row-span-2 grid h-10 w-8 place-items-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad sm:order-last sm:row-span-1"
          >
            ×
          </button>
          <input
            name="comp_domain"
            value={r.domain}
            onChange={(e) => update(r.key, { domain: e.target.value })}
            placeholder={i === 0 ? "interbank.pe" : "dominio.com"}
            aria-label={`Competidor ${i + 1}: dominio`}
            maxLength={120}
            className={`${field} col-start-2 sm:col-start-auto`}
          />
          <input
            name="comp_aliases"
            value={r.aliases}
            onChange={(e) => update(r.key, { aliases: e.target.value })}
            placeholder="Otros nombres, separados por coma"
            aria-label={`Competidor ${i + 1}: alias`}
            className={`${field} col-start-2 sm:col-start-auto`}
          />
        </div>
      ))}
      {rows.length < max ? (
        <button type="button" onClick={add} className="btn-ghost px-3 py-1.5 text-xs">
          + Agregar competidor
        </button>
      ) : (
        <p className="text-xs text-muted">Máximo {max} competidores.</p>
      )}
    </div>
  );
}
