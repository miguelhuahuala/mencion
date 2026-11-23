import { ImageResponse } from "next/og";

// Imagen de vista previa al compartir menciones.org (WhatsApp, LinkedIn, X, Slack…)
export const alt = "Menciones — ¿Las IAs recomiendan tu marca?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const bars = [
  { label: "Tu marca", value: 64, own: true },
  { label: "Competidor A", value: 70, own: false },
  { label: "Competidor B", value: 41, own: false },
];
const engines = ["ChatGPT", "Claude", "Gemini", "Perplexity"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f6f7fb", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#4f46e5", color: "white", fontSize: 44, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              “
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#0c1222" }}>Menciones</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 60, fontWeight: 700, color: "#0c1222", lineHeight: 1.08, letterSpacing: -1.5 }}>
              ¿Las IAs recomiendan tu marca?
            </div>
            <div style={{ fontSize: 28, color: "#5d6679", marginTop: 20, lineHeight: 1.35 }}>
              Mide tu visibilidad en ChatGPT, Claude, Gemini y Perplexity frente a tu competencia.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: "#4f46e5", fontWeight: 700 }}>
            menciones.org · Empieza gratis
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginLeft: 48, flex: 1, background: "white", borderRadius: 24, border: "1px solid #e4e7ee", padding: 32, boxShadow: "0 20px 50px rgba(12,18,34,0.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 16, color: "#5d6679", fontWeight: 700, letterSpacing: 1.5 }}>VISIBILIDAD EN IA</div>
            <div style={{ fontSize: 13, color: "#b45309", background: "#fdf3e3", padding: "3px 10px", borderRadius: 999 }}>Ejemplo</div>
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, color: "#0c1222", marginTop: 4 }}>64%</div>
          <div style={{ fontSize: 18, color: "#0f8a5f", marginBottom: 24 }}>+26 pts en 10 semanas</div>
          {bars.map((b) => (
            <div key={b.label} style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#0c1222", fontWeight: b.own ? 700 : 400 }}>
                <span>{b.label}</span>
                <span>{b.value}%</span>
              </div>
              <div style={{ display: "flex", height: 12, background: "#f6f7fb", borderRadius: 6, marginTop: 6 }}>
                <div style={{ width: `${b.value}%`, height: 12, borderRadius: 6, background: b.own ? "#4f46e5" : "#cbd5e1" }} />
              </div>
            </div>
          ))}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto" }}>
            {engines.map((e) => (
              <div key={e} style={{ fontSize: 16, padding: "6px 12px", borderRadius: 999, background: "#eef0ff", color: "#4f46e5", fontWeight: 700 }}>{e}</div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
