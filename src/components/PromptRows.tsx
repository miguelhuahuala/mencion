"use client";

import { useState } from "react";

/** Una casilla por prompt (evita que varias preguntas se guarden como una sola). Envía campos repetidos "prompt". */
export function PromptRows({ initial, max }: { initial: string[]; max: number }) {
  const [rows, setRows] = useState(() => (initial.length ? initial : [""]).map((text, key) => ({ key, text })));
  const [nextKey, setNextKey] = useState(rows.length);
  const examples = ["¿Cuál es el mejor banco del Perú?", "¿Qué banco tiene la mejor app móvil en Perú?"];

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r.key} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-right font-mono text-xs text-muted">{i + 1}</span>
          <input
            name="prompt"
            value={r.text}
            onChange={(e) => setRows((rs) => rs.map((x) => (x.key === r.key ? { ...x, text: e.target.value } : x)))}
            placeholder={examples[i] ?? "Escribe una pregunta completa"}
            aria-label={`Prompt ${i + 1}`}
            maxLength={500}
            required={i === 0}
            className="input font-normal normal-case tracking-normal"
          />
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
            setRows((rs) => [...rs, { key: nextKey, text: "" }]);
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
