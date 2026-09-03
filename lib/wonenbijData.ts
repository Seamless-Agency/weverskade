/**
 * Server-side mapping van Sanity-projectdata naar het WonenBijProject-model.
 * Sanity is leidend; ontbrekende onderdelen vallen terug op de demo-content
 * in data/wonenbij.ts zodat de omgeving ook zonder CMS-invoer volledig rendert.
 */

import { sanityFetch } from "@/sanity/lib/fetch";
import {
  WONENBIJ_PROJECT_BY_SLUG_QUERY,
  WONENBIJ_PROJECT_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { sanityImageUrl } from "@/sanity/lib/helpers";
import {
  demoBegeleiding,
  demoWonenBijProjecten,
  getWonenBijProject,
  type Aanzicht,
  type WonenBijProject,
  type WoningType,
} from "@/data/wonenbij";
import type { Feit } from "@/data/wonenbij";
import type { Woning } from "@/data/woningzoeker";

function mapWoningType(raw: any): WoningType | null {
  if (!raw?.naam || !raw?.slug) return null;
  return {
    slug: raw.slug,
    naam: raw.naam,
    status: raw.status ?? "inschrijven",
    prijsVan: raw.prijsVan ?? 0,
    prijsTot: raw.prijsTot ?? undefined,
    oppervlakte: raw.oppervlakte ?? 0,
    slaapkamers: raw.slaapkamers ?? 0,
    energielabel: raw.energielabel ?? undefined,
    buitenruimte: raw.buitenruimte ?? undefined,
    fotos: (raw.fotos ?? []).filter(Boolean),
    plattegronden: (raw.plattegronden ?? []).filter(Boolean),
    plattegrondLabel: raw.plattegrondLabel ?? undefined,
    omschrijving: (raw.omschrijving ?? []).filter(
      (blok: any) => blok?.kop || blok?.tekst
    ),
  };
}

function mapWoning(raw: any): Woning | null {
  if (!raw?._key || !Array.isArray(raw.polygon) || raw.polygon.length < 3) {
    return null;
  }
  return {
    id: raw._key,
    nummer: raw.nummer ?? "",
    bouwnummer: raw.bouwnummer ?? undefined,
    woningType: raw.woningType ?? "",
    status: raw.status ?? "beschikbaar",
    verdieping: raw.verdieping ?? 0,
    oppervlakte: raw.oppervlakte ?? 0,
    slaapkamers: raw.slaapkamers ?? 0,
    huurprijs: raw.huurprijs ?? 0,
    prijsVanaf: raw.prijsVanaf ?? undefined,
    orientatie: raw.orientatie ?? undefined,
    buitenruimte: raw.buitenruimte ?? undefined,
    plattegrond: raw.plattegrond ?? undefined,
    polygon: raw.polygon,
  };
}

/**
 * Eén CMS-aanzicht (luchtfoto/gevel) met eigen render, woningen en klikzones.
 * Vereist key, label en een render mét afmetingen; anders slaan we hem over.
 */
function mapAanzicht(raw: any, naam: string): Aanzicht | null {
  if (!raw?.key || !raw?.label || !raw?.render) return null;
  if (!raw.renderDimensions?.width || !raw.renderDimensions?.height) return null;
  const woningen = (raw.woningen ?? [])
    .map(mapWoning)
    .filter(Boolean) as Woning[];
  const zones = (raw.zones ?? [])
    .filter(
      (zone: any) =>
        zone?.doelKey && Array.isArray(zone.polygon) && zone.polygon.length >= 3
    )
    .map((zone: any) => ({
      doelKey: zone.doelKey,
      label: zone.label ?? "",
      polygon: zone.polygon,
    }));
  return {
    key: raw.key,
    label: raw.label,
    weergave: raw.weergave === "passend" ? "passend" : "vullend",
    render: raw.render,
    renderAlt: `${raw.label} van ${naam}`,
    renderWidth: raw.renderDimensions.width,
    renderHeight: raw.renderDimensions.height,
    woningen,
    zones: zones.length ? zones : undefined,
  };
}

/**
 * CMS-projectnamen volgen "Naam - Plaats" (bijv. "De Dirigent - Naaldwijk"),
 * maar op de wonen-bij pagina staat de plaats al los in de hero. De
 * plaats-suffix gaat er dus af zolang die overeenkomt met het locatieveld.
 */
export function zonderPlaats(name: string, location?: string): string {
  if (!location) return name;
  const match = name.match(/^(.*?)\s*[-–]\s*(.+)$/);
  if (match && match[2].trim().toLowerCase() === location.trim().toLowerCase()) {
    return match[1].trim();
  }
  return name;
}

/**
 * Volledige naamnormalisatie voor de wonen-bij weergave: plaats-suffix en
 * lidwoord eraf ("De Taanschuurkade -  Maassluis" → "Taanschuurkade"), zoals
 * het design de projectnaam toont.
 */
export function wonenbijNaam(name: string, location?: string): string {
  return zonderPlaats(name, location).replace(/^(de|het|'t)\s+/i, "");
}

function fromSanity(raw: any): WonenBijProject | null {
  if (!raw?.name || !raw?.slug) return null;

  // Vangnet ALLEEN voor projecten met een eigen code-demo (Taanschuurkade).
  // Andere projecten (variant zonder woningzoeker) vallen per veld terug op
  // hun gebouw-content van de hoofdsite, of laten de sectie gewoon weg —
  // nooit meer op andermans content (dat kloonde Taanschuurkade overal).
  const demo = getWonenBijProject(raw.slug);
  const fallback: Partial<WonenBijProject> = demo ?? {};
  const naam = wonenbijNaam(raw.name, raw.location);

  // Gebouw-afgeleiden voor de variant zonder eigen wonen-bij content.
  const gebouwFotos: string[] = (raw.smallImages ?? [])
    .map((foto: any) => sanityImageUrl(foto, ""))
    .filter(Boolean);
  // Carrousel: het brede beeld plus alle gebouwfoto's die de welkom-sectie
  // niet al gebruikt (die toont [0] en [1]) — zo raakt de slider gevuld.
  const gebouwCarrousel: string[] = [
    raw.fullWidthImage ? sanityImageUrl(raw.fullWidthImage, "") : "",
    ...gebouwFotos.slice(2),
  ].filter(Boolean);
  // Statement + welkomtekst uit één gebouwbeschrijving: de eerste zin(nen)
  // tot ±200 tekens worden het grote intro-statement, de rest gaat naar de
  // welkom-sectie (knip op zinsgrens; drempel afgestemd met Robin 01-09
  // zodat de openingsalinea compleet in het statement valt).
  const zinnen: string[] =
    (raw.descriptionLeft ?? "")
      .match(/[^.!?]+[.!?]+(?=\s|$)/g)
      ?.map((z: string) => z.trim()) ?? [];
  let introAfgeleid: string | undefined;
  let welkomAfgeleid: string | undefined = raw.descriptionLeft ?? undefined;
  if (zinnen.length >= 2) {
    const kop: string[] = [];
    for (const zin of zinnen) {
      kop.push(zin);
      if (kop.join(" ").length >= 200) break;
    }
    if (kop.length < zinnen.length) {
      introAfgeleid = kop.join(" ");
      welkomAfgeleid = zinnen.slice(kop.length).join(" ");
    }
  }

  const gebouwFeiten: Feit[] = [];
  if (raw.address || raw.location) {
    gebouwFeiten.push({
      icoon: "locatie",
      label: "Locatie",
      waarde: raw.address ?? raw.location,
    });
  }
  if (raw.wonenSize || raw.size) {
    gebouwFeiten.push({
      icoon: "oppervlakte",
      label: "Oppervlakte",
      waarde: raw.wonenSize ?? raw.size,
    });
  }
  if (raw.year) {
    // Sanity levert "Bouwjaar 2024"; label en waarde niet dubbelen.
    gebouwFeiten.push({
      icoon: "beschikbaarheid",
      label: "Bouwjaar",
      waarde: String(raw.year).replace(/^bouwjaar\s*/i, ""),
    });
  }
  if (raw.status) {
    gebouwFeiten.push({ icoon: "woningen", label: "Status", waarde: raw.status });
  }
  if (raw.epc) {
    gebouwFeiten.push({
      icoon: "duurzaamheid",
      label: "Duurzaamheid",
      waarde: raw.epc,
    });
  }
  if (raw.wonenBeschikbaar === true) {
    gebouwFeiten.push({
      icoon: "huurprijs",
      label: "Beschikbaarheid",
      waarde: "Woningen beschikbaar",
    });
  }
  if (raw.partners) {
    // Sanity levert "Partners: X, Y"; label niet dubbelen.
    gebouwFeiten.push({
      icoon: "woningen",
      label: "Partners",
      waarde: String(raw.partners).replace(/^partners:\s*/i, ""),
    });
  }

  const woningTypes = (raw.woningTypes ?? [])
    .map(mapWoningType)
    .filter(Boolean) as WoningType[];
  const woningen = (raw.woningen ?? [])
    .map(mapWoning)
    .filter(Boolean) as Woning[];
  const cmsAanzichten = (raw.aanzichten ?? [])
    .map((a: any) => mapAanzicht(a, naam))
    .filter(Boolean) as Aanzicht[];

  // De platte woningenlijst voedt de filters en de typekoppeling. Zonder
  // losse lijst nemen we alle woningen van de aanzichten, ontdubbeld op
  // bouwnummer (dezelfde woning kan op voor- én achtergevel staan).
  const aanzichtWoningen: Woning[] = [];
  for (const view of cmsAanzichten) {
    for (const woning of view.woningen) {
      if (!aanzichtWoningen.some((w) => w.nummer === woning.nummer)) {
        aanzichtWoningen.push(woning);
      }
    }
  }

  return {
    slug: raw.slug,
    naam,
    plaats: raw.location ?? fallback.plaats ?? "",
    heroImage: sanityImageUrl(raw.heroImage, fallback.heroImage ?? ""),
    intro:
      raw.wonenBijIntro ??
      fallback.intro ??
      introAfgeleid ??
      raw.tagline ??
      raw.descriptionLeft ??
      undefined,
    feiten: raw.feiten?.length
      ? raw.feiten
      : (fallback.feiten ?? (gebouwFeiten.length ? gebouwFeiten : undefined)),
    hurenFotos: raw.hurenFotos?.length
      ? raw.hurenFotos.map((foto: any) => sanityImageUrl(foto, ""))
      : fallback.hurenFotos,
    hurenTitel: fallback.hurenTitel,
    // De begeleidingssectie is generieke Weverskade-tekst en kan overal mee.
    begeleiding: demoBegeleiding,
    welkomLabel: "Welkom bij",
    welkomTitel: naam,
    welkomTekst: raw.welkomTekst ?? fallback.welkomTekst ?? welkomAfgeleid,
    welkomTekstRechts:
      raw.welkomTekstRechts ?? fallback.welkomTekstRechts ?? raw.descriptionRight,
    welkomFotos: raw.welkomFotos?.length
      ? raw.welkomFotos.map((foto: any) => sanityImageUrl(foto, ""))
      : (fallback.welkomFotos ??
        (gebouwFotos.length ? gebouwFotos : undefined)),
    carouselFotos: raw.carouselFotos?.length
      ? raw.carouselFotos.map((foto: any) => sanityImageUrl(foto, ""))
      : (fallback.carouselFotos ??
        (gebouwCarrousel.length ? gebouwCarrousel : undefined)),
    locatieLabel: "De locatie",
    locatieTitel: raw.locatieTitel ?? fallback.locatieTitel,
    locatieIntro: raw.locatieIntro ?? fallback.locatieIntro,
    locatieItems: raw.locatieItems?.length
      ? raw.locatieItems
      : fallback.locatieItems,
    mapImage: fallback.mapImage,
    mapLat: raw.mapLat ?? fallback.mapLat ?? raw.mapCoordinates?.lat,
    mapLng: raw.mapLng ?? fallback.mapLng ?? raw.mapCoordinates?.lng,
    planning: raw.planning?.length
      ? raw.planning.map((fase: any) => ({
          periode: fase.periode ?? "",
          titel: fase.titel ?? "",
          omschrijving: fase.omschrijving ?? "",
          verwachtingen: fase.verwachtingen ?? [],
          actief: Boolean(fase.actief),
        }))
      : fallback.planning,
    downloads: raw.downloads?.length
      ? raw.downloads
          .filter((item: any) => item?.titel && item?.url)
          .map((item: any) => ({ titel: item.titel, url: item.url }))
      : fallback.downloads,
    faq: raw.faq?.length ? raw.faq : fallback.faq,
    // Types nooit van een ander project lenen: zonder eigen types is dit de
    // variant zonder woningzoeker/aanbod en 404'en de typepagina's.
    woningTypes: woningTypes.length ? woningTypes : (fallback.woningTypes ?? []),
    render: raw.render ?? fallback.render,
    renderAlt: `Render van ${naam}`,
    renderWidth: raw.renderDimensions?.width ?? fallback.renderWidth,
    renderHeight: raw.renderDimensions?.height ?? fallback.renderHeight,
    // Woningen en aanzichten zijn projectspecifieke data: die vallen alleen
    // terug op de demo van HETZELFDE project (slug-match), nooit op het
    // algemene taanschuurkade-vangnet - anders lekt de Taanschuurkade-gevel
    // met 40 woningen naar elk ander wonenbij-project zonder CMS-woningen.
    woningen: cmsAanzichten.length
      ? woningen.length
        ? woningen
        : aanzichtWoningen
      : woningen.length
        ? woningen
        : (demo?.woningen ?? []),
    // Voorrang: CMS-aanzichten > losse CMS-render met woningen > demo.
    aanzichten: cmsAanzichten.length
      ? cmsAanzichten
      : woningen.length
        ? undefined
        : demo?.aanzichten,
  };
}

export async function getWonenBijProjectData(
  slug: string
): Promise<WonenBijProject | null> {
  const raw = await sanityFetch<any>({
    query: WONENBIJ_PROJECT_BY_SLUG_QUERY,
    params: { slug },
    tags: ["project"],
  });

  return fromSanity(raw) ?? getWonenBijProject(slug) ?? null;
}

export async function getWonenBijProjectSlugs(): Promise<string[]> {
  const sanitySlugs =
    (await sanityFetch<string[]>({
      query: WONENBIJ_PROJECT_SLUGS_QUERY,
      tags: ["project"],
    })) ?? [];
  const demoSlugs = demoWonenBijProjecten.map((p) => p.slug);
  return [...new Set([...sanitySlugs, ...demoSlugs])];
}
