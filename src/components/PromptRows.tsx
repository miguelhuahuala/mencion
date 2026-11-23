"use client";

import { useId, useState } from "react";

type Row = { key: number; text: string; tags: string };

/**
 * Una casilla por prompt (evita que varias preguntas se guarden como una sola), con sus etiquetas opcionales.
 * Envía campos repetidos "prompt" y "promptTags" en el mismo orden.
 */
export function PromptRows({ initial, max }: { initial: { text: string; tags: string[] }[]; max: number }) {
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length ? initial : [{ text: "", tags: [] }]).map((p, key) => ({ key, text: p.text, tags: p.tags.join(", ") })),
  );
  const [nextKey, setNextKey] = useState(rows.length);
  const listId = useId();
  const examples = ["¿Cuál es el mejor banco del Perú?", "¿Qué banco tiene la mejor app móvil en Perú?"];
  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  // Sugerencias: etiquetas ya escritas en otras casillas
  const known = [...new Set(rows.flatMap((r) => r.tags.split(",").map((t) => t.trim()).filter(Boolean)))];

  return (
    <div className="space-y-3">
      <datalist id={listId}>
        {known.map((t) => <option key={t} value={t} />)}
      </datalist>
      {rows.map((r, i) => (
        <div key={r.key} className="flex items-start gap-2">
          <span className="mt-3 w-5 shrink-0 text-right font-mono text-xs text-muted">{i + 1}</span>
          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_11rem]">
            <input
              name="prompt"
              value={r.text}
              onChange={(e) => update(r.key, { text: e.target.value })}
              placeholder={examples[i] ?? "Escribe una pregunta completa"}
              aria-label={`Prompt ${i + 1}`}
              maxLength={500}
              required={i === 0}
              className="input font-normal normal-case tracking-normal"
            />
            <input
              name="promptTags"
              value={r.tags}
              onChange={(e) => update(r.key, { tags: e.target.value })}
              list={listId}
              placeholder="Etiqueta (opcional)"
              aria-label={`Etiquetas del prompt ${i + 1}, separadas por comas`}
              maxLength={100}
              className="input font-normal normal-case tracking-normal"
            />
          </div>
          <button
            type="button"
            onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.key !== r.key) : rs))}
            aria-label={`Quitar prompt ${i + 1}`}
            title="Quitar"
            disabled={rows.length === 1}
            className="grid h-10 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-bad-soft hover:text-bad disabled:opacity-30"
          >
            ×
          </button>
        </div>
      ))}
      {rows.length < max ? (
        <button
          type="button"
          onClick={() => {
            setRows((rs) => [...rs, { key: nextKey, text: "", tags: "" }]);
            setNextKey((k) => k + 1);
          }}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          + Agregar prompt
        </button>
      ) : (
        <p className="text-xs text-muted">Llegaste al máximo de {max} prompts de tu plan.</p>
      )}
    </div>
  );
}
