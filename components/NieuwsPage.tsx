"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CTASection from "@/components/CTASection";
import { usePageNavigation } from "@/hooks/usePageNavigation";

const defaultNewsItems = [
  { id: 1, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-1" },
  { id: 2, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-2" },
  { id: 3, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-3" },
  { id: 4, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-4" },
  { id: 5, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-5" },
  { id: 6, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-6" },
  { id: 7, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-7" },
  { id: 8, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-8" },
  { id: 9, date: "30 januari 2026", title: "En dan de titel van het nieuwsbericht", image: "/images/news-placeholder.webp", slug: "titel-van-het-nieuwsbericht-9" },
];

interface NieuwsPageData {
  heroTitle?: string;
  articles?: { id: number; date: string; title: string; image: string; slug: string }[];
}

export default function NieuwsPage({ data }: { data?: NieuwsPageData } = {}) {
  const newsItems = data?.articles ?? defaultNewsItems;
  const [animate, setAnimate] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const navigate = usePageNavigation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimate(true);
      return;
    }

    if (window.__pageTransitioning) {
      const timer = setTimeout(() => setAnimate(true), 550);
      return () => clearTimeout(timer);
    }

    let rafOuter = 0;
    let rafInner = 0;
    rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
    };
  }, []);

  // Cards stagger: first card appears first, clip-path reveal like the Over Ons image
  const cardStagger = 0.07;
  const cardBaseDelay = 0.05; // start together with title for a connected feel

  return (
    <section className="bg-off-white min-h-screen">
      {/* Hero title — mask-slide reveal identical to HeroOverOns */}
      <div className="pt-[13.194vw] px-[2.431vw] pb-[2.778vw] max-md:pt-[28vw] max-md:px-5 max-md:pb-6">
        <div className="overflow-hidden">
          <h1
            className="font-heading font-normal text-[5.556vw] leading-[1.05] tracking-[-0.111vw] text-off-black max-md:text-[40px] max-md:leading-[42px] max-md:tracking-[-0.8px] will-change-transform"
            style={{
              transform: animate ? "translateY(0)" : "translateY(110%)",
              transition: animate
                ? "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s"
                : "none",
            }}
          >
            {data?.heroTitle ?? "Nieuws"}
          </h1>
        </div>
      </div>

      {/* News grid */}
      <div className="px-[2.431vw] max-md:px-5">
        <div className="grid grid-cols-3 gap-x-[1.389vw] max-md:grid-cols-2 max-md:gap-x-5">
          {newsItems.map((item, index) => {
            // First card first, stagger forward
            const delay = cardBaseDelay + index * cardStagger;

            return (
              <div key={item.id} className="mb-[3.333vw] max-md:mb-6">
                {/* Clip-path reveal — same as Over Ons hero image */}
                <div
                  className="will-change-[clip-path]"
                  style={{
                    clipPath: animate ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
                    transition: animate
                      ? `clip-path 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
                      : "none",
                  }}
                >
                {/* Card image with hover overlay */}
                <a
                  href={`/nieuws/${item.slug}`}
                  onClick={(e) => navigate(e, `/nieuws/${item.slug}`)}
                  className="block relative w-full aspect-[443/479] overflow-hidden cursor-pointer max-md:aspect-[1/1.1]"
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 30vw"
                    className="object-cover will-change-transform"
                    style={{
                      transform: hoveredCard === item.id
                        ? "scale(1.05)"
                        : animate
                          ? "scale(1)"
                          : "scale(1.2)",
                      transition: animate
                        ? `transform ${hoveredCard === item.id ? "0.7s" : "1.6s"} cubic-bezier(0.16, 1, 0.3, 1) ${hoveredCard === item.id ? "0s" : `${delay}s`}`
                        : "none",
                    }}
                  />
                  {/* Hover overlay */}
                  <div
                    className={`absolute inset-0 bg-off-black transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      hoveredCard === item.id ? "opacity-57" : "opacity-0"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      hoveredCard === item.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {/* Top-right arrow */}
                    <svg
                      width="43"
                      height="23"
                      viewBox="0 0 43 23"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute top-[1.389vw] right-[1.389vw] w-[2.986vw] h-[1.597vw] max-md:top-3 max-md:right-3 max-md:w-[24px] max-md:h-[13px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{
                        transform: hoveredCard === item.id
                          ? "translate(0, 0) rotate(0deg)"
                          : "translate(-2vw, 2vw) rotate(-8deg)",
                      }}
                    >
                      <path d="M0 0V7.63965H26.3593L43 23V15.3401L26.3593 0H0Z" fill="#F7F5F0" />
                    </svg>
                    {/* Bottom-left arrow */}
                    <svg
                      width="42"
                      height="23"
                      viewBox="0 0 42 23"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute bottom-[1.389vw] left-[1.389vw] w-[2.917vw] h-[1.597vw] max-md:bottom-3 max-md:left-3 max-md:w-[24px] max-md:h-[13px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{
                        transform: hoveredCard === item.id
                          ? "rotate(180deg) translate(0, 0)"
                          : "rotate(180deg) translate(-2vw, 2vw) rotate(-8deg)",
                      }}
                    >
                      <path d="M0 0V7.63965H25.7462L42 23V15.3401L25.7462 0H0Z" fill="#F7F5F0" />
                    </svg>
                    <span className="font-body font-medium text-[1.944vw] text-off-white underline decoration-solid max-md:text-[14px]">
                      Bekijk nieuwsbericht
                    </span>
                  </div>
                </a>
                {/* Card text */}
                <div className="mt-[0.486vw] max-md:mt-2">
                  <p className="font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[15px] max-md:leading-normal">
                    {item.date}
                  </p>
                  <p className="font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[15px] max-md:leading-normal">
                    {item.title}
                  </p>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="px-[2.431vw] mt-[8.125vw] pb-[16.875vw] max-md:px-5 max-md:mt-16 max-md:pb-16">
        <CTASection
          label="Neem contact op"
          linkText="Naar de contactpagina"
          linkHref="/contact"
          labelClassName="pl-[8.333vw] max-md:pl-0"
          headingClassName="font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-black max-w-[62.569vw] mb-[2.778vw] max-md:text-[28px] max-md:leading-[32px] max-md:max-w-none max-md:mb-6"
        >
          Heeft u een vraag over een specifiek project of wilt u meer
          informatie over onze werkzaamheden? Stuur een email naar{" "}
          <a
            href="mailto:info@weverskade.com"
            className="text-off-black underline decoration-solid"
          >
            info@weverskade.com
          </a>{" "}
          of klik op onderstaande link.
        </CTASection>
      </div>
    </section>
  );
}
