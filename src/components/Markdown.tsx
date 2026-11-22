/**
 * Renderizador mínimo y seguro de Markdown (sin HTML crudo): títulos, listas,
 * **negrita**, *cursiva*, `código` y [enlaces](url). Suficiente para respuestas de IA.
 */
import { Fragment } from "react";

function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={key} className="rounded bg-surface px-1 font-mono text-xs">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const [, label, url] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok)!;
      out.push(/^https?:\/\//.test(url) ? <a key={key} href={url} target="_blank" rel="noreferrer nofollow" className="text-accent underline">{label}</a> : label);
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const key = String(i);
        const h = /^(#{1,6})\s+(.*)$/.exec(line);
        if (h) return <p key={key} className="pt-2 font-semibold">{inline(h[2], key)}</p>;
        const li = /^\s*([-*•]|\d+[.)])\s+(.*)$/.exec(line);
        if (li) return <p key={key} className="pl-5 -indent-4"><span className="text-muted">{/\d/.test(li[1]) ? li[1] : "•"} </span>{inline(li[2], key)}</p>;
        if (!line.trim()) return <Fragment key={key} />;
        return <p key={key}>{inline(line, key)}</p>;
      })}
    </div>
  );
}

/** Quita marcas de Markdown para mostrar fragmentos en texto plano. */
export function plain(text: string) {
  return text.replace(/\*\*|__|`|^#+\s*/gm, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
