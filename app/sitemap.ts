import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  ALL_NIEUWS_SLUGS_QUERY,
  ALL_PROJECT_SLUGS_QUERY,
  ALL_VACATURE_SLUGS_QUERY,
  WONINGZOEKER_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { getWonenBijProject, getWonenBijProjectByAlias } from "@/data/wonenbij";
import { getAllDemoSlugs } from "@/data/woningzoeker";
import { SITE_URL } from "@/lib/siteConfig";

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
  "/wonenbij",
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
  [...new Set([...woningzoekers, ...getAllDemoSlugs()])].forEach((s) =>
    paden.push(`/woningzoeker/${s}`)
  );

  // Wonen-bij: bewust alleen de projecten die volwaardig in de code-omgeving
  // bestaan (met woningtypes). De Sanity-vlag showInWonen levert ook dunne
  // placeholder-pagina's op (o.a. de-dirigent) — die renderen wel, maar
  // bieden we een crawler niet actief aan. Uitbreiden zodra meer projecten
  // een echte wonen-bij pagina krijgen.
  const wonenbijSlugs = ["taanschuurkade"];
  for (const slug of wonenbijSlugs) {
    const project = getWonenBijProject(slug);
    if (!project) continue;
    paden.push(`/wonenbij/${slug}`);
    project.woningTypes.forEach((t) =>
      paden.push(`/wonenbij/${slug}/${t.slug}`)
    );
  }

  // Wonen-bij nieuws: alleen het eigen demo-artikel. De overige slugs onder
  // /wonenbij/nieuws/ zijn duplicaten van /nieuws/ en staan daar al in.
  paden.push("/wonenbij/nieuws/start-bouw-taanschuurkade");

  const nu = new Date();
  return [...new Set(paden)].map((pad) => ({
    url: `${SITE_URL}${pad}`,
    lastModified: nu,
  }));
}
