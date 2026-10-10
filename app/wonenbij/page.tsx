import type { Metadata } from "next";
import WonenBijLanding, {
  type WonenBijLandingData,
} from "@/components/wonenbij/WonenBijLanding";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  WONENBIJ_LANDING_PROJECTS_QUERY,
  WONENBIJ_LANDING_QUERY,
  FOOTER_QUERY,
} from "@/sanity/lib/queries";
import { sanityImageUrl, sanityImageUrlSized } from "@/sanity/lib/helpers";
import { wonenbijNaam } from "@/lib/wonenbijData";
import { wonenbijUrl } from "@/lib/siteConfig";
import {
  demoAanbod,
  demoLandingProjecten,
  getWonenBijProjectByAlias,
  landingDefaults,
  type AanbodKaart,
  type LandingProjectKaart,
} from "@/data/wonenbij";

/**
 * De Sanity-slug van een project kan een alias zijn van de canonieke
 * wonen-bij slug (zie aliasSlugs in data/wonenbij.ts). Kaarten linken dan
 * direct naar de canonieke URL in plaats van via de redirect op de
 * projectpagina.
 */
function canoniekeSlug(sanitySlug: string): string {
  return getWonenBijProjectByAlias(sanitySlug)?.slug ?? sanitySlug;
}

const tekst = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v : undefined;

/**
 * Teksten en beelden van de landing uit het singleton "wonenBijLanding".
 * Ontbreekt het document of een veld, dan gebruikt de component de
 * standaard uit data/wonenbij.ts; de pagina blijft dan exact gelijk.
 */
/**
 * "Vanaf 12 oktober" zolang de teaserdatum nog in de toekomst ligt. De pagina
 * wordt elke minuut opnieuw opgebouwd (revalidate 60), dus de kaarten worden
 * kort na het moment vanzelf weer klikbaar.
 */
function teaserLabel(tot: unknown): string | undefined {
  if (typeof tot !== "string") return undefined;
  const moment = Date.parse(tot);
  if (!Number.isFinite(moment) || Date.now() >= moment) return undefined;
  const datum = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  }).format(moment);
  return `Vanaf ${datum}`;
}

function landingUitSanity(raw: any): WonenBijLandingData {
  if (!raw) return {};
  return {
    // Poster onder de video: op 1920 breed, niet het originele bestand.
    heroImage: raw.heroImage?.asset
      ? sanityImageUrlSized(raw.heroImage, landingDefaults.heroImage, 1920)
      : undefined,
    // null/undefined = niet ingevuld → standaardvideo; lege string = geen video
    heroVideoUrl:
      typeof raw.heroVideoUrl === "string" ? raw.heroVideoUrl.trim() : undefined,
    heroExtraVideo: tekst(raw.heroExtraVideo),
    heroKnop: tekst(raw.heroKnop),
    introStatement: tekst(raw.introStatement),
    introCtas: (raw.introCtas ?? [])
      .filter((c: any) => tekst(c?.knop) && tekst(c?.doel))
      .map((c: any) => ({
        tekst: tekst(c.tekst) ?? "",
        knop: c.knop,
        href: c.doel,
      })),
    overTitel: tekst(raw.overTitel),
    overFoto: raw.overFoto?.asset
      ? sanityImageUrl(raw.overFoto, landingDefaults.overFoto)
      : undefined,
    overTekst: tekst(raw.overTekst),
    overFoto2: raw.overFoto2?.asset
      ? sanityImageUrl(raw.overFoto2, landingDefaults.overFoto2)
      : undefined,
    overTekstRechts: tekst(raw.overTekstRechts),
    overKnop: tekst(raw.overKnop),
    kwaliteitTitel: tekst(raw.kwaliteitTitel),
    kwaliteitItems: (raw.kwaliteitItems ?? [])
      .filter((k: any) => tekst(k?.label))
      .map((k: any) => ({ label: k.label, waarde: tekst(k.waarde) ?? "" })),
    aanbodTitel: tekst(raw.aanbodTitel),
    aanbodIntro: tekst(raw.aanbodIntro),
    aanbodTeaser: teaserLabel(raw.aanbodTeaserTot),
    projectenTitel: tekst(raw.projectenTitel),
    projectenIntro: tekst(raw.projectenIntro),
    contactLabel: tekst(raw.contactLabel),
    contactTitel: tekst(raw.contactTitel),
    contactTekst: tekst(raw.contactTekst),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const raw = await sanityFetch<any>({
    query: WONENBIJ_LANDING_QUERY,
    tags: ["wonenBijLanding"],
  });
  const landing = landingUitSanity(raw);
  return {
    title: "Wonen bij Weverskade",
    description:
      tekst(raw?.seoDescription) ??
      landing.introStatement ??
      landingDefaults.introStatement,
    alternates: { canonical: wonenbijUrl() },
    openGraph: { images: [landing.heroImage ?? landingDefaults.heroImage] },
  };
}

export default async function WonenBijHome() {
  const [projectsData, footerData, landingRaw] = await Promise.all([
    sanityFetch<any[]>({
      query: WONENBIJ_LANDING_PROJECTS_QUERY,
      tags: ["project"],
    }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
    sanityFetch<any>({
      query: WONENBIJ_LANDING_QUERY,
      tags: ["wonenBijLanding"],
    }),
  ]);
  const landing = landingUitSanity(landingRaw);

  let projecten: LandingProjectKaart[] = demoLandingProjecten;
  let aanbod: AanbodKaart[] = demoAanbod();

  if (projectsData?.length) {
    projecten = projectsData.map((p: any) => ({
      slug: canoniekeSlug(p.slug ?? ""),
      // CMS-namen zijn "Naam - Plaats"; de kaart toont de plaats al apart.
      naam: wonenbijNaam(p.name ?? "", p.location),
      plaats: p.location ?? "",
      image: sanityImageUrl(p.portfolioImage, "/images/wonenbij/vogelvlucht.jpg"),
      // De query levert alleen projecten met wonenBijEnabled.
      heeftWonenBijPagina: true,
    }));

    const sanityAanbod: AanbodKaart[] = projectsData.flatMap((p: any) =>
      (p.woningTypes ?? [])
        .filter((t: any) => t?.naam && t?.slug)
        .map((t: any) => ({
          projectSlug: canoniekeSlug(p.slug ?? ""),
          projectNaam: p.name ?? "",
          plaats: p.location ?? "",
          typeSlug: t.slug,
          typeNaam: t.naam,
          status: t.status ?? "inschrijven",
          prijsVan: t.prijsVan ?? 0,
          prijsTot: t.prijsTot ?? undefined,
          slaapkamers: t.slaapkamers ?? 0,
          oppervlakte: t.oppervlakte ?? 0,
          foto: t.foto ?? "/images/wonenbij/aanbod-card.png",
        }))
    );
    if (sanityAanbod.length) {
      aanbod = sanityAanbod;
    }
  }

  const footerProps = footerData
    ? {
        companyName: footerData.companyName,
        address: footerData.address,
        postalCode: footerData.postalCode,
        country: footerData.country,
        phone: footerData.phone,
        email: footerData.email,
        links: footerData.links,
      }
    : undefined;

  return (
    <>
      <WonenBijLanding data={{ ...landing, projecten, aanbod }} />
      {/* Nav-thema voor de wonen-bij kop: groen zodra de footer bovenin komt */}
      <div data-nav-theme="green">
        <FooterReveal>
          <Footer bg="bg-green" data={footerProps} mobielTot="lg" privacyHref="/wonenbij/privacybeleid" wonenBij />
        </FooterReveal>
      </div>
    </>
  );
}
