"use client";

import Image from "next/image";
import WonenBijHeader from "@/components/wonenbij/WonenBijHeader";
import { usePageNavigation } from "@/hooks/usePageNavigation";

export interface WonenBijNieuwsData {
  titel: string;
  datum: string;
  categorie?: string;
  image?: string;
  body: string[];
  /** Waar "Terug naar overzicht" heen leidt (projectpagina of one-pager). */
  terugHref?: string;
}

/**
 * Nieuwsdetail binnen de wonen-bij omgeving - Figma "Nieuws"
 * (update 23 juli 2026).
 */
export default function WonenBijNieuwsPage({ data }: { data: WonenBijNieuwsData }) {
  const navigate = usePageNavigation();
  const terugHref = data.terugHref ?? "/wonenbij";

  return (
    <section className="bg-white min-h-screen">
      <div className="relative pt-[13.194vw] max-md:pt-[110px]">
        <WonenBijHeader
          variant="donker"
          ctaLabel="Terug naar overzicht"
          ctaHref={terugHref}
          ctaArrow
        />

        <div className="px-[2.431vw] max-md:px-5">
          <h1 className="mx-auto max-w-[90.139vw] text-center font-heading font-normal text-[4.931vw] leading-[5.278vw] tracking-[-0.099vw] text-off-black max-md:text-[30px] max-md:leading-[36px] max-md:tracking-[-0.6px]">
            {data.titel}
          </h1>

          {data.image ? (
            <div className="relative mx-auto mt-[3.611vw] w-[62.917vw] aspect-[906/513] overflow-hidden max-md:mt-8 max-md:w-full">
              <Image
                src={data.image}
                alt={data.titel}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 63vw"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="mx-auto mt-[3.194vw] grid w-[62.917vw] grid-cols-[16.111vw_1fr] gap-x-[1.389vw] max-md:mt-8 max-md:w-full max-md:grid-cols-1 max-md:gap-y-4">
            <div className="font-body font-medium text-[1.389vw] leading-normal text-off-black max-md:text-[14px]">
              <p>{data.categorie ?? "Nieuws"}</p>
              <p>{data.datum}</p>
            </div>
            <div className="max-w-[46.806vw] max-md:max-w-none">
              {data.body.map((alinea, i) => (
                <p
                  key={i}
                  className="font-body font-medium text-[1.597vw] leading-[2.153vw] text-off-black mb-[2.153vw] last:mb-0 max-md:text-[16px] max-md:leading-[23px] max-md:mb-5"
                >
                  {alinea}
                </p>
              ))}
              <a
                href={terugHref}
                onClick={(e) => navigate(e, terugHref)}
                className="mt-[4.167vw] inline-block font-body font-medium text-[0.972vw] leading-normal text-off-black border-b border-off-black pb-[0.2vw] no-underline hover:opacity-70 transition-opacity duration-200 max-md:mt-8 max-md:text-[13px]"
              >
                Terug naar het overzicht
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[8.681vw] max-md:h-16" />
    </section>
  );
}
