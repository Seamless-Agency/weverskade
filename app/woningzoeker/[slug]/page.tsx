import { notFound } from "next/navigation";
import WoningZoeker from "@/components/woningzoeker/WoningZoeker";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  WONINGZOEKER_BY_SLUG_QUERY,
  WONINGZOEKER_SLUGS_QUERY,
  FOOTER_QUERY,
} from "@/sanity/lib/queries";
import {
  type ProjectFase,
  type Woning,
  type WoningStatus,
  type WoningzoekerProject,
} from "@/data/woningzoeker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface FooterData {
  companyName?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  links?: { label: string; url: string }[];
}

interface SanityWoningzoeker {
  name?: string;
  slug?: string;
  tagline?: string;
  projectFase?: string;
  woningzoekerIntro?: string;
  render?: string;
  renderDimensions?: { width?: number; height?: number };
  woningen?: Array<{
    _key: string;
    nummer?: string;
    woningType?: string;
    status?: string;
    verdieping?: number;
    oppervlakte?: number;
    slaapkamers?: number;
    huurprijs?: number;
    orientatie?: string;
    buitenruimte?: string;
    plattegrond?: string;
    polygon?: Array<{ x?: number; y?: number }>;
  }>;
}

const FASES: ProjectFase[] = ["binnenkort", "inschrijving", "in-verhuur"];
const STATUSSEN: WoningStatus[] = ["beschikbaar", "in-optie", "bezet"];

/**
 * Zet het Sanity-antwoord om naar het viewer-model. Woningen zonder geldige
 * polygoon vallen af: zonder overgetrokken vlak valt er niets te tonen op de
 * render, en een half getekende woning mag de kiezer niet breken.
 */
function fromSanity(doc: SanityWoningzoeker, slug: string): WoningzoekerProject | null {
  if (!doc?.render) return null;

  const woningen: Woning[] = (doc.woningen ?? [])
    .map((item): Woning | null => {
      const polygon = (item.polygon ?? []).filter(
        (p): p is { x: number; y: number } =>
          typeof p?.x === "number" && typeof p?.y === "number"
      );
      if (polygon.length < 3) return null;

      const status = STATUSSEN.includes(item.status as WoningStatus)
        ? (item.status as WoningStatus)
        : "beschikbaar";

      return {
        id: item._key,
        nummer: item.nummer ?? item._key,
        woningType: item.woningType ?? "",
        status,
        verdieping: item.verdieping ?? 0,
        oppervlakte: item.oppervlakte ?? 0,
        slaapkamers: item.slaapkamers ?? 0,
        huurprijs: item.huurprijs ?? 0,
        orientatie: item.orientatie,
        buitenruimte: item.buitenruimte,
        plattegrond: item.plattegrond,
        polygon,
      };
    })
    .filter((w): w is Woning => w !== null);

  if (woningen.length === 0) return null;

  return {
    slug: doc.slug ?? slug,
    name: doc.name ?? slug,
    tagline: doc.tagline,
    fase: FASES.includes(doc.projectFase as ProjectFase)
      ? (doc.projectFase as ProjectFase)
      : "binnenkort",
    intro: doc.woningzoekerIntro,
    render: doc.render,
    renderAlt: `Render van ${doc.name ?? slug}`,
    renderWidth: doc.renderDimensions?.width ?? 1600,
    renderHeight: doc.renderDimensions?.height ?? 1200,
    woningen,
  };
}

async function getProject(slug: string): Promise<WoningzoekerProject | null> {
  const doc = await sanityFetch<SanityWoningzoeker | null>({
    query: WONINGZOEKER_BY_SLUG_QUERY,
    params: { slug },
    tags: ["project"],
  });

  // Uitsluitend Sanity. De demodata (data/woningzoeker.ts) is de proof of
  // concept met fictieve nummers en prijzen; die stond hier als fallback en
  // serveerde daardoor verzonnen woningen ónder een echte projectnaam
  // (/woningzoeker/taanschuurkade toonde 15 fictieve woningen van €1.495-2.290
  // terwijl /wonenbij/taanschuurkade de 40 echte woningen toont). De echte
  // woningzoeker leeft in de wonen-bij omgeving; deze route wordt vanzelf weer
  // actief zodra er een woningzoeker-project in het CMS staat.
  return doc ? fromSanity(doc, slug) : null;
}

export async function generateStaticParams() {
  const sanitySlugs = await sanityFetch<string[]>({
    query: WONINGZOEKER_SLUGS_QUERY,
    tags: ["project"],
  });
  return (sanitySlugs ?? []).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const beschikbaar = project.woningen.filter(
    (w) => w.status === "beschikbaar"
  ).length;

  return {
    title: `Woningen ${project.name} | Weverskade`,
    description: `${beschikbaar} beschikbare woningen in ${project.name}. Bekijk plattegronden, oppervlakte en huurprijs.`,
  };
}

export default async function WoningzoekerRoute({ params }: PageProps) {
  const { slug } = await params;
  const [project, footerData] = await Promise.all([
    getProject(slug),
    sanityFetch<FooterData | null>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  if (!project) notFound();

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
      <div data-nav-theme="light">
        <section className="bg-off-white pt-[18.889vw] max-md:pt-[24vw]">
          <div className="px-[2.431vw] max-md:px-5">
            <a
              href="/wonen-bij"
              className="link-underline pb-[0.347vw] font-body text-[1.389vw] font-medium leading-normal text-off-black max-md:pb-1 max-md:text-[14px]"
            >
              Terug naar Wonen bij
            </a>
            <div className="mt-[3.889vw] grid grid-cols-2 gap-x-[2.431vw] max-md:mt-4 max-md:grid-cols-1 max-md:gap-y-2">
              <h1 className="font-body text-[4.931vw] font-medium leading-[1.1] tracking-[-0.099vw] text-off-black max-md:text-[36px] max-md:tracking-[-0.72px]">
                {project.name}
              </h1>
              {project.tagline ? (
                <p className="font-heading text-[4.931vw] font-normal leading-[1.1] tracking-[-0.099vw] text-off-black max-md:text-[36px] max-md:tracking-[-0.72px]">
                  {project.tagline}
                </p>
              ) : null}
            </div>
          </div>

          <WoningZoeker project={project} />
        </section>
      </div>
      <div data-nav-theme="green">
        <FooterReveal>
          <Footer bg="bg-green" data={footerProps} />
        </FooterReveal>
      </div>
    </>
  );
}
