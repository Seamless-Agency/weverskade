import WonenBijNieuwsPage, {
  type WonenBijNieuwsData,
} from "@/components/wonenbij/WonenBijNieuwsPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  ALL_NIEUWS_SLUGS_QUERY,
  NIEUWS_BY_SLUG_QUERY,
  FOOTER_QUERY,
} from "@/sanity/lib/queries";
import { formatSanityDate, sanityImageUrl } from "@/sanity/lib/helpers";
import { wonenbijUrl } from "@/lib/siteConfig";
import { notFound } from "next/navigation";

// De enige slug die zonder CMS-artikel mag renderen (demo uit het Figma-frame).
const DEMO_SLUG = "start-bouw-taanschuurkade";

/** Eerste alinea van een Sanity-body als platte tekst, voor de description. */
function eersteAlinea(body: unknown): string | undefined {
  if (!Array.isArray(body)) return undefined;
  const eerste = body[0];
  const tekst =
    typeof eerste === "string"
      ? eerste
      : eerste?.children?.map((c: any) => c.text).join("") ?? "";
  return tekst ? tekst.slice(0, 160) : undefined;
}

export async function generateStaticParams() {
  const slugs =
    (await sanityFetch<string[]>({
      query: ALL_NIEUWS_SLUGS_QUERY,
      tags: ["nieuwsArtikel"],
    })) ?? [];
  return [...new Set([...slugs, "start-bouw-taanschuurkade"])].map((slug) => ({
    slug,
  }));
}

// Demo-artikel uit het Figma-frame "Nieuws" - fallback zonder CMS-content.
const demoArtikel: WonenBijNieuwsData = {
  titel: "Weverskade viert start bouw project Taanschuurkade.",
  datum: "30 januari, 2026",
  categorie: "Nieuws",
  image: "/images/wonenbij/nieuws-thumb.png",
  body: [
    "Weverskade viert de start van de bouw van Taanschuurkade: drie karaktervolle woongebouwen met veertig vrije sector huurappartementen aan De Kade in Maassluis. Met de eerste paal is de realisatie van het project officieel begonnen.",
    "De robuuste architectuur, geïnspireerd op de historische pakhuizen langs de haven, geeft het project een krachtig en tijdloos karakter. Met uitzicht op de Nieuwe Waterweg, duurzame technieken en hoogwaardige afwerking biedt Weverskade een eigentijdse woonomgeving.",
    "De komende periode wordt gewerkt aan de fundering en de ruwbouw. Geïnteresseerden kunnen zich via wonenbij.weverskade.com vrijblijvend inschrijven en worden persoonlijk geïnformeerd zodra de verhuur start.",
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artikel = await sanityFetch<any>({
    query: NIEUWS_BY_SLUG_QUERY,
    params: { slug },
    tags: ["nieuwsArtikel"],
  });
  if (!artikel && slug !== DEMO_SLUG) return {};
  return {
    title: `${artikel?.title ?? demoArtikel.titel} | Wonen bij Weverskade`,
    description: eersteAlinea(artikel?.body) ?? demoArtikel.body[0].slice(0, 160),
    alternates: { canonical: wonenbijUrl(`/nieuws/${slug}`) },
    openGraph: {
      images: [
        artikel?.heroImage
          ? sanityImageUrl(artikel.heroImage, demoArtikel.image ?? "")
          : demoArtikel.image ?? "",
      ],
    },
  };
}

export default async function WonenBijNieuws({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [artikel, footerData] = await Promise.all([
    sanityFetch<any>({
      query: NIEUWS_BY_SLUG_QUERY,
      params: { slug },
      tags: ["nieuwsArtikel"],
    }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  // Zonder CMS-artikel bestaat alleen de demo-slug; elke andere slug is een
  // echte 404 (voorheen rendde hier het demo-artikel met status 200).
  if (!artikel && slug !== DEMO_SLUG) notFound();

  const data: WonenBijNieuwsData = artikel
    ? {
        titel: artikel.title ?? demoArtikel.titel,
        datum: formatSanityDate(artikel.date, demoArtikel.datum),
        categorie: artikel.category ?? "Nieuws",
        image: sanityImageUrl(artikel.heroImage, demoArtikel.image ?? ""),
        body: Array.isArray(artikel.body)
          ? artikel.body.map((block: any) =>
              typeof block === "string"
                ? block
                : block.children?.map((c: any) => c.text).join("") ?? ""
            )
          : demoArtikel.body,
      }
    : demoArtikel;

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
      <WonenBijNieuwsPage data={data} />
      <FooterReveal>
        <Footer bg="bg-green" data={footerProps} mobielTot="lg" />
      </FooterReveal>
    </>
  );
}
