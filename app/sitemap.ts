import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  ALL_NIEUWS_SLUGS_QUERY,
  ALL_PROJECT_SLUGS_QUERY,
  ALL_VACATURE_SLUGS_QUERY,
  WONINGZOEKER_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { getWonenBijProject, getWonenBijProjectByAlias } from "@/data/wonenbij";
import { SITE_URL, wonenbijUrl } from "@/lib/siteConfig";

// Statische hoofdsite-routes; /studio en /api blijven bewust buiten de sitemap.
const STATISCHE_PADEN = [
  "",
  "/contact",
  "/maatschappelijk",
  "/nieuws",
  "/over-ons",
  "/portefeuille",
  "/privacybeleid",
  "/werken-bij",
  "/wonen-bij",
];

async function slugsVoor(query: string, tag: string): Promise<string[]> {
  return (await sanityFetch<string[]>({ query, tags: [tag] })) ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [nieuws, gebouwen, vacatures, woningzoekers] = await Promise.all([
    slugsVoor(ALL_NIEUWS_SLUGS_QUERY, "nieuwsArtikel"),
    slugsVoor(ALL_PROJECT_SLUGS_QUERY, "project"),
    slugsVoor(ALL_VACATURE_SLUGS_QUERY, "vacature"),
    slugsVoor(WONINGZOEKER_SLUGS_QUERY, "project"),
  ]);

  const paden: string[] = [...STATISCHE_PADEN];

  nieuws.forEach((s) => paden.push(`/nieuws/${s}`));
  // Gebouw-slugs die naar de wonen-bij omgeving redirecten (alias-slugs)
  // horen niet in de sitemap.
  gebouwen
    .filter((s) => !getWonenBijProjectByAlias(s))
    .forEach((s) => paden.push(`/gebouw/${s}`));
  vacatures.forEach((s) => paden.push(`/werken-bij/${s}`));
  // Alleen woningzoekers die écht in Sanity staan. De demo-slugs stonden hier
  // ook in en boden daarmee een pagina met fictieve woningen onder een echte
  // projectnaam actief aan crawlers aan; die fallback is uit de route gehaald.
  woningzoekers.forEach((s) => paden.push(`/woningzoeker/${s}`));

  // Wonen-bij: op de leidende subdomein-host, en bewust alleen de projecten
  // die volwaardig in de code-omgeving bestaan (met woningtypes). De
  // Sanity-vlag showInWonen levert ook dunne placeholder-pagina's op
  // (o.a. de-dirigent) — die renderen wel, maar bieden we een crawler niet
  // actief aan. Cross-host in één sitemap is toegestaan doordat dezelfde
  // robots.txt (met sitemap-verwijzing) ook op het subdomein geserveerd
  // wordt. Uitbreiden zodra meer projecten een echte pagina krijgen.
  const urls: string[] = [wonenbijUrl()];
  const wonenbijSlugs = ["taanschuurkade"];
  for (const slug of wonenbijSlugs) {
    const project = getWonenBijProject(slug);
    if (!project) continue;
    urls.push(wonenbijUrl(`/${slug}`));
    project.woningTypes.forEach((t) =>
      urls.push(wonenbijUrl(`/${slug}/${t.slug}`))
    );
  }

  // Wonen-bij nieuws: alleen het eigen demo-artikel. De overige slugs onder
  // nieuws zijn duplicaten van /nieuws/ op de hoofdsite en staan daar al in.
  urls.push(wonenbijUrl("/nieuws/start-bouw-taanschuurkade"));

  const nu = new Date();
  return [
    ...new Set([...paden.map((pad) => `${SITE_URL}${pad}`), ...urls]),
  ].map((url) => ({ url, lastModified: nu }));
}
