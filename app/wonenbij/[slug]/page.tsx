import { notFound, redirect } from "next/navigation";
import { getWonenBijProjectByAlias } from "@/data/wonenbij";
import { type NieuwsKaart } from "@/data/wonenbij";
import WonenBijProjectPage, {
  type SocialLinks,
} from "@/components/wonenbij/WonenBijProjectPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  ALL_NIEUWS_QUERY,
  FOOTER_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
import { formatSanityDate, sanityImageUrl } from "@/sanity/lib/helpers";
import { wonenbijUrl } from "@/lib/siteConfig";
import {
  getWonenBijProjectData,
  getWonenBijProjectSlugs,
} from "@/lib/wonenbijData";

export async function generateStaticParams() {
  const slugs = await getWonenBijProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getWonenBijProjectData(slug);
  if (!project) return { title: "Wonen bij Weverskade" };
  return {
    title: `${project.naam} | Wonen bij Weverskade`,
    description:
      project.intro?.replace(/\s+/g, " ").slice(0, 160) ??
      `${project.naam}: wonen bij Weverskade in ${project.plaats}.`,
    alternates: { canonical: wonenbijUrl(`/${project.slug}`) },
    openGraph: { images: [project.heroImage] },
  };
}

const demoNieuws: NieuwsKaart[] = [
  {
    slug: "start-bouw-taanschuurkade",
    titel: "Weverskade viert start bouw project Taanschuurkade",
    datum: "22 januari 2026",
    image: "/images/wonenbij/nieuws-thumb.png",
  },
];

export default async function WonenBijProject({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Alias (bijv. de Sanity-gebouwslug) doorsturen naar de hoofdpagina van
  // het project, zodat er maar één Taanschuurkade-pagina bestaat.
  const aliasDoel = getWonenBijProjectByAlias(slug);
  if (aliasDoel) redirect(`/wonenbij/${aliasDoel.slug}`);

  const [project, nieuwsData, footerData, settings] = await Promise.all([
    getWonenBijProjectData(slug),
    sanityFetch<any[]>({ query: ALL_NIEUWS_QUERY, tags: ["nieuwsArtikel"] }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
    sanityFetch<{
      linkedIn?: string;
      instagram?: string;
      facebook?: string;
    } | null>({ query: SITE_SETTINGS_QUERY, tags: ["siteSettings"] }),
  ]);

  // Social-kanalen uit de site-instellingen; LinkedIn heeft dezelfde
  // fallback als de footer zodat de verwijzing nooit leeg is.
  const socials: SocialLinks = {
    linkedIn:
      settings?.linkedIn ?? "https://www.linkedin.com/company/weverskade",
    instagram: settings?.instagram ?? undefined,
    facebook: settings?.facebook ?? undefined,
  };

  if (!project) notFound();

  // Nieuws (comment 38: geen zakelijk Weverskade-nieuws op een woonpagina).
  // Voorrang: door de redactie gekozen berichten (CMS-veld) > berichten die
  // het project in de titel noemen > niets (de sectie verdwijnt dan). Alleen
  // zonder Sanity-verbinding blijft de demo staan.
  const naamWoorden = project.naam
    .toLowerCase()
    .split(/[^a-z0-9à-ÿ]+/)
    .filter((w) => w.length >= 5);
  // "Taanschuur appartementen" hoort bij "Taanschuurkade": een titelwoord en
  // een naamwoord tellen als match zodra de één met de ander begint.
  const naamMatch = (titel: string) =>
    titel
      .toLowerCase()
      .split(/[^a-z0-9à-ÿ]+/)
      .some(
        (t) =>
          t.length >= 5 &&
          naamWoorden.some((n) => t.startsWith(n) || n.startsWith(t))
      );

  let nieuws: NieuwsKaart[];
  if (project.nieuws?.length) {
    nieuws = project.nieuws;
  } else if (nieuwsData) {
    nieuws = nieuwsData
      .filter((artikel: any) => naamMatch(artikel.title ?? ""))
      .slice(0, 3)
      .map((artikel: any) => ({
        slug: artikel.slug?.current ?? artikel.slug ?? "",
        titel: artikel.title ?? "",
        datum: formatSanityDate(artikel.date, ""),
        image: sanityImageUrl(
          artikel.heroImage,
          "/images/wonenbij/nieuws-thumb.png"
        ),
      }));
  } else {
    nieuws = demoNieuws;
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
      <WonenBijProjectPage project={project} nieuws={nieuws} socials={socials} />
      {/* Nav-thema voor de wonen-bij kop: groen zodra de footer bovenin komt */}
      <div data-nav-theme="green">
        <FooterReveal>
          <Footer bg="bg-green" data={footerProps} mobielTot="lg" />
        </FooterReveal>
      </div>
    </>
  );
}
