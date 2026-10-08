import { notFound } from "next/navigation";
import NieuwsDetailPage from "@/components/NieuwsDetailPage";
import Footer from "@/components/Footer";
import FooterReveal from "@/components/FooterReveal";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  NIEUWS_BY_SLUG_QUERY,
  ALL_NIEUWS_SLUGS_QUERY,
  FOOTER_QUERY,
} from "@/sanity/lib/queries";
import { sanityImageUrl, formatSanityDate } from "@/sanity/lib/helpers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>({
    query: ALL_NIEUWS_SLUGS_QUERY,
    tags: ["nieuwsArtikel"],
  });
  // Include fallback slugs for when Sanity has no data
  const fallbackSlugs = Array.from({ length: 9 }, (_, i) => `titel-van-het-nieuwsbericht-${i + 1}`);
  const allSlugs = [...new Set([...(slugs ?? []), ...fallbackSlugs])];
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await sanityFetch<any>({
    query: NIEUWS_BY_SLUG_QUERY,
    params: { slug },
    tags: ["nieuwsArtikel"],
  });

  return {
    title: `${article?.title ?? "Nieuwsbericht"} | Weverskade`,
    description: article?.excerpt ?? "Lees het laatste nieuws van Weverskade.",
  };
}

export default async function NieuwsDetail({ params }: PageProps) {
  const { slug } = await params;
  const [article, footerData] = await Promise.all([
    sanityFetch<any>({
      query: NIEUWS_BY_SLUG_QUERY,
      params: { slug },
      tags: ["nieuwsArtikel"],
    }),
    sanityFetch<any>({ query: FOOTER_QUERY, tags: ["footer"] }),
  ]);

  const articleData = article
    ? {
        title: article.title,
        date: formatSanityDate(article.date, "30 januari 2026"),
        category: article.category,
        heroImage: sanityImageUrl(article.heroImage, "/images/news-placeholder.webp"),
        body: article.body,
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
        <NieuwsDetailPage data={articleData} />
      </div>
      <div data-nav-theme="green">
        <FooterReveal>
          <Footer bg="bg-green" data={footerProps} />
      </FooterReveal>
      </div>
    </>
  );
}
