import type { Project } from "@/generated/prisma/client";
import { parseJson, type Competitor } from "./types";

/**
 * Paleta categórica validada (luminosidad, croma y separación para daltonismo): marca propia = 1.ª,
 * competidores en orden fijo. Más allá de 8 se usa gris.
 */
export const PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
export const OTHER_COLOR = "#8a8a8a";
export const MAX_COMPETITORS = 10;

export const defaultCompetitorColor = (i: number) => PALETTE[i + 1] ?? OTHER_COLOR;

export function isHexColor(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
}

export function ownBrand(p: Project): Competitor {
  return { name: p.name, domain: p.domain, aliases: parseJson<string[]>(p.aliases, []), color: isHexColor(p.color) ? p.color : PALETTE[0] };
}

export function competitorsOf(p: Project): Competitor[] {
  return parseJson<Competitor[]>(p.competitors, []).map((c, i) => ({ ...c, color: isHexColor(c.color) ? c.color : defaultCompetitorColor(i) }));
}

export function cleanDomain(raw: string) {
  return raw.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
}

/** Lee las filas de competidores del formulario (campos repetidos comp_name, comp_domain, comp_aliases, comp_color). */
export function competitorsFromForm(form: FormData): Competitor[] {
  const names = form.getAll("comp_name").map(String);
  const domains = form.getAll("comp_domain").map(String);
  const aliases = form.getAll("comp_aliases").map(String);
  const colors = form.getAll("comp_color").map(String);
  return names
    .map((name, i) => ({
      name: name.trim().slice(0, 80),
      domain: cleanDomain(domains[i] ?? "").slice(0, 120),
      aliases: (aliases[i] ?? "").split(",").map((a) => a.trim()).filter(Boolean).slice(0, 10),
      color: isHexColor(colors[i]) ? colors[i].toLowerCase() : defaultCompetitorColor(i),
    }))
    .filter((c) => c.name)
    .slice(0, MAX_COMPETITORS);
}
