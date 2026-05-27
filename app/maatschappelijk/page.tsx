import SociaalPage from "@/components/SociaalPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  MAATSCHAPPELIJK_PAGE_QUERY,
  FOOTER_QUERY,
} from "@/sanity/lib/queries";
import { sanityImageUrl } from "@/sanity/lib/helpers";

export const metadata = {
  title: "Sociaal en maatschappelijk | Weverskade",
  description:
    "Bij Weverskade geloven we dat vastgoed alleen waarde heeft als het bijdraagt aan een leefomgeving die klopt.",
};

export default async function Maatschappelijk() {
  const [pageData, footerData] = await Promise.all([
    sanityFetch<any>({ query: MAATSCHAPPELIJK_PAGE_QUERY, tags: ["maatschappelijkPage"] }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  const sociaalData = pageData
    ? {
        heroImage: sanityImageUrl(pageData.heroImage, "/images/sociaal-hero.webp"),
        statementHeading: pageData.statementHeading,
        approachLabel: pageData.approachLabel,
        approachItems: pageData.approachItems,
        impactBlocks: pageData.impactBlocks?.map((block: any) => ({
          ...block,
          image: block.image ? sanityImageUrl(block.image, "") : undefined,
        })),
        teamImage: pageData.teamImage
          ? sanityImageUrl(pageData.teamImage, "")
          : undefined,
        cta: pageData.cta,
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
      <SociaalPage data={sociaalData} />

      <div data-nav-theme="dark">
        <FooterReveal>
          <Footer bg="bg-off-black" data={footerProps} />
        </FooterReveal>
      </div>
    </>
  );
}
