"use client";

import Image from "next/image";
import HeroOverOns from "@/components/HeroOverOns";
import ScrollHeroLineSplit from "@/components/ScrollHeroLineSplit";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { vacatures as defaultVacatures } from "@/data/vacatures";

interface WerkenBijVacature {
  slug: string;
  title: string;
  shortDescription: string;
}

interface WerkenBijPageData {
  heroTitle?: string;
  heroImage?: string;
  statementText?: string;
  aboutImage?: string;
  aboutLabel?: string;
  aboutText?: string;
  ctaLabel?: string;
  ctaHeading?: string;
  ctaLinkText?: string;
  contactEmail?: string;
  vacatures?: WerkenBijVacature[];
}

export default function WerkenBijPage({
  data,
}: { data?: WerkenBijPageData } = {}) {
  const vacatures = data?.vacatures ?? defaultVacatures;
  const navigate = usePageNavigation();
  const contactEmail = data?.contactEmail ?? "info@weverskade.com";

  const aboutText =
    data?.aboutText ??
    "Vanuit een brede vastgoedportefeuille werken we aan uiteenlopende projecten op het gebied van wonen, ontwikkelen, beleggen en beheer. Daarbij staan kwaliteit, samenwerking en aandacht voor mens en omgeving centraal.\n\nWe geloven in een open en betrokken werkomgeving waarin ruimte is voor eigen initiatief, ontwikkeling en samenwerking. Of je nu werkt aan een nieuw woonproject, het beheer van een gebouw of de verdere groei van onze organisatie: bij Weverskade draag je direct bij aan plekken waar mensen wonen, werken en zich thuis voelen.";
  const aboutParagraphs = aboutText.split("\n\n");

  return (
    <>
      {/* ═══ HERO ═══ */}
      <div data-nav-theme="light">
        <HeroOverOns
          title={data?.heroTitle ?? "Werken bij"}
          image={data?.heroImage ?? "/images/werken-bij-hero.webp"}
        />
      </div>

      {/* ═══ STATEMENT + ABOUT — off-white ═══ */}
      <div data-nav-theme="light">
        <section className="bg-off-white px-[2.639vw] pb-[11.667vw] max-md:px-0 max-md:pb-12">
          <ScrollHeroLineSplit
            text={
              data?.statementText ??
              "Werken bij Weverskade betekent werken in een team van gedreven en vakkundige professionals die samen bouwen aan plekken van blijvende waarde."
            }
            indent="15.278vw"
            className="font-body font-medium text-[4.028vw] leading-[4.097vw] text-off-black max-md:text-[28px] max-md:leading-[30px] max-md:px-5"
          />

          <div className="flex items-start mt-[13.056vw] gap-[5.972vw] max-md:flex-col max-md:mt-8 max-md:gap-8">
            <div className="w-[42.083vw] h-[50.347vw] overflow-hidden shrink-0 max-md:w-full max-md:h-[130vw]">
              <Image
                src={
                  data?.aboutImage ?? "/images/werken-bij-team.webp"
                }
                alt="Team Weverskade"
                width={2731}
                height={3267}
                sizes="(max-width: 768px) 100vw, 42.083vw"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between h-[50.347vw] max-md:h-auto max-md:px-5">
              <p className="font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[22px] max-md:tracking-[-0.34px] max-md:mb-6">
                {data?.aboutLabel ?? "Werken bij Weverskade"}
              </p>
              <div className="max-w-[31.458vw] max-md:max-w-none">
                {aboutParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[22px] max-md:tracking-[-0.34px]${
                      i < aboutParagraphs.length - 1
                        ? " mb-[2.083vw]"
                        : ""
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ CTA — blue ═══ */}
      <div data-nav-theme="blue">
        <section className="bg-blue pt-[13.681vw] pb-[17.014vw] px-[2.431vw] max-md:pt-16 max-md:pb-16 max-md:px-5">
          <div className="flex items-start max-md:flex-col max-md:gap-4">
            <p className="font-heading font-normal text-[1.389vw] leading-[1.2] text-off-white shrink-0 w-[31.458vw] pl-[8.333vw] max-md:w-auto max-md:text-[17px] max-md:pl-0">
              {data?.ctaLabel ?? "Neem contact op"}
            </p>
            <div>
              <h2 className="font-body font-medium text-[3.75vw] leading-[3.681vw] text-off-white max-w-[55.625vw] mb-[2.778vw] max-md:text-[28px] max-md:leading-[30px] max-md:max-w-none max-md:mb-6">
                {data?.ctaHeading ?? (
                  <>
                    Staat jouw vacature er niet tussen? Denk je dat je bij
                    Weverskade past? Stuur gerust je cv en een korte motivatie
                    naar{" "}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-off-white underline decoration-solid"
                    >
                      {contactEmail}
                    </a>
                  </>
                )}
              </h2>
              <a
                href="/contact"
                onClick={(e) => navigate(e, "/contact")}
                className="link-underline font-body font-medium text-[0.972vw] leading-normal text-off-white pb-[0.347vw] max-md:text-[14px] max-md:pb-1"
              >
                {data?.ctaLinkText ?? "Naar de contactpagina"}
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ VACATURES — off-white ═══ */}
      <div data-nav-theme="light">
        <VacaturesSection
          vacatures={vacatures}
          contactEmail={contactEmail}
          navigate={navigate}
        />
      </div>
    </>
  );
}

function VacaturesSection({
  vacatures,
  contactEmail,
  navigate,
}: {
  vacatures: WerkenBijVacature[];
  contactEmail: string;
  navigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <section className="bg-off-white">
      <div className="pt-[9.861vw] pl-[18.542vw] pr-[2.431vw] pb-[5.694vw] max-md:pt-12 max-md:px-5 max-md:pb-8">
        <h2 className="font-heading font-normal text-[5.556vw] leading-[1.05] tracking-[-0.111vw] text-off-black max-md:text-[40px] max-md:leading-[42px] max-md:tracking-[-0.8px]">
          Overzicht vacatures
        </h2>
      </div>

      <div className="pl-[19.028vw] pr-[14.514vw] max-md:px-5">
        <div className="flex max-md:hidden">
          <div className="w-[48%]">
            <p className="font-body font-medium text-[1.389vw] leading-normal text-off-black">
              Vacature titel
            </p>
          </div>
          <div className="flex-1">
            <p className="font-body font-medium text-[1.389vw] leading-normal text-off-black">
              Omschrijving
            </p>
          </div>
        </div>

        <div className="mt-[2.083vw] max-md:mt-4">
          {vacatures.map((vacature, index) => {
            const isLast = index === vacatures.length - 1;
            return (
              <div key={vacature.slug} className="relative">
                <div className="h-px bg-off-black/20" />
                <div className="flex py-[2.778vw] max-md:flex-col max-md:py-6">
                  <div className="w-[48%] max-md:w-full max-md:mb-4">
                    <p className="font-heading font-normal text-[1.389vw] leading-normal text-off-black max-md:text-[20px]">
                      {vacature.title}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-medium text-[1.25vw] leading-[1.528vw] text-off-black max-w-[31.389vw] max-md:text-[16px] max-md:leading-[22px] max-md:max-w-none">
                      {vacature.shortDescription}
                    </p>
                    <div className="mt-[1.389vw] max-md:mt-4">
                      <a
                        href={`/werken-bij/${vacature.slug}`}
                        onClick={(e) =>
                          navigate(e, `/werken-bij/${vacature.slug}`)
                        }
                        className="link-underline font-body font-medium text-[0.972vw] leading-normal text-off-black pb-[0.347vw] max-md:text-[14px] max-md:pb-1"
                      >
                        Naar vacature
                      </a>
                    </div>
                  </div>
                </div>
                {isLast && <div className="h-px bg-off-black/20" />}
              </div>
            );
          })}

          {vacatures.length === 0 && (
            <div className="relative">
              <div className="h-px bg-off-black/20" />
              <div className="flex py-[2.778vw] max-md:flex-col max-md:py-6">
                <div className="w-[48%] max-md:w-full max-md:mb-4">
                  <p className="font-heading font-normal text-[1.389vw] leading-normal text-off-black max-md:text-[20px]">
                    Op dit moment zijn er geen vacatures
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-body font-medium text-[1.25vw] leading-[1.528vw] text-off-black max-w-[31.389vw] max-md:text-[16px] max-md:leading-[22px] max-md:max-w-none">
                    Staat jouw vacature er niet tussen? Denk je dat je bij
                    Weverskade past? Stuur gerust je cv en een korte motivatie
                    naar{" "}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="underline"
                    >
                      {contactEmail}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pb-[11.111vw] max-md:pb-16" />
    </section>
  );
}
