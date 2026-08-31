import { notFound, redirect } from "next/navigation";
import { getWonenBijProjectByAlias } from "@/data/wonenbij";
import WoningTypePage from "@/components/wonenbij/WoningTypePage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import { FOOTER_QUERY } from "@/sanity/lib/queries";
import { wonenbijUrl } from "@/lib/siteConfig";
import {
  getWonenBijProjectData,
  getWonenBijProjectSlugs,
} from "@/lib/wonenbijData";

export async function generateStaticParams() {
  const slugs = await getWonenBijProjectSlugs();
  const params: { slug: string; typeSlug: string }[] = [];
  for (const slug of slugs) {
    const project = await getWonenBijProjectData(slug);
    for (const type of project?.woningTypes ?? []) {
      params.push({ slug, typeSlug: type.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; typeSlug: string }>;
}) {
  const { slug, typeSlug } = await params;
  const project = await getWonenBijProjectData(slug);
  const type = project?.woningTypes.find((t) => t.slug === typeSlug);
  if (!project || !type) return { title: "Wonen bij Weverskade" };
  return {
    title: `${type.naam} - ${project.naam} | Wonen bij Weverskade`,
    description:
      type.omschrijving[0]?.tekst?.slice(0, 160) ??
      `${type.naam} in ${project.naam}: ca. ${type.oppervlakte} m² woonoppervlak, huur vanaf € ${type.prijsVan.toLocaleString("nl-NL")} per maand.`,
    alternates: {
      canonical: wonenbijUrl(`/${project.slug}/${type.slug}`),
    },
    openGraph: { images: [type.fotos[0] ?? project.heroImage] },
  };
}

export default async function WoningType({
  params,
}: {
  params: Promise<{ slug: string; typeSlug: string }>;
}) {
  // Bewust géén searchParams hier: die zouden de route per request dynamisch
  // maken ondanks generateStaticParams. ?woning= wordt client-side gelezen
  // in WoningTypePage.
  const [{ slug, typeSlug }, footerData] = await Promise.all([
    params,
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  // Alias-slug (bijv. de Sanity-gebouwslug) doorsturen naar dezelfde
  // typepagina onder de hoofdslug van het project.
  const aliasDoel = getWonenBijProjectByAlias(slug);
  if (aliasDoel) redirect(`/wonenbij/${aliasDoel.slug}/${typeSlug}`);

  const project = await getWonenBijProjectData(slug);
  const typeIndex =
    project?.woningTypes.findIndex((t) => t.slug === typeSlug) ?? -1;

  if (!project || typeIndex < 0) notFound();

  const type = project.woningTypes[typeIndex];
  const volgendeType =
    project.woningTypes.length > 1
      ? project.woningTypes[(typeIndex + 1) % project.woningTypes.length]
      : undefined;

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
      <WoningTypePage
        project={project}
        type={type}
        volgendeTypeSlug={volgendeType?.slug}
      />
      <FooterReveal>
        <Footer bg="bg-green" data={footerProps} />
      </FooterReveal>
    </>
  );
}
