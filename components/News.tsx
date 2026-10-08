"use client";

import Image from "next/image";
import { usePortfolioSlider } from "@/hooks/usePortfolioSlider";
import { formatSanityDate } from "@/sanity/lib/helpers";

const defaultArticles = [
  {
    date: "22 januari 2026",
    title: "Hier een header van het bericht in max twee zinnen",
    image: "/images/news-placeholder.webp",
    slug: "",
  },
  {
    date: "22 januari 2026",
    title: "Hier een header van het bericht in max twee zinnen",
    image: "/images/news-placeholder.webp",
    slug: "",
  },
  {
    date: "22 januari 2026",
    title: "Hier een header van het bericht in max twee zinnen",
    image: "/images/news-placeholder.webp",
    slug: "",
  },
];

interface NewsData {
  label?: string;
  heading?: string;
  articles?: { date: string; title: string; image: string; slug?: string }[];
}

export default function News({ data }: { data?: NewsData } = {}) {
  const articles = data?.articles?.map((a) => ({
    ...a,
    date: formatSanityDate(a.date, a.date),
  })) ?? defaultArticles;
  const { currentPage, totalPages, trackRef, nextPage } =
    usePortfolioSlider(articles.length);

  return (
    <section className="bg-off-white pt-[8.333vw] pb-[14.236vw] pl-[2.639vw] pr-[2.431vw] max-md:pt-12 max-md:pb-16 max-md:px-5">
      {/* Header row — desktop */}
      <div className="flex items-baseline max-md:hidden">
        <span className="shrink-0 w-[31.944vw] font-body font-medium text-[1.389vw] leading-[1.2] text-off-black">
          {data?.label ?? "Nieuws"}
        </span>
        <span className="flex-1 font-body font-medium text-[1.389vw] leading-[1.2] text-off-black">
          {data?.heading ?? "Van Weverskade"}
        </span>
        <a
          href="/nieuws"
          className="link-underline shrink-0 font-body font-medium text-[1.389vw] leading-[1.2] text-off-black pb-[0.556vw]"
            style={{ "--underline-h": "0.069vw" } as React.CSSProperties}
        >
          Naar onze nieuwspagina
        </a>
      </div>

      {/* Header — mobile */}
      <p className="hidden max-md:block font-body font-medium text-[17px] leading-normal text-off-black">
        {data?.label ?? "Nieuws"}
      </p>

      {/* Header divider */}
      <div className="border-t-[0.069vw] border-off-black mt-[2.153vw] max-md:hidden" />

      {/* News articles — desktop */}
      <div className="max-md:hidden">
        {articles.map((article, i) => (
          <div key={i}>
            <div className="flex items-start pt-[1.875vw] pb-[3.403vw]">
              {/* Date column */}
              <p className="shrink-0 w-[31.944vw] font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black pt-[0.347vw]">
                {article.date}
              </p>

              {/* Content column */}
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-medium text-[2.111vw] leading-[2.167vw] text-off-black max-w-[32.778vw] line-clamp-3">
                  {article.title}
                </h3>
                <a
                  href={article.slug ? `/nieuws/${article.slug}` : "/nieuws"}
                  className="link-underline mt-[1.944vw] font-body font-medium text-[0.972vw] leading-normal text-off-black pb-[0.417vw]"
                  style={{ "--underline-h": "0.069vw" } as React.CSSProperties}
                >
                  Lees bericht
                </a>
              </div>

              {/* Image column */}
              <div className="shrink-0 w-[16.458vw] h-[10.625vw] ml-[1.389vw] overflow-hidden">
                <Image
                  src={article.image}
                  alt=""
                  width={1373}
                  height={800}
                  sizes="16.458vw"
                  quality={100}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-[0.069vw] border-off-black" />
          </div>
        ))}
      </div>

      {/* News articles — mobile slider */}
      <div className="hidden max-md:block mt-6">
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="grid grid-cols-[repeat(3,calc(100vw-40px))] gap-5 transition-transform duration-600 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          >
            {articles.map((article, i) => (
              <a key={i} data-card href={article.slug ? `/nieuws/${article.slug}` : "/nieuws"}>
                <div className="w-full aspect-[362/318] overflow-hidden">
                  <Image
                    src={article.image}
                    alt=""
                    width={1373}
                    height={800}
                    sizes="calc(100vw - 40px)"
                    quality={100}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <p className="font-body font-medium text-[20px] leading-normal text-off-black mt-3 max-w-[241px]">
                  {article.title}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Mobile pagination */}
        <div className="flex justify-between items-center pt-4">
          <span className="font-body font-medium text-[20px] leading-normal text-off-black">
            Pagina {currentPage + 1} /{totalPages}
          </span>
          <button
            className="w-[49px] h-[15px] text-off-black cursor-pointer transition-opacity duration-200 ease-in-out hover:opacity-60"
            aria-label="Volgende artikel"
            onClick={nextPage}
          >
            <svg
              viewBox="0 0 49 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <line
                x1="0"
                y1="7.5"
                x2="46"
                y2="7.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <polyline
                points="39,1 47,7.5 39,14"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
