import { redirect } from "next/navigation";
import { startSession } from "@/lib/auth";
import { consumeVerification } from "@/lib/verification";

export const dynamic = "force-dynamic";

/** Enlace del correo de confirmación: activa la cuenta e inicia sesión. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const user = await consumeVerification(token);
  if (!user) redirect("/verificar?error=" + encodeURIComponent("El enlace venció o ya se usó. Ingresa o pide uno nuevo."));
  await startSession(user.id);
  redirect("/?bienvenida=1");
}
