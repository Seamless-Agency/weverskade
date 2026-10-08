import PrivacyPage from "@/components/PrivacyPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import WonenBijHeader from "@/components/wonenbij/WonenBijHeader";
import { sanityFetch } from "@/sanity/lib/fetch";
import { FOOTER_QUERY } from "@/sanity/lib/queries";
import { wonenbijUrl } from "@/lib/siteConfig";

/**
 * Privacybeleid binnen de wonen-bij omgeving: dezelfde tekst als de
 * hoofdsite (components/PrivacyPage, één bron), maar met de wonen-bij kop en
 * footer. Op het subdomein is dit wonenbij.weverskade.com/privacybeleid.
 */
export const metadata = {
  title: "Privacybeleid | Wonen bij Weverskade",
  description:
    "Privacybeleid van Weverskade B.V.: hoe wij omgaan met je persoonsgegevens conform de AVG.",
  alternates: { canonical: wonenbijUrl("/privacybeleid") },
};

export default async function WonenBijPrivacybeleid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerData = await sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] });
  // Zelfde mapping als de andere wonen-bij routes.
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
        <WonenBijHeader
          variant="donker"
          ctaLabel="Terug naar overzicht"
          ctaHref="/wonenbij"
          ctaArrow
        />
        <PrivacyPage />
      </div>
      <div data-nav-theme="green">
        <FooterReveal>
          <Footer
            bg="bg-green"
            data={footerProps}
            mobielTot="lg"
            privacyHref="/wonenbij/privacybeleid"
            wonenBij
          />
        </FooterReveal>
      </div>
    </>
  );
}
