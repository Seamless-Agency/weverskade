"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import GebouwImageCarousel from "@/components/GebouwImageCarousel";
import WonenBijHeader from "@/components/wonenbij/WonenBijHeader";
import WoningzoekerSection from "@/components/wonenbij/WoningzoekerSection";
import ProjectPlanning from "@/components/wonenbij/ProjectPlanning";
import DownloadsSection from "@/components/wonenbij/DownloadsSection";
import FaqSection from "@/components/wonenbij/FaqSection";
import InschrijfForm from "@/components/wonenbij/InschrijfForm";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  PijlIcon,
} from "@/components/wonenbij/icons";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { useInView } from "@/hooks/useInView";
import GebouwMap from "@/components/GebouwMap";
import type { WonenBijProject } from "@/data/wonenbij";
import {
  EASE,
  HeroParallax,
  Parallax,
  Reveal,
  RevealGroup,
  RevealLine,
  RevealMedia,
  RevealWords,
  Statisch,
  useHeroIntro,
  useReducedMotion,
} from "@/components/wonenbij/motion";

export interface NieuwsKaart {
  slug: string;
  titel: string;
  datum: string;
  image?: string;
}

/** Social-kanalen onder het nieuws; alleen ingevulde kanalen worden getoond. */
export interface SocialLinks {
  linkedIn?: string;
  instagram?: string;
  facebook?: string;
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
  socials,
}: {
  project: WonenBijProject;
  nieuws: NieuwsKaart[];
  socials?: SocialLinks;
}) {
  const socialKanalen = [
    { label: "LinkedIn", href: socials?.linkedIn, Icoon: LinkedInIcon },
    { label: "Instagram", href: socials?.instagram, Icoon: InstagramIcon },
    { label: "Facebook", href: socials?.facebook, Icoon: FacebookIcon },
  ].filter((k): k is typeof k & { href: string } => Boolean(k.href));
  const navigate = usePageNavigation();
  const intro = useHeroIntro();
  const reduced = useReducedMotion();

  // Google Maps pas initialiseren als de locatiesectie in de buurt komt.
  const [kaartRef, kaartInView] = useInView<HTMLDivElement>({
    rootMargin: "800px 0px 800px 0px",
    threshold: 0,
  });

  // Variant zonder woningzoeker (Jims besluit 01-09): een project zonder
  // eigen woningtypes toont geen aanbod-sectie en geen typepagina's; secties
  // zonder eigen content verdwijnen, en hun ankers gaan mee uit de navigatie
  // zodat er geen dode links in de header staan.
  const heeftAanbod = project.woningTypes.length > 0;
  const heeftLocatieTekst = Boolean(
    project.locatieTitel && project.locatieIntro
  );
  const heeftKaart =
    Boolean(project.mapLat && project.mapLng) || Boolean(project.mapImage);
  const anchors = ANCHORS.filter((anchor) => {
    switch (anchor.href) {
      case "#aanbod":
        return heeftAanbod;
      case "#locatie":
        return heeftLocatieTekst || heeftKaart;
      case "#planning":
        return Boolean(project.planning?.length);
      case "#downloads":
        return Boolean(project.downloads?.length);
      case "#faq":
        return Boolean(project.faq?.length);
      default:
        return true;
    }
  });

  const scrollNaar = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-white min-h-screen">
      {/* Hero — bewuste afwijking van Figma (903px-frame): altijd exact één
          viewport hoog zodat titel en navigatie op elk scherm in beeld zijn */}
      <div className="relative h-svh overflow-hidden" data-nav-theme="dark">
        {/* Zoom-out entrance, zelfde geste als de hero van de hoofdsite;
            daarbinnen zakt de foto mee tijdens het scrollen (parallax). */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: intro ? "scale(1)" : "scale(1.18)",
            transition: intro && !reduced ? `transform 2.4s ${EASE}` : "none",
          }}
        >
          <HeroParallax>
            <Image
              src={project.heroImage}
              alt={project.naam}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </HeroParallax>
        </div>
        {/* Top-scrim voor leesbaarheid van de navigatie. Bewuste afwijking van
            Figma (dat stopte op 20% zwart, waardoor de onderkant als een balk
            aftekende): de stops volgen een ease-out naar volledig transparant,
            zodat de scrim in de foto oplost. De donkerte achter de navrij
            (0-55% van de hoogte) blijft gelijk aan de Figma-waarden. */}
        <div className="absolute inset-x-0 top-0 h-[11.319vw] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.66)_20%,rgba(0,0,0,0.5)_40%,rgba(0,0,0,0.34)_58%,rgba(0,0,0,0.18)_74%,rgba(0,0,0,0.07)_88%,rgba(0,0,0,0)_100%)] max-lg:h-[80px]" />
        <div className="absolute inset-x-0 bottom-0 h-[16.111vw] bg-gradient-to-b from-transparent to-black/70 max-lg:h-[120px]" />
        <WonenBijHeader
          variant="licht"
          anchors={anchors}
          ctaLabel="Inschrijven"
          ctaHref="#inschrijven"
        />
        <div className="absolute left-[2.639vw] bottom-[1.667vw] max-lg:left-5 max-lg:right-5 max-lg:bottom-6">
          {/* Op mobiel staat de plaats klein boven de titel (rechtsonder is daar geen ruimte) */}
          <Reveal
            as="p"
            when={intro}
            delay={0.55}
            y={14}
            className="hidden max-lg:block max-lg:mb-2 font-heading font-normal text-[16px] leading-none text-off-white"
          >
            {project.plaats}
          </Reveal>
          <h1 className="font-body font-medium text-[7.361vw] leading-[8.542vw] tracking-[-0.147vw] text-off-white max-lg:text-[44px] max-lg:leading-[1.05] max-lg:tracking-[-0.88px]">
            <RevealWords text={project.naam} when={intro} delay={0.25} duration={1.1} />
          </h1>
        </div>
        <Reveal
          as="p"
          when={intro}
          delay={0.55}
          y={14}
          className="absolute right-[2.361vw] bottom-[2.292vw] font-heading font-normal text-[2.778vw] leading-[3.424vw] tracking-[-0.056vw] text-off-white max-lg:hidden"
        >
          {project.plaats}
        </Reveal>
      </div>

      {/* Over het project — Figma: tekst op 109 onder de hero, 165 boven de groene band */}
      <div id="over" className="pt-[7.569vw] pb-[11.458vw] max-lg:py-12 scroll-mt-[2vw]" data-nav-theme="white">
        <RevealGroup className="grid grid-cols-12 gap-x-[1.389vw] px-[2.361vw] max-lg:grid-cols-1 max-lg:px-5 max-lg:gap-y-5">
          <Reveal
            as="p"
            className="col-span-3 mt-[0.833vw] font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:mt-0 max-lg:text-[17px] max-lg:leading-[22px]"
          >
            Over het project
          </Reveal>
          <div className="col-span-8">
            <Reveal
              as="p"
              delay={0.1}
              className="max-w-[57.847vw] whitespace-pre-line font-heading font-normal text-[2.014vw] leading-[2.569vw] text-off-black max-lg:max-w-none max-lg:text-[19px] max-lg:leading-[26px]"
            >
              {project.intro}
            </Reveal>
            <Reveal
              delay={0.25}
              className="mt-[2.222vw] flex gap-[1.528vw] max-lg:mt-7 max-lg:flex-wrap max-lg:gap-3"
            >
              {heeftAanbod ? (
                <a
                  href="#aanbod"
                  onClick={(e) => scrollNaar(e, "aanbod")}
                  className="pill-hover bg-off-black text-off-white no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:px-5 max-lg:py-2.5 max-lg:text-[14px] max-lg:leading-normal"
                >
                  Bekijk het aanbod
                </a>
              ) : null}
              <a
                href="#inschrijven"
                onClick={(e) => scrollNaar(e, "inschrijven")}
                className="pill-hover bg-green text-off-white no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:px-5 max-lg:py-2.5 max-lg:text-[14px] max-lg:leading-normal"
              >
                Direct inschrijven
              </a>
            </Reveal>
          </div>
        </RevealGroup>
      </div>

      {/* Feiten en cijfers — Figma: titel op x=144, kolommen op 144/495/779/1033,
          tekst 55px rechts van de kolomrand, rijritme 108px (2-regelcel + 57 gap) */}
      {project.feiten?.length ? (
        <div className="bg-green pt-[5.694vw] pb-[5.486vw] max-lg:py-12" data-nav-theme="green">
          <div className="pl-[10vw] pr-[4.167vw] max-lg:px-5">
            <h2 className="font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-white max-lg:text-[32px] max-lg:leading-[1.1] max-lg:tracking-[-0.64px]">
              <RevealWords text="Feiten en cijfers" />
            </h2>
            {/* Rijritme: cellen zijn minimaal 108px hoog (2-regelcel 51 + 57 wit);
                langere CMS-tekst groeit de rij en schuift de band mee omlaag. */}
            <RevealGroup className="mt-[4.236vw] grid grid-cols-[24.375vw_19.722vw_17.639vw_1fr] max-lg:mt-8 max-lg:grid-cols-2 max-lg:gap-x-5 max-lg:gap-y-7">
              {project.feiten.map((feit, i) => (
                <Reveal
                  key={feit.label}
                  delay={0.1 + i * 0.075}
                  className="flex items-start gap-[0.903vw] min-h-[7.5vw] max-lg:min-h-0 max-lg:gap-3"
                >
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
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </div>
      ) : null}

      {/* Huren in - fotocarrousel */}
      {project.hurenFotos?.length ? (
        <HurenCarousel
          titel={project.hurenTitel ?? `Huren in ${project.naam}`}
          naam={project.naam}
          fotos={project.hurenFotos}
        />
      ) : null}

      {/* Woningzoeker — exclusief voor projecten met eigen woningtypes */}
      {heeftAanbod ? (
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
      ) : null}

      {/* Persoonlijk begeleid — Figma: label op 146 van de bandtop (x=268),
          lijstblok en knop op x=258, vaste witruimtes 13/31/38/31, onder 178.
          Bewust statisch (geen scroll-reveal) voor ritme tussen de secties. */}
      <Statisch>
      <div className="bg-blue pt-[10.139vw] pb-[12.361vw] max-lg:py-14" data-nav-theme="blue">
        <div className="pl-[18.611vw] pr-[2.431vw] max-lg:px-5">
          <Reveal
            as="p"
            className="font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-white max-lg:text-[16px] max-lg:leading-[21px]"
          >
            {project.begeleiding.label}
          </Reveal>
          <h2 className="mt-[0.903vw] max-w-[70.139vw] whitespace-pre-line font-heading font-normal text-[4.931vw] leading-[5.278vw] tracking-[-0.099vw] text-off-white max-lg:mt-3 max-lg:max-w-none max-lg:whitespace-normal max-lg:text-[32px] max-lg:leading-[38px] max-lg:tracking-[-0.64px]">
            <RevealWords text={project.begeleiding.titel} delay={0.1} />
          </h2>
          <RevealGroup
            as="ul"
            className="mt-[2.153vw] -ml-[0.694vw] max-w-[45.347vw] list-disc pl-[1.736vw] font-body font-medium text-[1.389vw] leading-[2.639vw] text-off-white max-lg:mt-6 max-lg:ml-0 max-lg:max-w-none max-lg:pl-6 max-lg:text-[16px] max-lg:leading-[30px]"
          >
            {project.begeleiding.punten.map((punt, i) => (
              <Reveal as="li" key={punt} delay={0.1 + i * 0.06} y={16}>
                {punt}
              </Reveal>
            ))}
          </RevealGroup>
          <Reveal
            as="p"
            delay={0.15}
            className="mt-[2.639vw] -ml-[0.694vw] max-w-[45.347vw] font-body font-medium text-[1.389vw] leading-[2.639vw] text-off-white max-lg:mt-5 max-lg:ml-0 max-lg:max-w-none max-lg:text-[16px] max-lg:leading-[28px]"
          >
            {project.begeleiding.slotTekst}
          </Reveal>
          <Reveal as="span" className="inline-block" delay={0.25}>
            <a
              href="/contact"
              className="pill-hover inline-block mt-[2.153vw] -ml-[0.694vw] bg-off-white text-off-black no-underline rounded-full px-[1.528vw] py-[0.694vw] font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:mt-6 max-lg:ml-0 max-lg:px-5 max-lg:py-2.5 max-lg:text-[14px] max-lg:leading-normal"
            >
              {project.begeleiding.knopTekst}
            </a>
          </Reveal>
        </div>
      </div>
      </Statisch>

      {/* Welkom bij + beeldcarrousel — Figma: label op 336 van de bandtop,
          tekstblokken onder-verankerd aan de foto-onderkant, fotoblokken 319 uit elkaar */}
      <div className="bg-off-white pt-[23.333vw] pb-[8.056vw] max-lg:pt-12 max-lg:pb-10" data-nav-theme="light">
        <div className="px-[2.361vw] max-lg:px-5">
          {/* De tekst staat bewust ín de flow (flex + mt-auto) in plaats van
              absoluut aan de foto-onderkant verankerd: bij korte tekst is het
              resultaat pixelgelijk aan Figma (onderkant tekst = onderkant
              foto), maar lange CMS-tekst laat de sectie meegroeien i.p.v.
              omhoog door de kop te lopen. De pt-[3.472vw] is de minimale
              witruimte onder de kop in dat groei-geval; bij korte tekst valt
              hij binnen de mt-auto-ruimte en verandert er niets. */}
          <div className="relative flex flex-col min-h-[43.889vw] max-lg:min-h-0 max-lg:flex max-lg:flex-col">
            <Reveal
              as="p"
              className="order-1 font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:text-[16px] max-lg:leading-[21px]"
            >
              {project.welkomLabel}
            </Reveal>
            <h2 className="order-2 mt-[0.903vw] max-w-[37.5vw] font-heading font-normal text-[4.931vw] leading-[6.076vw] tracking-[-0.099vw] text-off-black max-lg:mt-3 max-lg:max-w-none max-lg:text-[36px] max-lg:leading-[1.1] max-lg:tracking-[-0.72px]">
              <RevealWords text={project.welkomTitel} delay={0.1} />
            </h2>

            {project.welkomTekst ? (
              <Reveal
                as="p"
                delay={0.15}
                className="order-4 lg:mt-auto lg:pt-[3.472vw] lg:-mb-[0.486vw] w-[29.792vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-lg:mt-4 max-lg:w-full max-lg:text-[17px] max-lg:leading-[24px]"
              >
                {project.welkomTekst}
              </Reveal>
            ) : null}

            {/* bottom-0 i.p.v. top-0: bij tekst langer dan de foto zakt de
                foto mee zodat zijn onderkant op de laatste tekstregel ligt
                (design-intentie); bij korte tekst is de rij exact fotohoogte
                en is dit identiek aan top-0. */}
            <div className="order-3 absolute bottom-0 right-[0.486vw] w-[54.514vw] max-lg:static max-lg:mt-6 max-lg:w-full max-lg:right-0">
              <RevealMedia className="relative w-full aspect-[785/632] overflow-hidden">
                <Parallax>
                  <Image
                    src={project.welkomFotos?.[0] ?? "/images/wonenbij/picture-1.jpg"}
                    alt={`Interieur ${project.naam}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover"
                  />
                </Parallax>
              </RevealMedia>
            </div>
          </div>

          {/* Zelfde principe: tekst naast de foto in de flow, onderkanten
              gelijk via items-end; lange tekst maakt de rij hoger i.p.v.
              boven de foto uit te groeien. */}
          <div className="mt-[22.153vw] lg:flex lg:items-end lg:justify-between max-lg:mt-6">
            <RevealMedia className="relative ml-[0.139vw] w-[54.931vw] shrink-0 aspect-[791/630] overflow-hidden max-lg:ml-0 max-lg:w-full">
              <Parallax>
                <Image
                  src={project.welkomFotos?.[1] ?? "/images/wonenbij/picture-21.png"}
                  alt={`Woonkamer ${project.naam}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              </Parallax>
            </RevealMedia>
            {project.welkomTekstRechts ? (
              <Reveal
                as="p"
                delay={0.15}
                className="w-[30.764vw] mr-[0.069vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-lg:mt-4 max-lg:w-full max-lg:mr-0 max-lg:text-[17px] max-lg:leading-[24px]"
              >
                {project.welkomTekstRechts}
              </Reveal>
            ) : null}
          </div>
        </div>

        {/* Zelfde carrousel als de live site (bewuste afwijking van Figma):
            twee foto's vullen samen altijd de volle breedte, met snap en
            scrubbare voortgangsbalk. Wrapper-mt = Figma-afstand 213 minus de
            ingebouwde 20px van het component. */}
        {/* Eén foto maakt geen carrousel: dan de sectie weglaten. */}
        {(project.carouselFotos?.length ?? 0) > 1 ? (
          <Reveal duration={1.1} className="mt-[13.403vw] max-lg:mt-8">
            <GebouwImageCarousel
              images={project.carouselFotos ?? []}
              projectName={project.naam}
            />
          </Reveal>
        ) : null}
      </div>

      {/* De locatie — Figma: label én content op x=384, kaart 115 onder de
          laatste accordionlijn, planningband 81 onder de kaart.
          Bewust statisch (geen scroll-reveal) voor ritme tussen de secties. */}
      {heeftLocatieTekst || heeftKaart ? (
      <Statisch>
      <div id="locatie" className="pt-[6.528vw] pb-[5.625vw] max-lg:py-12 scroll-mt-[2vw]" data-nav-theme="white">
        {heeftLocatieTekst ? (
        <div className="pl-[26.667vw] pr-[2.361vw] max-lg:px-5">
          <Reveal
            as="p"
            className="font-body font-medium text-[1.389vw] leading-[1.611vw] text-off-black max-lg:text-[16px] max-lg:leading-[21px]"
          >
            {project.locatieLabel}
          </Reveal>
          <h2 className="mt-[0.903vw] font-heading font-normal text-[4.931vw] leading-[6.076vw] tracking-[-0.099vw] text-off-black max-lg:mt-3 max-lg:text-[34px] max-lg:leading-[1.1] max-lg:tracking-[-0.68px]">
            <RevealWords text={project.locatieTitel ?? ""} delay={0.1} />
          </h2>
          <Reveal
            as="p"
            delay={0.1}
            className="mt-[3.194vw] max-w-[40.833vw] font-body font-medium text-[1.597vw] leading-[2.153vw] tracking-[-0.032vw] text-off-black max-lg:mt-5 max-lg:max-w-none max-lg:text-[17px] max-lg:leading-[24px]"
          >
            {project.locatieIntro}
          </Reveal>

          <LocatieAccordion items={project.locatieItems ?? []} />
        </div>
        ) : null}

        {/* Kaart — interactieve Google Maps zoals op de hoofdsite
            (GebouwMap tekent zelf de groene marker); pas geladen als de
            sectie in de buurt komt zodat het Maps-script niet elke
            paginaweergave kost. Zonder coördinaten valt de sectie terug
            op de statische kaartafbeelding. */}
        {project.mapLat && project.mapLng ? (
          <RevealGroup className="relative mt-[7.986vw] mx-[2.431vw] max-lg:mt-8 max-lg:mx-5">
            <RevealMedia
              duration={1.4}
              className="relative w-full aspect-[1366/743] overflow-hidden"
            >
              <div ref={kaartRef} className="absolute inset-0 bg-[#eeebe4]">
                {kaartInView ? (
                  <GebouwMap
                    lat={project.mapLat}
                    lng={project.mapLng}
                    projectName={project.naam}
                  />
                ) : null}
              </div>
            </RevealMedia>
            <Reveal
              as="a"
              delay={0.9}
              y={10}
              href={`https://www.google.com/maps/search/?api=1&query=${project.mapLat},${project.mapLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pill-hover absolute z-10 right-[2.569vw] bottom-[2.292vw] inline-flex items-center justify-center w-[11.181vw] h-[2.847vw] bg-off-black text-off-white no-underline rounded-full font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:right-3 max-lg:bottom-3 max-lg:w-auto max-lg:h-auto max-lg:px-4 max-lg:py-2 max-lg:text-[13px] max-lg:leading-normal"
            >
              Google Maps
            </Reveal>
          </RevealGroup>
        ) : project.mapImage ? (
          <RevealGroup className="relative mt-[7.986vw] mx-[2.431vw] max-lg:mt-8 max-lg:mx-5">
            {/* Bewust GEEN mix-blend-multiply meer op de kaart: Chrome trok
                die blend op compositing-niveau over de marker heen, waardoor
                kaartlijnen door het label en de tekst schenen. De kaart wordt
                zelf al in off-white-stijl gegenereerd, dus de blend voegde
                niets meer toe. */}
            <RevealMedia
              duration={1.4}
              className="relative w-full aspect-[1366/743] overflow-hidden"
            >
              <Image
                src={project.mapImage}
                alt={`Kaart van ${project.plaats}`}
                fill
                sizes="95vw"
                className="object-cover"
              />
            </RevealMedia>
            {/* De marker valt op de kaart zodra die onthuld is. Het anker
                (left/top) is de plek waar de PIN-PUNT prikt; de kaart wordt
                zo gegenereerd dat de projectlocatie exact op dit punt ligt.
                De translate zit op een binnen-div omdat Reveal de transform
                van zijn eigen element beheert. */}
            <Reveal
              delay={0.75}
              y={-18}
              duration={0.7}
              className="absolute z-10 left-[42%] top-[45.6%]"
            >
              <div className="flex -translate-x-1/2 -translate-y-full flex-col items-center">
                <span className="flex items-center bg-green text-off-white font-heading font-normal text-[1.667vw] leading-[2.056vw] tracking-[-0.033vw] h-[3.194vw] px-[1.111vw] max-lg:text-[13px] max-lg:h-auto max-lg:px-3 max-lg:py-1.5 max-lg:leading-normal">
                  {project.naam}
                </span>
                {/* relative -z-10: de gedraaide punt hoort ACHTER het label;
                    als latere sibling rendert zijn geroteerde laag anders
                    vlekkerig over de labeltekst heen. */}
                <span className="relative -z-10 -mt-[1.111vw] size-[2.153vw] rotate-45 bg-green max-lg:size-[10px] max-lg:-mt-[6px]" />
              </div>
            </Reveal>
            {project.mapLat && project.mapLng ? (
              <Reveal
                as="a"
                delay={0.9}
                y={10}
                href={`https://www.google.com/maps/search/?api=1&query=${project.mapLat},${project.mapLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-hover absolute z-10 right-[2.569vw] bottom-[2.292vw] inline-flex items-center justify-center w-[11.181vw] h-[2.847vw] bg-off-black text-off-white no-underline rounded-full font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:right-3 max-lg:bottom-3 max-lg:w-auto max-lg:h-auto max-lg:px-4 max-lg:py-2 max-lg:text-[13px] max-lg:leading-normal"
              >
                Google Maps
              </Reveal>
            ) : null}
          </RevealGroup>
        ) : null}
      </div>
      </Statisch>
      ) : null}

      {project.planning?.length ? (
        <ProjectPlanning fases={project.planning} />
      ) : null}

      <DownloadsSection items={project.downloads ?? []} />

      {/* Nieuws en updates — Figma: op wit, titel 128 onder de groene band,
          rijen van 208 (foto 27 boven/28 onder de lijnen), kop op x=496 */}
      {nieuws.length > 0 ? (
        <div id="nieuws" className="bg-white pt-[8.889vw] pb-[15.625vw] max-lg:py-12 scroll-mt-[2vw]" data-nav-theme="white">
          <div className="px-[2.5vw] max-lg:px-5">
            <h2 className="font-heading font-normal text-[4.931vw] leading-[6.076vw] tracking-[-0.099vw] text-off-black max-lg:text-[34px] max-lg:leading-[1.1] max-lg:tracking-[-0.68px]">
              <RevealWords text="Nieuws en updates" />
            </h2>
            <div className="mt-[4.931vw] max-lg:mt-8">
              {/* De borders blijven (transparant) voor exact dezelfde layout;
                  de zichtbare lijnen tekenen zichzelf via RevealLine. */}
              {nieuws.map((bericht, i) => (
                <RevealGroup
                  as="a"
                  key={bericht.slug}
                  href={`/wonenbij/nieuws/${bericht.slug}`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                    navigate(e, `/wonenbij/nieuws/${bericht.slug}`)
                  }
                  className={`relative grid grid-cols-12 gap-x-[1.389vw] items-start border-t border-transparent pt-[1.875vw] pb-[1.944vw] no-underline group max-lg:flex max-lg:flex-col max-lg:gap-y-3 max-lg:py-5 ${
                    i === nieuws.length - 1 ? "border-b" : ""
                  }`}
                >
                  <RevealLine className="absolute inset-x-0 top-[-1px] h-px bg-off-black/40" />
                  {i === nieuws.length - 1 ? (
                    <RevealLine
                      delay={0.15}
                      className="absolute inset-x-0 bottom-[-1px] h-px bg-off-black/40"
                    />
                  ) : null}
                  <Reveal
                    as="p"
                    delay={0.1}
                    y={16}
                    className="col-span-3 mt-[0.972vw] font-heading font-normal text-[1.389vw] leading-[1.715vw] text-off-black max-lg:mt-0 max-lg:text-[15px] max-lg:leading-[20px]"
                  >
                    {bericht.datum}
                  </Reveal>
                  <Reveal
                    delay={0.15}
                    y={16}
                    className="col-span-6 col-start-5 mt-[0.278vw] max-lg:mt-0"
                  >
                    <p className="max-w-[32.778vw] font-body font-medium text-[2.639vw] leading-[2.708vw] text-off-black max-lg:max-w-none max-lg:text-[20px] max-lg:leading-[24px]">
                      {bericht.titel}
                    </p>
                    <span className="link-underline group-underline [--underline-h:1px] inline-block mt-[1.944vw] font-body font-medium text-[0.972vw] leading-[1.125vw] text-off-black border-b border-transparent pb-[0.417vw] max-lg:mt-3 max-lg:text-[13px] max-lg:leading-normal">
                      Lees bericht
                    </span>
                  </Reveal>
                  {bericht.image ? (
                    <Reveal
                      delay={0.2}
                      y={16}
                      className="col-span-2 col-start-11 justify-self-end w-[16.458vw] max-lg:order-first max-lg:w-full"
                    >
                      <div className="relative w-full aspect-[237/153] overflow-hidden">
                        <Image
                          src={bericht.image}
                          alt={bericht.titel}
                          fill
                          sizes="(max-width: 768px) 100vw, 17vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        />
                      </div>
                    </Reveal>
                  ) : null}
                </RevealGroup>
              ))}
            </div>
            {/* Verwijzing naar de social-kanalen (feedback Wikke, 3 sep 2026):
                tekst met logo-links, alleen voor kanalen met een URL in de
                site-instellingen. */}
            {socialKanalen.length ? (
              <Reveal
                delay={0.1}
                className="mt-[2.917vw] flex flex-wrap items-center gap-x-[1.111vw] gap-y-[0.833vw] max-lg:mt-8 max-lg:gap-x-4 max-lg:gap-y-3"
              >
                <p className="font-body font-medium text-[1.111vw] leading-[1.667vw] tracking-[-0.022vw] text-off-black max-lg:text-[15px] max-lg:leading-[22px]">
                  Blijf op de hoogte van de laatste ontwikkelingen via
                </p>
                <ul className="flex items-center gap-[0.833vw] list-none m-0 p-0 max-lg:gap-3">
                  {socialKanalen.map(({ label, href, Icoon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${label} van Weverskade (opent in een nieuw venster)`}
                        className="flex items-center justify-center size-[2.222vw] text-off-black transition-opacity duration-300 hover:opacity-60 max-lg:size-[36px]"
                      >
                        <Icoon className="size-[1.528vw] max-lg:size-[22px]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>
        </div>
      ) : null}

      {project.faq?.length ? <FaqSection items={project.faq} /> : null}

      {/* Bewust statisch (geen scroll-reveal) voor ritme tussen de secties. */}
      <Statisch>
      <InschrijfForm
        label="Beschikbaarheid"
        heading="Interesse in dit project?"
        intro="Schrijf je vrijblijvend in en laat je gegevens achter. We houden je op de hoogte van de beschikbaarheid en de vervolgstappen."
        projectName={project.naam}
        projectSlug={project.slug}
        voorkeurOpties={project.woningTypes.map((t) => t.naam)}
        voorkeurLabel="Selecteer voorkeurstype woning"
      />
      </Statisch>
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

function HurenCarousel({
  titel,
  naam,
  fotos,
}: {
  titel: string;
  naam: string;
  fotos: string[];
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const stap = (richting: number) =>
    setIndex((i) => (i + richting + fotos.length) % fotos.length);

  return (
    // Figma: titel 139 onder de groene band (x=32), foto 1368×810 op x=35, 34 onder de titel
    <div className="pt-[9.653vw] max-lg:py-10" data-nav-theme="white">
      <h2 className="px-[2.222vw] font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-black max-lg:px-5 max-lg:text-[30px] max-lg:leading-[1.1] max-lg:tracking-[-0.6px]">
        <RevealWords text={titel} />
      </h2>
      <RevealGroup className="relative mt-[2.361vw] mx-[2.431vw] max-lg:mt-5 max-lg:mx-5">
        <RevealMedia
          duration={1.4}
          className="relative w-full aspect-[1368/810] overflow-hidden max-lg:aspect-[4/3]"
          onTouchStart={(e: React.TouchEvent) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e: React.TouchEvent) => {
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
              aria-hidden={i !== index}
              className={`object-cover transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {fotos.length > 1 ? (
            <span className="sr-only" aria-live="polite">
              Foto {index + 1} van {fotos.length}
            </span>
          ) : null}
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
        </RevealMedia>
        {fotos.length > 1 ? (
          <>
            <CarouselKnop richting="vorige" onClick={() => stap(-1)} />
            <CarouselKnop richting="volgende" onClick={() => stap(1)} />
          </>
        ) : null}
      </RevealGroup>
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
    // Reveal (fade, y=0) volgt de RevealGroup van de carrousel zodat de
    // pijlen pas verschijnen als de foto onthuld is.
    <Reveal
      as="button"
      y={0}
      delay={0.9}
      onClick={onClick}
      aria-label={links ? "Vorige foto" : "Volgende foto"}
      className={`pill-hover absolute top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white text-off-black cursor-pointer border-none max-lg:size-11 ${
        links ? "left-[1.181vw] max-lg:left-3" : "right-[1.181vw] max-lg:right-3"
      }`}
    >
      <PijlIcon
        className={`w-[1.389vw] h-auto max-lg:w-[16px] ${
          links ? "rotate-180" : ""
        }`}
      />
    </Reveal>
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
    <RevealGroup className="mt-[3.681vw] max-w-[42.014vw] max-lg:mt-7 max-lg:max-w-none">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={item.titel}
            className={`relative border-t border-transparent ${
              i === items.length - 1 ? "border-b" : ""
            }`}
          >
            <RevealLine
              delay={i * 0.08}
              className="absolute inset-x-0 top-[-1px] h-px bg-off-black/40"
            />
            {i === items.length - 1 ? (
              <RevealLine
                delay={i * 0.08 + 0.15}
                className="absolute inset-x-0 bottom-[-1px] h-px bg-off-black/40"
              />
            ) : null}
            <Reveal
              as="button"
              delay={0.1 + i * 0.08}
              y={16}
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              id={`locatie-knop-${i}`}
              aria-controls={`locatie-paneel-${i}`}
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
            </Reveal>
            <div
              id={`locatie-paneel-${i}`}
              role="region"
              aria-labelledby={`locatie-knop-${i}`}
              className="grid"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                transition: "grid-template-rows 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* inert houdt dichte content uit de accessibility tree
                  zonder de 0fr-animatie te raken */}
              <div className="overflow-hidden" inert={!open}>
                <p
                  className="pb-[2.361vw] max-w-[40.417vw] font-body font-medium text-[0.972vw] leading-[1.528vw] tracking-[-0.019vw] text-off-black max-lg:pb-4 max-lg:max-w-none max-lg:text-[14px] max-lg:leading-[21px]"
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 0.5s ${EASE} ${open ? "0.1s" : "0s"}, transform 0.5s ${EASE} ${open ? "0.1s" : "0s"}`,
                  }}
                >
                  {item.tekst}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </RevealGroup>
  );
}
