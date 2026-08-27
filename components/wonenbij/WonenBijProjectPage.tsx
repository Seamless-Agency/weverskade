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
      {/* Hero */}
      <div className="relative h-[62.708vw] max-md:h-[130vw]" data-nav-theme="dark">
        <Image
          src={project.heroImage}
          alt={project.naam}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 top-0 h-[11.319vw] bg-gradient-to-b from-black/80 to-transparent max-md:h-[80px]" />
        <div className="absolute inset-x-0 bottom-0 h-[16.319vw] bg-gradient-to-b from-transparent to-black/70 max-md:h-[120px]" />
        <WonenBijHeader
          variant="licht"
          anchors={ANCHORS}
          ctaLabel="Inschrijven"
          ctaHref="#inschrijven"
        />
        <h1 className="absolute left-[2.639vw] bottom-[3.264vw] font-body font-medium text-[7.361vw] leading-none tracking-[-0.147vw] text-off-white max-md:left-5 max-md:bottom-6 max-md:text-[44px] max-md:tracking-[-0.88px]">
          {project.naam}
        </h1>
        <p className="absolute right-[2.431vw] bottom-[3.75vw] font-heading font-normal text-[2.778vw] leading-none tracking-[-0.056vw] text-off-white max-md:hidden">
          {project.plaats}
        </p>
      </div>

      {/* Over het project */}
      <div id="over" className="py-[7.5vw] max-md:py-12 scroll-mt-[2vw]">
        <div className="grid grid-cols-12 gap-x-[1.389vw] px-[2.361vw] max-md:grid-cols-1 max-md:px-5 max-md:gap-y-5">
          <p className="col-span-3 font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[17px]">
            Over het project
          </p>
          <div className="col-span-8">
            <p className="font-heading font-normal text-[2.014vw] leading-[2.569vw] text-off-black max-md:text-[19px] max-md:leading-[26px]">
              {project.intro}
            </p>
            <div className="mt-[3.194vw] flex gap-[1.111vw] max-md:mt-7 max-md:flex-wrap max-md:gap-3">
              <a
                href="#aanbod"
                onClick={(e) => scrollNaar(e, "aanbod")}
                className="bg-off-black text-off-white no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-md:px-5 max-md:py-2.5 max-md:text-[14px]"
              >
                Bekijk het aanbod
              </a>
              <a
                href="#inschrijven"
                onClick={(e) => scrollNaar(e, "inschrijven")}
                className="bg-green text-off-white no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-md:px-5 max-md:py-2.5 max-md:text-[14px]"
              >
                Direct inschrijven
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feiten en cijfers */}
      {project.feiten.length > 0 ? (
        <div className="bg-green py-[5.694vw] max-md:py-12" data-nav-theme="green">
          <div className="pl-[10.417vw] pr-[2.431vw] max-md:px-5">
            <h2 className="font-heading font-normal text-[4.653vw] leading-none tracking-[-0.093vw] text-off-white max-md:text-[32px] max-md:tracking-[-0.64px]">
              Feiten en cijfers
            </h2>
            <div className="mt-[4.514vw] grid grid-cols-4 gap-x-[3vw] gap-y-[3.5vw] max-md:mt-8 max-md:grid-cols-2 max-md:gap-x-5 max-md:gap-y-7">
              {project.feiten.map((feit) => (
                <div key={feit.label} className="flex items-start gap-[1.111vw] max-md:gap-3">
                  <Image
                    src={`/images/wonenbij/icons/${ICONEN[feit.icoon] ?? "beschikbaarheid.svg"}`}
                    alt=""
                    width={40}
                    height={40}
                    className="w-[2.778vw] h-[2.778vw] object-contain max-md:w-[28px] max-md:h-[28px]"
                  />
                  <div>
                    <p className="font-body font-normal text-[1.042vw] leading-[1.806vw] text-off-white max-md:text-[13px] max-md:leading-[19px]">
                      {feit.label}
                    </p>
                    <p className="font-heading font-normal text-[1.458vw] leading-[1.806vw] text-off-white whitespace-pre-line max-md:text-[17px] max-md:leading-[23px]">
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

      {/* Persoonlijk begeleid */}
      <div className="bg-blue py-[8.403vw] max-md:py-14" data-nav-theme="blue">
        <div className="pl-[18.611vw] pr-[2.431vw] max-md:px-5">
          <p className="font-body font-medium text-[1.389vw] leading-[1.2] text-off-white max-md:text-[16px]">
            {project.begeleiding.label}
          </p>
          <h2 className="mt-[1.111vw] max-w-[70.139vw] font-heading font-normal text-[4.931vw] leading-[5.278vw] tracking-[-0.099vw] text-off-white max-md:mt-3 max-md:max-w-none max-md:text-[32px] max-md:leading-[38px] max-md:tracking-[-0.64px]">
            {project.begeleiding.titel}
          </h2>
          <ul className="mt-[3.125vw] max-w-[45.347vw] list-disc pl-[2.083vw] font-body font-medium text-[1.389vw] leading-[2.639vw] text-off-white max-md:mt-6 max-md:max-w-none max-md:pl-6 max-md:text-[16px] max-md:leading-[30px]">
            {project.begeleiding.punten.map((punt) => (
              <li key={punt}>{punt}</li>
            ))}
          </ul>
          <p className="mt-[2.639vw] max-w-[45.347vw] font-body font-medium text-[1.389vw] leading-[2.639vw] text-off-white max-md:mt-5 max-md:max-w-none max-md:text-[16px] max-md:leading-[28px]">
            {project.begeleiding.slotTekst}
          </p>
          <a
            href="/contact"
            className="inline-block mt-[2.5vw] bg-off-white text-off-black no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-md:mt-6 max-md:px-5 max-md:py-2.5 max-md:text-[14px]"
          >
            {project.begeleiding.knopTekst}
          </a>
        </div>
      </div>

      {/* Welkom bij + beeldcarrousel */}
      <div className="bg-off-white pt-[9.514vw] pb-[8vw] max-md:pt-12 max-md:pb-10">
        <div className="px-[2.361vw] max-md:px-5">
          <p className="font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[16px]">
            {project.welkomLabel}
          </p>
          <h2 className="mt-[1.25vw] font-heading font-normal text-[4.931vw] leading-none tracking-[-0.099vw] text-off-black max-md:mt-3 max-md:text-[36px] max-md:tracking-[-0.72px]">
            {project.welkomTitel}
          </h2>

          <div className="mt-[6.944vw] grid grid-cols-12 gap-x-[1.389vw] max-md:mt-8 max-md:grid-cols-1 max-md:gap-y-6">
            <p className="col-span-4 font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:text-[17px] max-md:leading-[24px]">
              {project.welkomTekst}
            </p>
            <div className="col-span-7 col-start-6">
              <div className="relative w-full aspect-[785/632] overflow-hidden">
                <Image
                  src={project.welkomFotos[0] ?? "/images/wonenbij/picture-1.jpg"}
                  alt={`Interieur ${project.naam}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-[2.083vw] grid grid-cols-12 gap-x-[1.389vw] max-md:mt-6 max-md:grid-cols-1 max-md:gap-y-6">
            <div className="col-span-7">
              <div className="relative w-full aspect-[791/630] overflow-hidden">
                <Image
                  src={project.welkomFotos[1] ?? "/images/wonenbij/picture-21.png"}
                  alt={`Woonkamer ${project.naam}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </div>
            </div>
            <p className="col-span-4 col-start-9 self-end pb-[2vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:pb-0 max-md:text-[17px] max-md:leading-[24px]">
              {project.welkomTekstRechts}
            </p>
          </div>
        </div>

        {project.carouselFotos.length > 0 ? (
          <FotoStrip fotos={project.carouselFotos} naam={project.naam} />
        ) : null}
      </div>

      {/* De locatie */}
      <div id="locatie" className="py-[7.5vw] max-md:py-12 scroll-mt-[2vw]">
        <div className="grid grid-cols-12 gap-x-[1.389vw] px-[2.361vw] max-md:grid-cols-1 max-md:px-5 max-md:gap-y-5">
          <p className="col-span-3 font-body font-medium text-[1.389vw] leading-[1.2] text-off-black max-md:text-[16px]">
            {project.locatieLabel}
          </p>
          <div className="col-span-8">
            <h2 className="font-heading font-normal text-[4.931vw] leading-none tracking-[-0.099vw] text-off-black max-md:text-[34px] max-md:tracking-[-0.68px]">
              {project.locatieTitel}
            </h2>
            <p className="mt-[2.222vw] max-w-[40.833vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-md:mt-5 max-md:max-w-none max-md:text-[17px] max-md:leading-[24px]">
              {project.locatieIntro}
            </p>

            <LocatieAccordion items={project.locatieItems} />
          </div>
        </div>

        {/* Kaart */}
        {project.mapImage ? (
          <div className="relative mt-[6.25vw] mx-[2.431vw] max-md:mt-8 max-md:mx-5">
            <div className="relative w-full aspect-[1366/743] overflow-hidden mix-blend-multiply">
              <Image
                src={project.mapImage}
                alt={`Kaart van ${project.plaats}`}
                fill
                sizes="95vw"
                className="object-cover"
              />
            </div>
            <div className="absolute left-1/2 top-[42%] -translate-x-1/2 flex flex-col items-center">
              <span className="bg-green text-off-white font-heading font-normal text-[1.667vw] tracking-[-0.033vw] px-[1.111vw] py-[0.556vw] max-md:text-[13px] max-md:px-3 max-md:py-1.5">
                {project.naam}
              </span>
              <span className="-mt-[0.76vw] size-[1.528vw] rotate-45 bg-green max-md:size-[10px] max-md:-mt-[6px]" />
            </div>
            {project.mapLat && project.mapLng ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${project.mapLat},${project.mapLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-[2.431vw] bottom-[2.431vw] bg-off-black text-off-white no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-md:right-3 max-md:bottom-3 max-md:px-4 max-md:py-2 max-md:text-[13px]"
              >
                Google Maps
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <ProjectPlanning fases={project.planning} />

      <DownloadsSection items={project.downloads} />

      {/* Nieuws en updates */}
      {nieuws.length > 0 ? (
        <div id="nieuws" className="bg-off-white py-[7.5vw] max-md:py-12 scroll-mt-[2vw]">
          <div className="px-[2.5vw] max-md:px-5">
            <h2 className="font-heading font-normal text-[4.931vw] leading-none tracking-[-0.099vw] text-off-black max-md:text-[34px] max-md:tracking-[-0.68px]">
              Nieuws en updates
            </h2>
            <div className="mt-[4.514vw] max-md:mt-8">
              {nieuws.map((bericht, i) => (
                <a
                  key={bericht.slug}
                  href={`/wonenbij/nieuws/${bericht.slug}`}
                  onClick={(e) => navigate(e, `/wonenbij/nieuws/${bericht.slug}`)}
                  className={`grid grid-cols-12 gap-x-[1.389vw] items-start border-t border-off-black/40 py-[2.847vw] no-underline group max-md:grid-cols-1 max-md:gap-y-3 max-md:py-5 ${
                    i === nieuws.length - 1 ? "border-b" : ""
                  }`}
                >
                  <p className="col-span-3 font-heading font-normal text-[1.389vw] leading-[1.2] text-off-black max-md:text-[15px]">
                    {bericht.datum}
                  </p>
                  <div className="col-span-6">
                    <p className="max-w-[32.778vw] font-body font-medium text-[2.639vw] leading-[2.708vw] text-off-black max-md:max-w-none max-md:text-[20px] max-md:leading-[24px]">
                      {bericht.titel}
                    </p>
                    <span className="inline-block mt-[2vw] font-body font-medium text-[0.972vw] text-off-black border-b border-off-black pb-[0.2vw] group-hover:opacity-70 transition-opacity duration-200 max-md:mt-3 max-md:text-[13px]">
                      Lees bericht
                    </span>
                  </div>
                  {bericht.image ? (
                    <div className="col-span-3 justify-self-end w-[16.458vw] max-md:w-full">
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

  const stap = (richting: number) =>
    setIndex((i) => (i + richting + fotos.length) % fotos.length);

  return (
    <div className="py-[5.556vw] px-[2.222vw] max-md:py-10 max-md:px-5">
      <h2 className="font-heading font-normal text-[4.653vw] leading-none tracking-[-0.093vw] text-off-black max-md:text-[30px] max-md:tracking-[-0.6px]">
        Huren in {naam}
      </h2>
      <div className="relative mt-[2.778vw] max-md:mt-5">
        <div className="relative w-full aspect-[1366/608] overflow-hidden max-md:aspect-[4/3]">
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
      className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white cursor-pointer border-none transition-opacity duration-200 hover:opacity-80 max-md:size-[36px] ${
        links ? "left-[1.181vw] max-md:left-3" : "right-[1.181vw] max-md:right-3"
      }`}
    >
      <PijlIcon
        className={`w-[1.389vw] h-auto text-off-black max-md:w-[16px] ${
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
    <div className="mt-[6.944vw] max-md:mt-8">
      <div
        ref={stripRef}
        onScroll={handleScroll}
        className="flex gap-[1.389vw] overflow-x-auto px-[2.431vw] max-md:gap-3 max-md:px-5"
        style={{ scrollbarWidth: "none" }}
      >
        {fotos.map((foto, i) => (
          <div
            key={foto + i}
            className="relative shrink-0 w-[46.597vw] aspect-[671/519] overflow-hidden max-md:w-[80vw]"
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
      <div className="mt-[1.042vw] mx-auto w-[34.444vw] h-[3px] rounded-full bg-off-black/15 max-md:mt-4 max-md:w-[60vw]">
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
    <div className="mt-[4.167vw] max-w-[42.014vw] max-md:mt-7 max-md:max-w-none">
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
              className="w-full flex items-center justify-between gap-4 py-[1.181vw] cursor-pointer bg-transparent border-none p-0 text-left max-md:py-3"
            >
              <span className="font-heading font-normal text-[2.153vw] leading-none tracking-[-0.043vw] text-off-black max-md:text-[20px]">
                {item.titel}
              </span>
              <PijlIcon
                className={`shrink-0 w-[1.944vw] h-auto text-off-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-md:w-[18px] ${
                  open ? "-rotate-90" : "rotate-90"
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
                <p className="pb-[1.667vw] max-w-[40.417vw] font-body font-medium text-[0.972vw] leading-[1.528vw] tracking-[-0.019vw] text-off-black max-md:pb-4 max-md:max-w-none max-md:text-[14px] max-md:leading-[21px]">
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
