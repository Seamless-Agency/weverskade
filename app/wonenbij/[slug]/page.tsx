import { notFound, redirect } from "next/navigation";
import { getWonenBijProjectByAlias } from "@/data/wonenbij";
import WonenBijProjectPage, {
  type NieuwsKaart,
} from "@/components/wonenbij/WonenBijProjectPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import { ALL_NIEUWS_QUERY, FOOTER_QUERY } from "@/sanity/lib/queries";
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
      project.intro?.slice(0, 160) ??
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

  const [project, nieuwsData, footerData] = await Promise.all([
    getWonenBijProjectData(slug),
    sanityFetch<any[]>({ query: ALL_NIEUWS_QUERY, tags: ["nieuwsArtikel"] }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  if (!project) notFound();

  // Artikelen die het project bij naam noemen eerst (er is geen formele
  // project-koppeling in het nieuws-schema, dus we matchen op de titel);
  // de rest vult aan tot drie kaarten.
  const naamMatch = (titel: string) =>
    titel.toLowerCase().includes(project.naam.toLowerCase());
  const gesorteerd = nieuwsData?.length
    ? [...nieuwsData].sort(
        (a, b) =>
          Number(naamMatch(b.title ?? "")) - Number(naamMatch(a.title ?? ""))
      )
    : nieuwsData;

  const nieuws: NieuwsKaart[] = gesorteerd?.length
    ? gesorteerd.slice(0, 3).map((artikel: any) => ({
        slug: artikel.slug?.current ?? artikel.slug ?? "",
        titel: artikel.title ?? "",
        datum: formatSanityDate(artikel.date, ""),
        image: sanityImageUrl(
          artikel.heroImage,
          "/images/wonenbij/nieuws-thumb.png"
        ),
      }))
    : demoNieuws;

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
      <WonenBijProjectPage project={project} nieuws={nieuws} />
      {/* Nav-thema voor de wonen-bij kop: groen zodra de footer bovenin komt */}
      <div data-nav-theme="green">
        <FooterReveal>
          <Footer bg="bg-green" data={footerProps} mobielTot="lg" />
        </FooterReveal>
      </div>
    </>
  );
}
