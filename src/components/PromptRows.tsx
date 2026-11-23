"use client";

import { useId, useRef, useState, useTransition } from "react";
import { suggestPromptsAction } from "@/app/actions";

type Suggestion = { text: string; volume: number };
const nf = new Intl.NumberFormat("es-PE");

type Row = { key: number; text: string; tags: string };

/**
 * Una casilla por prompt (evita que varias preguntas se guarden como una sola), con sus etiquetas opcionales.
 * Envía campos repetidos "prompt" y "promptTags" en el mismo orden.
 */
export function PromptRows({
  initial,
  max,
  suggestLeft,
}: {
  initial: { text: string; tags: string[] }[];
  max: number;
  /** Búsquedas de sugerencias que le quedan (null = sin límite; undefined = no disponible). */
  suggestLeft?: number | null;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length ? initial : [{ text: "", tags: [] }]).map((p, key) => ({ key, text: p.text, tags: p.tags.join(", ") })),
  );
  const [nextKey, setNextKey] = useState(rows.length);
  const listId = useId();
  const examples = ["¿Cuál es el mejor banco del Perú?", "¿Qué banco tiene la mejor app móvil en Perú?"];
  const update = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  // Sugerencias: etiquetas ya escritas en otras casillas
  const known = [...new Set(rows.flatMap((r) => r.tags.split(",").map((t) => t.trim()).filter(Boolean)))];
  const fold = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[¿?¡!.,]/g, "").trim();
  const filled = rows.filter((r) => r.text.trim()).length;

  /** Agrega una sugerencia: ocupa la primera casilla vacía o crea una nueva. */
  function addSuggestion(text: string, tag: string) {
    setRows((rs) => {
      const empty = rs.find((r) => !r.text.trim());
      if (empty) return rs.map((r) => (r.key === empty.key ? { ...r, text, tags: r.tags || tag } : r));
      return [...rs, { key: nextKey, text, tags: tag }];
    });
    setNextKey((k) => k + 1);
  }

  return (
    <div className="space-y-3">
      {suggestLeft !== undefined && (
        <SuggestPanel
          left={suggestLeft}
          canAdd={filled < max}
          isAdded={(t) => rows.some((r) => fold(r.text) === fold(t))}
          onAdd={addSuggestion}
        />
      )}
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

function SuggestPanel({
  left: initialLeft,
  canAdd,
  isAdded,
  onAdd,
}: {
  left: number | null;
  canAdd: boolean;
  isAdded: (text: string) => boolean;
  onAdd: (text: string, tag: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [topic, setTopic] = useState("");
  const [left, setLeft] = useState(initialLeft);
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [searched, setSearched] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function search() {
    const form = ref.current?.closest("form");
    if (!form || topic.trim().length < 3 || pending) return;
    const fd = new FormData(form);
    // Las marcas del formulario (tuya y competidores) se excluyen de las sugerencias
    const brands = ["name", "aliases", "comp_name", "comp_aliases"]
      .flatMap((k) => fd.getAll(k).map(String))
      .flatMap((v) => v.split(","))
      .map((v) => v.trim())
      .filter(Boolean);
    const t = topic.trim();
    setError(null);
    start(async () => {
      const res = await suggestPromptsAction({ topic: t, country: String(fd.get("country") ?? "PE"), language: String(fd.get("language") ?? "es"), brands });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setItems(res.suggestions);
      setSearched(t.charAt(0).toUpperCase() + t.slice(1));
      setLeft(res.left);
    });
  }

  const outOfSearches = left !== null && left <= 0;
  return (
    <div ref={ref} className="rounded-xl border border-accent/20 bg-accent-soft/50 p-3 sm:p-4">
      <p className="text-sm font-semibold text-ink">¿No sabes qué preguntar? Te sugerimos prompts</p>
      <p className="mt-0.5 text-xs text-muted">
        Escribe un producto o tema y te mostramos las preguntas más buscadas en el país que elegiste, redactadas como se le preguntan a una IA.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // no enviar el formulario del proyecto
              search();
            }
          }}
          maxLength={80}
          placeholder="Ej.: tarjeta de crédito"
          aria-label="Tema para sugerir prompts"
          className="input bg-white font-normal normal-case tracking-normal"
        />
        <button
          type="button"
          onClick={search}
          disabled={pending || topic.trim().length < 3 || outOfSearches}
          className="btn-primary shrink-0 px-3 text-sm disabled:opacity-50"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Buscando…
            </span>
          ) : (
            "Sugerir"
          )}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-muted" aria-live="polite">
        {pending
          ? "Buscando preguntas reales y redactándolas… puede tardar hasta un minuto."
          : left === null
            ? "Sin límite de búsquedas (admin)."
            : outOfSearches
              ? "Ya usaste tus búsquedas de sugerencias de este mes."
              : `Te ${left === 1 ? "queda 1 búsqueda" : `quedan ${left} búsquedas`} este mes. Repetir un tema ya buscado no consume búsquedas.`}
      </p>
      {error && <p role="alert" className="mt-2 rounded-lg bg-bad-soft px-3 py-2 text-xs text-bad">{error}</p>}
      {items && items.length > 0 && (
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-white">
          {items.map((s) => {
            const added = isAdded(s.text);
            return (
              <li key={s.text} className="flex items-center gap-3 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{s.text}</p>
                  <p className="text-[11px] text-muted">≈ {nf.format(s.volume)} búsquedas al mes</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(s.text, searched)}
                  disabled={added || !canAdd}
                  title={!canAdd && !added ? "Llegaste al máximo de prompts de tu plan" : undefined}
                  className="btn-ghost shrink-0 px-2.5 py-1 text-xs disabled:opacity-50"
                >
                  {added ? "Agregado ✓" : "+ Agregar"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {items && items.length > 0 && (
        <p className="mt-2 text-[11px] text-muted">
          Volumen estimado de búsquedas mensuales en Google con respuesta de IA en ese país (fuente: DataForSEO). Se agregan con la etiqueta “{searched}”.
        </p>
      )}
    </div>
  );
}
