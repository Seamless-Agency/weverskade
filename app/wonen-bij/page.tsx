import WonenBijPage from "@/components/WonenBijPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  WONEN_BIJ_PAGE_QUERY,
  WONEN_PROJECTS_QUERY,
  FOOTER_QUERY,
} from "@/sanity/lib/queries";
import { sanityImageUrl } from "@/sanity/lib/helpers";

export const metadata = {
  title: "Wonen bij | Weverskade",
  description:
    "Onze woningprojecten zijn plekken waar mensen zich thuis kunnen voelen. Een overzicht van woningen in ontwikkeling en in eigendom.",
};

export default async function WonenBij() {
  const [pageData, projectsData, footerData] = await Promise.all([
    sanityFetch<any>({ query: WONEN_BIJ_PAGE_QUERY, tags: ["wonenBijPage"] }),
    sanityFetch<any[]>({ query: WONEN_PROJECTS_QUERY, tags: ["project"] }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  const wonenData =
    pageData || projectsData?.length > 0
      ? {
          heroLabel: pageData?.heroLabel,
          heroTitle: pageData?.heroTitle,
          introLabel: pageData?.introLabel,
          introText: pageData?.introText,
          ctaLabel: pageData?.ctaLabel,
          ctaHeading: pageData?.ctaHeading,
          ctaLinkText: pageData?.ctaLinkText,
          ctaLinkUrl: pageData?.ctaLinkUrl,
          projects: projectsData?.map((p: any, i: number) => ({
            id: i + 1,
            slug: p.slug?.current ?? p.slug ?? "",
            name: p.name,
            tagline: p.tagline ?? "",
            type: p.wonenBeschikbaar ? "Beschikbaar" : "In ontwikkeling",
            location: p.location ?? "",
            image: sanityImageUrl(p.portfolioImage, "/images/portfolio-card-1.webp"),
          })),
        }
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
      <div data-nav-theme="light">
        <WonenBijPage data={wonenData} />
      </div>
      <div data-nav-theme="green">
        <FooterReveal>
          <Footer bg="bg-green" data={footerProps} />
      </FooterReveal>
      </div>
    </>
  );
}
