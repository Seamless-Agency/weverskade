"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import WonenBijHeader from "@/components/wonenbij/WonenBijHeader";
import WoningzoekerSection from "@/components/wonenbij/WoningzoekerSection";
import ProjectPlanning from "@/components/wonenbij/ProjectPlanning";
import DownloadsSection from "@/components/wonenbij/DownloadsSection";
import FaqSection from "@/components/wonenbij/FaqSection";
import InschrijfForm from "@/components/wonenbij/InschrijfForm";
import { PijlIcon } from "@/components/wonenbij/icons";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import type { WonenBijProject } from "@/data/wonenbij";

export interface NieuwsKaart {
  slug: string;
  titel: string;
  datum: string;
  image?: string;
}

const ANCHORS = [
  { label: "Over", href: "#over" },
  { label: "Aanbod", href: "#aanbod" },
  { label: "Locatie", href: "#locatie" },
  { label: "Planning", href: "#planning" },
  { label: "Nieuws", href: "#nieuws" },
  { label: "FAQ", href: "#faq" },
  { label: "Downloads", href: "#downloads" },
];

/**
 * Projectpagina van de wonen-bij omgeving - Figma "Projectpagina status
 * 'inschrijven'" (update 23 juli 2026).
 */
export default function WonenBijProjectPage({
  project,
  nieuws,
}: {
  project: WonenBijProject;
  nieuws: NieuwsKaart[];
}) {
  const navigate = usePageNavigation();

  const scrollNaar = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-white min-h-screen">
      {/* Hero — bewuste afwijking van Figma (903px-frame): altijd exact één
          viewport hoog zodat titel en navigatie op elk scherm in beeld zijn */}
      <div className="relative h-svh" data-nav-theme="dark">
        <Image
          src={project.heroImage}
          alt={project.naam}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Figma: top-scrim zwart 80% → 20% op 73% van de hoogte, dan vlak */}
        <div className="absolute inset-x-0 top-0 h-[11.319vw] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.2)_73%,rgba(0,0,0,0.2)_100%)] max-lg:h-[80px]" />
        <div className="absolute inset-x-0 bottom-0 h-[16.111vw] bg-gradient-to-b from-transparent to-black/70 max-lg:h-[120px]" />
        <WonenBijHeader
          variant="licht"
          anchors={ANCHORS}
          ctaLabel="Inschrijven"
          ctaHref="#inschrijven"
        />
        <div className="absolute left-[2.639vw] bottom-[1.667vw] max-lg:left-5 max-lg:right-5 max-lg:bottom-6">
          {/* Op mobiel staat de plaats klein boven de titel (rechtsonder is daar geen ruimte) */}
          <p className="hidden max-lg:block max-lg:mb-2 font-heading font-normal text-[16px] leading-none text-off-white">
            {project.plaats}
          </p>
          <h1 className="font-body font-medium text-[7.361vw] leading-[8.542vw] tracking-[-0.147vw] text-off-white max-lg:text-[44px] max-lg:leading-[1.05] max-lg:tracking-[-0.88px]">
            {project.naam}
          </h1>
        </div>
        <p className="absolute right-[2.361vw] bottom-[2.292vw] font-heading font-normal text-[2.778vw] leading-[3.424vw] tracking-[-0.056vw] text-off-white max-lg:hidden">
          {project.plaats}
        </p>
      </div>

      {/* Over het project — Figma: tekst op 109 onder de hero, 165 boven de groene band */}
      <div id="over" className="pt-[7.569vw] pb-[11.458vw] max-lg:py-12 scroll-mt-[2vw]">
        <div className="grid grid-cols-12 gap-x-[1.389vw] px-[2.361vw] max-lg:grid-cols-1 max-lg:px-5 max-lg:gap-y-5">
          <p className="col-span-3 mt-[0.833vw] font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:mt-0 max-lg:text-[17px] max-lg:leading-[22px]">
            Over het project
          </p>
          <div className="col-span-8">
            <p className="max-w-[57.847vw] font-heading font-normal text-[2.014vw] leading-[2.569vw] text-off-black max-lg:max-w-none max-lg:text-[19px] max-lg:leading-[26px]">
              {project.intro}
            </p>
            <div className="mt-[2.222vw] flex gap-[1.528vw] max-lg:mt-7 max-lg:flex-wrap max-lg:gap-3">
              <a
                href="#aanbod"
                onClick={(e) => scrollNaar(e, "aanbod")}
                className="bg-off-black text-off-white no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:px-5 max-lg:py-2.5 max-lg:text-[14px] max-lg:leading-normal"
              >
                Bekijk het aanbod
              </a>
              <a
                href="#inschrijven"
                onClick={(e) => scrollNaar(e, "inschrijven")}
                className="bg-green text-off-white no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:px-5 max-lg:py-2.5 max-lg:text-[14px] max-lg:leading-normal"
              >
                Direct inschrijven
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feiten en cijfers — Figma: titel op x=144, kolommen op 144/495/779/1033,
          tekst 55px rechts van de kolomrand, rijritme 108px (2-regelcel + 57 gap) */}
      {project.feiten.length > 0 ? (
        <div className="bg-green pt-[5.694vw] pb-[5.486vw] max-lg:py-12" data-nav-theme="green">
          <div className="pl-[10vw] pr-[4.167vw] max-lg:px-5">
            <h2 className="font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-white max-lg:text-[32px] max-lg:leading-[1.1] max-lg:tracking-[-0.64px]">
              Feiten en cijfers
            </h2>
            {/* Rijritme: cellen zijn minimaal 108px hoog (2-regelcel 51 + 57 wit);
                langere CMS-tekst groeit de rij en schuift de band mee omlaag. */}
            <div className="mt-[4.236vw] grid grid-cols-[24.375vw_19.722vw_17.639vw_1fr] max-lg:mt-8 max-lg:grid-cols-2 max-lg:gap-x-5 max-lg:gap-y-7">
              {project.feiten.map((feit) => (
                <div key={feit.label} className="flex items-start gap-[0.903vw] min-h-[7.5vw] max-lg:min-h-0 max-lg:gap-3">
                  <div className="flex h-[3.542vw] w-[2.917vw] shrink-0 items-center justify-center max-lg:h-[36px] max-lg:w-[28px]">
                    <Image
                      src={`/images/wonenbij/icons/${ICONEN[feit.icoon] ?? "beschikbaarheid.svg"}`}
                      alt=""
                      width={40}
                      height={40}
                      className="w-[2.778vw] h-[2.778vw] object-contain max-lg:w-[28px] max-lg:h-[28px]"
                    />
                  </div>
                  <div>
                    <p className="font-body font-normal text-[1.042vw] leading-[1.806vw] text-off-white max-lg:text-[13px] max-lg:leading-[19px]">
                      {feit.label}
                    </p>
                    <p className="font-heading font-normal text-[1.458vw] leading-[1.806vw] text-off-white whitespace-pre-line max-lg:text-[17px] max-lg:leading-[23px]">
                      {feit.waarde}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Huren in - fotocarrousel */}
      {project.hurenFotos.length > 0 ? (
        <HurenCarousel naam={project.naam} fotos={project.hurenFotos} />
      ) : null}

      {/* Woningzoeker */}
      <WoningzoekerSection
        projectSlug={project.slug}
        woningTypes={project.woningTypes}
        woningen={project.woningen}
        render={project.render}
        renderAlt={project.renderAlt}
        renderWidth={project.renderWidth}
        renderHeight={project.renderHeight}
        aanzichten={project.aanzichten}
      />

      {/* Persoonlijk begeleid — Figma: label op 146 van de bandtop (x=268),
          lijstblok en knop op x=258, vaste witruimtes 13/31/38/31, onder 178 */}
      <div className="bg-blue pt-[10.139vw] pb-[12.361vw] max-lg:py-14" data-nav-theme="blue">
        <div className="pl-[18.611vw] pr-[2.431vw] max-lg:px-5">
          <p className="font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-white max-lg:text-[16px] max-lg:leading-[21px]">
            {project.begeleiding.label}
          </p>
          <h2 className="mt-[0.903vw] max-w-[70.139vw] whitespace-pre-line font-heading font-normal text-[4.931vw] leading-[5.278vw] tracking-[-0.099vw] text-off-white max-lg:mt-3 max-lg:max-w-none max-lg:whitespace-normal max-lg:text-[32px] max-lg:leading-[38px] max-lg:tracking-[-0.64px]">
            {project.begeleiding.titel}
          </h2>
          <ul className="mt-[2.153vw] -ml-[0.694vw] max-w-[45.347vw] list-disc pl-[1.736vw] font-body font-medium text-[1.389vw] leading-[2.639vw] text-off-white max-lg:mt-6 max-lg:ml-0 max-lg:max-w-none max-lg:pl-6 max-lg:text-[16px] max-lg:leading-[30px]">
            {project.begeleiding.punten.map((punt) => (
              <li key={punt}>{punt}</li>
            ))}
          </ul>
          <p className="mt-[2.639vw] -ml-[0.694vw] max-w-[45.347vw] font-body font-medium text-[1.389vw] leading-[2.639vw] text-off-white max-lg:mt-5 max-lg:ml-0 max-lg:max-w-none max-lg:text-[16px] max-lg:leading-[28px]">
            {project.begeleiding.slotTekst}
          </p>
          <a
            href="/contact"
            className="inline-block mt-[2.153vw] -ml-[0.694vw] bg-off-white text-off-black no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:mt-6 max-lg:ml-0 max-lg:px-5 max-lg:py-2.5 max-lg:text-[14px] max-lg:leading-normal"
          >
            {project.begeleiding.knopTekst}
          </a>
        </div>
      </div>

      {/* Welkom bij + beeldcarrousel — Figma: label op 336 van de bandtop,
          tekstblokken onder-verankerd aan de foto-onderkant, fotoblokken 319 uit elkaar */}
      <div className="bg-off-white pt-[23.333vw] pb-[8.056vw] max-lg:pt-12 max-lg:pb-10">
        <div className="px-[2.361vw] max-lg:px-5">
          <div className="relative min-h-[43.889vw] max-lg:min-h-0">
            <p className="font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:text-[16px] max-lg:leading-[21px]">
              {project.welkomLabel}
            </p>
            <h2 className="mt-[0.903vw] font-heading font-normal text-[4.931vw] leading-[6.076vw] tracking-[-0.099vw] text-off-black max-lg:mt-3 max-lg:text-[36px] max-lg:leading-[1.1] max-lg:tracking-[-0.72px]">
              {project.welkomTitel}
            </h2>

            <div className="absolute top-0 right-[0.486vw] w-[54.514vw] max-lg:static max-lg:mt-6 max-lg:w-full max-lg:right-0">
              <div className="relative w-full aspect-[785/632] overflow-hidden">
                <Image
                  src={project.welkomFotos[0] ?? "/images/wonenbij/picture-1.jpg"}
                  alt={`Interieur ${project.naam}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
              <p className="absolute left-[-40.278vw] bottom-[-0.486vw] w-[29.792vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-lg:static max-lg:mt-4 max-lg:w-full max-lg:text-[17px] max-lg:leading-[24px]">
                {project.welkomTekst}
              </p>
            </div>
          </div>

          <div className="mt-[22.153vw] relative max-lg:mt-6">
            <div className="relative ml-[0.139vw] w-[54.931vw] aspect-[791/630] overflow-hidden max-lg:ml-0 max-lg:w-full">
              <Image
                src={project.welkomFotos[1] ?? "/images/wonenbij/picture-21.png"}
                alt={`Woonkamer ${project.naam}`}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <p className="absolute right-[0.069vw] bottom-0 w-[30.764vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-lg:static max-lg:mt-4 max-lg:w-full max-lg:text-[17px] max-lg:leading-[24px]">
              {project.welkomTekstRechts}
            </p>
          </div>
        </div>

        {project.carouselFotos.length > 0 ? (
          <FotoStrip fotos={project.carouselFotos} naam={project.naam} />
        ) : null}
      </div>

      {/* De locatie — Figma: label én content op x=384, kaart 115 onder de
          laatste accordionlijn, planningband 81 onder de kaart */}
      <div id="locatie" className="pt-[6.528vw] pb-[5.625vw] max-lg:py-12 scroll-mt-[2vw]">
        <div className="pl-[26.667vw] pr-[2.361vw] max-lg:px-5">
          <p className="font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:text-[16px] max-lg:leading-[21px]">
            {project.locatieLabel}
          </p>
          <h2 className="mt-[0.903vw] font-heading font-normal text-[4.931vw] leading-[6.076vw] tracking-[-0.099vw] text-off-black max-lg:mt-3 max-lg:text-[34px] max-lg:leading-[1.1] max-lg:tracking-[-0.68px]">
            {project.locatieTitel}
          </h2>
          <p className="mt-[3.194vw] max-w-[40.833vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-lg:mt-5 max-lg:max-w-none max-lg:text-[17px] max-lg:leading-[24px]">
            {project.locatieIntro}
          </p>

          <LocatieAccordion items={project.locatieItems} />
        </div>

        {/* Kaart */}
        {project.mapImage ? (
          <div className="relative mt-[7.986vw] mx-[2.431vw] max-lg:mt-8 max-lg:mx-5">
            <div className="relative w-full aspect-[1366/743] overflow-hidden mix-blend-multiply">
              <Image
                src={project.mapImage}
                alt={`Kaart van ${project.plaats}`}
                fill
                sizes="95vw"
                className="object-cover"
              />
            </div>
            <div className="absolute left-[42%] top-[45.6%] -translate-x-1/2 flex flex-col items-center">
              <span className="flex items-center bg-green text-off-white font-heading font-normal text-[1.667vw] leading-[2.056vw] tracking-[-0.033vw] h-[3.194vw] px-[1.111vw] max-lg:text-[13px] max-lg:h-auto max-lg:px-3 max-lg:py-1.5 max-lg:leading-normal">
                {project.naam}
              </span>
              <span className="-mt-[1.111vw] size-[2.153vw] rotate-45 bg-green max-lg:size-[10px] max-lg:-mt-[6px]" />
            </div>
            {project.mapLat && project.mapLng ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${project.mapLat},${project.mapLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-[2.569vw] bottom-[2.292vw] inline-flex items-center justify-center w-[11.181vw] h-[2.847vw] bg-off-black text-off-white no-underline rounded-full font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:right-3 max-lg:bottom-3 max-lg:w-auto max-lg:h-auto max-lg:px-4 max-lg:py-2 max-lg:text-[13px] max-lg:leading-normal"
              >
                Google Maps
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <ProjectPlanning fases={project.planning} />

      <DownloadsSection items={project.downloads} />

      {/* Nieuws en updates — Figma: op wit, titel 128 onder de groene band,
          rijen van 208 (foto 27 boven/28 onder de lijnen), kop op x=496 */}
      {nieuws.length > 0 ? (
        <div id="nieuws" className="bg-white pt-[8.889vw] pb-[15.625vw] max-lg:py-12 scroll-mt-[2vw]">
          <div className="px-[2.5vw] max-lg:px-5">
            <h2 className="font-heading font-normal text-[4.931vw] leading-[6.076vw] tracking-[-0.099vw] text-off-black max-lg:text-[34px] max-lg:leading-[1.1] max-lg:tracking-[-0.68px]">
              Nieuws en updates
            </h2>
            <div className="mt-[4.931vw] max-lg:mt-8">
              {nieuws.map((bericht, i) => (
                <a
                  key={bericht.slug}
                  href={`/wonenbij/nieuws/${bericht.slug}`}
                  onClick={(e) => navigate(e, `/wonenbij/nieuws/${bericht.slug}`)}
                  className={`grid grid-cols-12 gap-x-[1.389vw] items-start border-t border-off-black/40 pt-[1.875vw] pb-[1.944vw] no-underline group max-lg:flex max-lg:flex-col max-lg:gap-y-3 max-lg:py-5 ${
                    i === nieuws.length - 1 ? "border-b" : ""
                  }`}
                >
                  <p className="col-span-3 mt-[0.972vw] font-heading font-normal text-[1.389vw] leading-[1.715vw] text-off-black max-lg:mt-0 max-lg:text-[15px] max-lg:leading-[20px]">
                    {bericht.datum}
                  </p>
                  <div className="col-span-6 col-start-5 mt-[0.278vw] max-lg:mt-0">
                    <p className="max-w-[32.778vw] font-body font-medium text-[2.639vw] leading-[2.708vw] text-off-black max-lg:max-w-none max-lg:text-[20px] max-lg:leading-[24px]">
                      {bericht.titel}
                    </p>
                    <span className="inline-block mt-[1.944vw] font-body font-medium text-[0.972vw] leading-[1.125vw] text-off-black border-b border-off-black pb-[0.417vw] group-hover:opacity-70 transition-opacity duration-200 max-lg:mt-3 max-lg:text-[13px] max-lg:leading-normal">
                      Lees bericht
                    </span>
                  </div>
                  {bericht.image ? (
                    <div className="col-span-2 col-start-11 justify-self-end w-[16.458vw] max-lg:order-first max-lg:w-full">
                      <div className="relative w-full aspect-[237/153] overflow-hidden">
                        <Image
                          src={bericht.image}
                          alt={bericht.titel}
                          fill
                          sizes="(max-width: 768px) 100vw, 17vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        />
                      </div>
                    </div>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <FaqSection items={project.faq} />

      <InschrijfForm
        label="Beschikbaarheid"
        heading="Interesse in dit project?"
        intro={`Schrijf u vrijblijvend in als geïnteresseerde voor ${project.naam}. Geef aan welk woningtype of welke specifieke woning uw voorkeur heeft en vul uw gegevens in. Zo kunnen wij u gericht informeren over het actuele aanbod en toekomstige beschikbaarheid.`}
        projectName={project.naam}
        projectSlug={project.slug}
        voorkeurOpties={project.woningTypes.map((t) => t.naam)}
        voorkeurLabel="Selecteer voorkeurstype woning"
      />
    </section>
  );
}

const ICONEN: Record<string, string> = {
  locatie: "pin.svg",
  woningen: "gebouw.svg",
  oppervlakte: "oppervlakte.svg",
  slaapkamers: "bed.svg",
  buitenruimte: "balkon.svg",
  duurzaamheid: "leaf.svg",
  huurprijs: "key.svg",
  beschikbaarheid: "beschikbaarheid.svg",
};

/* ─── Fotocarrousel "Huren in …" met cirkelpijlen ───────────────────── */

function HurenCarousel({ naam, fotos }: { naam: string; fotos: string[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const stap = (richting: number) =>
    setIndex((i) => (i + richting + fotos.length) % fotos.length);

  return (
    // Figma: titel 139 onder de groene band (x=32), foto 1368×810 op x=35, 34 onder de titel
    <div className="pt-[9.653vw] max-lg:py-10">
      <h2 className="px-[2.222vw] font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-black max-lg:px-5 max-lg:text-[30px] max-lg:leading-[1.1] max-lg:tracking-[-0.6px]">
        Huren in {naam}
      </h2>
      <div className="relative mt-[2.361vw] mx-[2.431vw] max-lg:mt-5 max-lg:mx-5">
        <div
          className="relative w-full aspect-[1368/810] overflow-hidden max-lg:aspect-[4/3]"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) >= 40) stap(delta < 0 ? 1 : -1);
          }}
        >
          {fotos.map((foto, i) => (
            <Image
              key={foto + i}
              src={foto}
              alt={`${naam} - beeld ${i + 1}`}
              fill
              sizes="95vw"
              className={`object-cover transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {fotos.length > 1 ? (
            <div className="absolute inset-x-0 bottom-[0.972vw] hidden justify-center gap-[0.417vw] max-lg:flex max-lg:bottom-3 max-lg:gap-1.5">
              {fotos.map((_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`size-[0.417vw] rounded-full transition-opacity duration-300 max-lg:size-1.5 ${
                    i === index ? "bg-off-white" : "bg-off-white/40"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
        {fotos.length > 1 ? (
          <>
            <CarouselKnop richting="vorige" onClick={() => stap(-1)} />
            <CarouselKnop richting="volgende" onClick={() => stap(1)} />
          </>
        ) : null}
      </div>
    </div>
  );
}

function CarouselKnop({
  richting,
  onClick,
}: {
  richting: "vorige" | "volgende";
  onClick: () => void;
}) {
  const links = richting === "vorige";
  return (
    <button
      onClick={onClick}
      aria-label={links ? "Vorige foto" : "Volgende foto"}
      className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white cursor-pointer border-none transition-opacity duration-200 hover:opacity-80 max-lg:size-11 ${
        links ? "left-[1.181vw] max-lg:left-3" : "right-[1.181vw] max-lg:right-3"
      }`}
    >
      <PijlIcon
        className={`w-[1.389vw] h-auto text-off-black max-lg:w-[16px] ${
          links ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

/* ─── Horizontale fotostrip met voortgangsbalk ──────────────────────── */

function FotoStrip({ fotos, naam }: { fotos: string[]; naam: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [voortgang, setVoortgang] = useState(0);

  const handleScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setVoortgang(max > 0 ? el.scrollLeft / max : 0);
  };

  return (
    // Figma: strip 213 onder het tweede fotoblok, foto's 671 breed met 23 gap,
    // voortgangsbalk 496 breed rechts (84 van de rand), 15 onder de strip
    <div className="mt-[14.792vw] max-lg:mt-8">
      <div
        ref={stripRef}
        onScroll={handleScroll}
        className="flex gap-[1.597vw] overflow-x-auto px-[2.431vw] max-lg:gap-3 max-lg:px-5"
        style={{ scrollbarWidth: "none" }}
      >
        {fotos.map((foto, i) => (
          <div
            key={foto + i}
            className="relative shrink-0 w-[46.597vw] aspect-[671/519] overflow-hidden max-lg:w-[80vw]"
          >
            <Image
              src={foto}
              alt={`${naam} - sfeerbeeld ${i + 1}`}
              fill
              sizes="47vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div className="mt-[1.042vw] ml-auto mr-[5.833vw] w-[34.444vw] h-[3px] rounded-full bg-off-black/15 max-lg:mt-4 max-lg:mx-auto max-lg:w-[60vw]">
        <div
          className="h-full rounded-full bg-off-black transition-[width] duration-150"
          style={{ width: `${Math.max(10, voortgang * 100)}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Locatie-accordion met pijl-iconen ─────────────────────────────── */

function LocatieAccordion({
  items,
}: {
  items: { titel: string; tekst: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    // Figma: lijn → titel 13, dicht: titel → lijn 21; open: titel → tekst 20,
    // tekst → lijn 34. Pijl wijst omlaag (dicht) en draait horizontaal (open).
    <div className="mt-[3.681vw] max-w-[42.014vw] max-lg:mt-7 max-lg:max-w-none">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={item.titel}
            className={`border-t border-off-black/40 ${
              i === items.length - 1 ? "border-b" : ""
            }`}
          >
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-4 pt-[0.903vw] pb-[1.458vw] cursor-pointer bg-transparent border-none p-0 text-left max-lg:py-3"
            >
              <span className="font-heading font-normal text-[2.153vw] leading-[2.653vw] tracking-[-0.043vw] text-off-black max-lg:text-[20px] max-lg:leading-[1.1]">
                {item.titel}
              </span>
              <PijlIcon
                className={`shrink-0 w-[1.944vw] h-auto text-off-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-lg:w-[18px] ${
                  open ? "rotate-180" : "rotate-90"
                }`}
              />
            </button>
            <div
              className="grid"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                transition: "grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="overflow-hidden">
                <p className="pb-[2.361vw] max-w-[40.417vw] font-body font-medium text-[0.972vw] leading-[1.528vw] tracking-[-0.019vw] text-off-black max-lg:pb-4 max-lg:max-w-none max-lg:text-[14px] max-lg:leading-[21px]">
                  {item.tekst}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
