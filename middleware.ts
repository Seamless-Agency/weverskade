import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomein-routing voor wonenbij.weverskade.com: het subdomein wordt intern
 * doorgekoppeld naar de /wonenbij-routes binnen dezelfde codebase (zelfde
 * deployment, zelfde Sanity). Zo blijft er één canonieke padstructuur:
 *
 *   wonenbij.weverskade.com/               → /wonenbij
 *   wonenbij.weverskade.com/taanschuurkade → /wonenbij/taanschuurkade
 *
 * Sinds de lancering (08-10-2026) stuurt de hoofdsite de oude en de nieuwe
 * wonen-bij adressen permanent door naar het subdomein, en stuurt het
 * subdomein adressen van de hoofdsite (bijv. een getypt /contact) door naar
 * www. Alleen op de echte hosts: preview-URL's van Vercel blijven werken.
 */
const WONENBIJ = "https://wonenbij.weverskade.com";
const HOOFDSITE = "https://www.weverskade.com";
const HOOFDSITE_HOSTS = new Set(["www.weverskade.com", "weverskade.com"]);

// Pagina's die alleen op de hoofdsite bestaan (/privacybeleid niet: wonen
// bij heeft een eigen privacypagina op hetzelfde pad). "/nieuws" alleen als index:
// /nieuws/<slug> is op het subdomein een wonen-bij nieuwsbericht.
const ALLEEN_HOOFDSITE = [
  "/over-ons",
  "/portefeuille",
  "/maatschappelijk",
  "/werken-bij",
  "/contact",
  "/gebouw",
  "/woningzoeker",
  "/studio",
];

function begintMet(pad: string, prefix: string) {
  return pad === prefix || pad.startsWith(`${prefix}/`);
}

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0];
  const pad = request.nextUrl.pathname;
  const zoek = request.nextUrl.search;

  if (HOOFDSITE_HOSTS.has(host)) {
    // Oude wonen-bij pagina → startpagina van het subdomein.
    if (begintMet(pad, "/wonen-bij")) {
      return NextResponse.redirect(`${WONENBIJ}/`, 308);
    }
    // Nieuwe wonen-bij routes niet dubbel op www.
    if (begintMet(pad, "/wonenbij")) {
      const rest = pad.slice("/wonenbij".length) || "/";
      return NextResponse.redirect(`${WONENBIJ}${rest}${zoek}`, 308);
    }
    return NextResponse.next();
  }

  const isWonenBijHost =
    host === "wonenbij.weverskade.com" || host.startsWith("wonenbij.");

  if (!isWonenBijHost) {
    return NextResponse.next();
  }

  if (begintMet(pad, "/wonen-bij")) {
    return NextResponse.redirect(`${WONENBIJ}/`, 308);
  }
  if (pad === "/nieuws" || ALLEEN_HOOFDSITE.some((p) => begintMet(pad, p))) {
    return NextResponse.redirect(`${HOOFDSITE}${pad}${zoek}`, 308);
  }

  // Al bestaande /wonenbij-paden ongemoeid laten.
  if (begintMet(pad, "/wonenbij")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pad === "/" ? "/wonenbij" : `/wonenbij${pad}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Statische assets (paden met een punt), _next en de API overslaan.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
