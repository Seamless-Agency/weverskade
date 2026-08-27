import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomein-routing voor wonenbij.weverskade.com: het subdomein wordt intern
 * doorgekoppeld naar de /wonenbij-routes binnen dezelfde codebase (zelfde
 * deployment, zelfde Sanity). Zo blijft er één canonieke padstructuur:
 *
 *   wonenbij.weverskade.com/               → /wonenbij
 *   wonenbij.weverskade.com/taanschuurkade → /wonenbij/taanschuurkade
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const isWonenBijHost =
    host === "wonenbij.weverskade.com" || host.startsWith("wonenbij.");

  if (!isWonenBijHost) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  // Studio en al bestaande /wonenbij-paden ongemoeid laten.
  if (
    url.pathname.startsWith("/wonenbij") ||
    url.pathname.startsWith("/studio")
  ) {
    return NextResponse.next();
  }

  url.pathname = url.pathname === "/" ? "/wonenbij" : `/wonenbij${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Statische assets (paden met een punt), _next en de API overslaan.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
