export const usd = (n: number) => `$${n < 1 ? n.toFixed(3) : n.toFixed(2)}`;
export const dateShort = (d: Date) => d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
export const dateTime = (d: Date) =>
  d.toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
export const showDemo = () => process.env.SHOW_DEMO_DATA === "true";
