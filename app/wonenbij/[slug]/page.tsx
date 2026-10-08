import { notFound, redirect } from "next/navigation";
import { getWonenBijProjectByAlias, voorpremiere } from "@/data/wonenbij";
import { type NieuwsKaart } from "@/data/wonenbij";
import WonenBijProjectPage, {
  type SocialLinks,
} from "@/components/wonenbij/WonenBijProjectPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  FOOTER_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";
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

  const [project, footerData, settings] = await Promise.all([
    getWonenBijProjectData(slug),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
    sanityFetch<{
      linkedIn?: string;
      instagram?: string;
      facebook?: string;
    } | null>({ query: SITE_SETTINGS_QUERY, tags: ["siteSettings"] }),
  ]);

  // Social-kanalen uit de site-instellingen (Instellingen > Algemeen); geen
  // code-fallback, zodat de redactie een kanaal weghaalt door het veld leeg
  // te maken (comment 38: LinkedIn is mogelijk te zakelijk). Zonder enige
  // URL verdwijnt de hele regel. De hoofdsite leest deze velden niet.
  const socials: SocialLinks = {
    linkedIn: settings?.linkedIn ?? undefined,
    instagram: settings?.instagram ?? undefined,
    facebook: settings?.facebook ?? undefined,
  };

  if (!project) notFound();

  // Nieuws en updates: uitsluitend de berichten die de redactie in Sanity
  // aan dit project koppelt (tab "Wonen bij pagina", veld "Nieuwsberichten op
  // deze pagina"). Geen automatische koppeling op titel meer: die was
  // foutgevoelig (Robin, 01-10-2026). Niets gekozen = sectie en menu-item weg.
  const nieuws: NieuwsKaart[] = project.nieuws ?? [];

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
      <WonenBijProjectPage
        project={project}
        nieuws={nieuws}
        socials={socials}
        voorpremiere={voorpremiere(project.verhuurStart)}
      />
      {/* Nav-thema voor de wonen-bij kop: groen zodra de footer bovenin komt */}
      <div data-nav-theme="green">
        <FooterReveal>
          <Footer bg="bg-green" data={footerProps} mobielTot="lg" privacyHref="/wonenbij/privacybeleid" wonenBij />
        </FooterReveal>
      </div>
    </>
  );
}
