import type { Project } from "@/generated/prisma/client";
import { parseJson, type Competitor } from "./types";

export function ownBrand(p: Project): Competitor {
  return { name: p.name, domain: p.domain, aliases: parseJson<string[]>(p.aliases, []) };
}

export function competitorsOf(p: Project): Competitor[] {
  return parseJson<Competitor[]>(p.competitors, []);
}

/** "Marca | dominio.com | alias1, alias2" por línea → Competitor[] */
export function parseCompetitorLines(raw: string): Competitor[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [name = "", domain = "", aliases = ""] = line.split("|").map((s) => s.trim());
      return {
        name,
        domain: domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase(),
        aliases: aliases.split(",").map((a) => a.trim()).filter(Boolean),
      };
    })
    .filter((c) => c.name);
}

export function competitorLines(cs: Competitor[]) {
  return cs.map((c) => [c.name, c.domain, c.aliases.join(", ")].filter((x, i) => i < 2 || x).join(" | ")).join("\n");
}
