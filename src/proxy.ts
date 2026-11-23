import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * Protege toda la app con una contraseña (HTTP Basic) cuando APP_PASSWORD está definida.
 * Sin esto, cualquiera que entre a la web podría crear proyectos y gastar tus créditos de DataForSEO.
 * /api/cron queda fuera: se protege con su propio CRON_SECRET.
 */
function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = Buffer.from(header.slice(6), "base64").toString();
    const given = decoded.slice(decoded.indexOf(":") + 1);
    if (same(given, password)) return NextResponse.next();
  }
  return new NextResponse("Acceso restringido", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Menciones", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!api/cron|_next/static|_next/image|favicon.ico).*)"],
};
