import "server-only";

/** Envío de correos transaccionales con Resend (https://resend.com). */
export function canSendEmail() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }) {
  if (!canSendEmail()) throw new Error("El envío de correos no está configurado (RESEND_API_KEY / EMAIL_FROM).");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Resend respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

export function siteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3030").replace(/\/$/, "");
}
