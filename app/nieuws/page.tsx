import NieuwsPage from "@/components/NieuwsPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import { ALL_NIEUWS_QUERY, FOOTER_QUERY } from "@/sanity/lib/queries";
import { sanityImageUrl, formatSanityDate } from "@/sanity/lib/helpers";

export const metadata = {
  title: "Nieuws | Weverskade",
  description:
    "Het laatste nieuws van Weverskade over vastgoedontwikkeling en beheer.",
};

export default async function Nieuws() {
  const [newsData, footerData] = await Promise.all([
    sanityFetch<any[]>({ query: ALL_NIEUWS_QUERY, tags: ["nieuwsArtikel"] }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  const nieuwsData =
    newsData?.length > 0
      ? {
          articles: newsData.map((a: any, i: number) => ({
            id: i + 1,
            date: formatSanityDate(a.date, "30 januari 2026"),
            title: a.title,
            image: sanityImageUrl(a.heroImage, "/images/news-placeholder.webp"),
            slug: a.slug?.current ?? "",
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
        <NieuwsPage data={nieuwsData} />
      </div>
      <div data-nav-theme="brown">
        <FooterReveal>
          <Footer bg="bg-brown" data={footerProps} />
        </FooterReveal>
      </div>
    </>
  );
}
