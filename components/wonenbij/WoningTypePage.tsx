"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import WonenBijHeader from "@/components/wonenbij/WonenBijHeader";
import ProjectPlanning from "@/components/wonenbij/ProjectPlanning";
import DownloadsSection from "@/components/wonenbij/DownloadsSection";
import InschrijfForm from "@/components/wonenbij/InschrijfForm";
import { PijlIcon } from "@/components/wonenbij/icons";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { formatPrijs, type WonenBijProject, type WoningType } from "@/data/wonenbij";
import {
  Reveal,
  RevealMedia,
  RevealWords,
  useHeroIntro,
} from "@/components/wonenbij/motion";

interface WoningTypePageProps {
  project: WonenBijProject;
  type: WoningType;
  /** Slug van het volgende woningtype binnen het project. */
  volgendeTypeSlug?: string;
  /** Voorgeselecteerde woning (bouwnummer) vanaf de render-overlay. */
  voorgeselecteerdeWoning?: string;
}

/**
 * Woningpagina van een woningtype - Figma "Woningpagina / overlay"
 * (update 23 juli 2026).
 */
export default function WoningTypePage({
  project,
  type,
  volgendeTypeSlug,
  voorgeselecteerdeWoning,
}: WoningTypePageProps) {
  const navigate = usePageNavigation();
  const intro = useHeroIntro();
  const [fotoIndex, setFotoIndex] = useState(0);
  const [plattegrondIndex, setPlattegrondIndex] = useState(0);
  const [omschrijvingOpen, setOmschrijvingOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const stapFoto = (richting: number) =>
    setFotoIndex((i) => (i + richting + type.fotos.length) % type.fotos.length);
  const stapPlattegrond = (richting: number) =>
    setPlattegrondIndex(
      (i) =>
        (i + richting + type.plattegronden.length) % type.plattegronden.length
    );

  const fotoSwipe = useSwipe(stapFoto);
  const plattegrondSwipe = useSwipe(stapPlattegrond);

  // Sluit de plattegrond-lightbox met Escape; bevries de pagina-scroll en
  // centreer de (op mobiel uitvergrote) tekening in beeld.
  const lightboxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lightboxOpen) return;
    const vorige = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const el = lightboxRef.current;
    if (el) {
      el.scrollTo(
        (el.scrollWidth - el.clientWidth) / 2,
        (el.scrollHeight - el.clientHeight) / 2
      );
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = vorige;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen]);

  const projectHref = `/wonenbij/${project.slug}`;
  const zichtbareBlokken = omschrijvingOpen
    ? type.omschrijving
    : type.omschrijving.slice(0, 2);

  const prijsLabel = type.prijsTot
    ? `${formatPrijs(type.prijsVan)} - ${formatPrijs(type.prijsTot)} /maand`
    : `${formatPrijs(type.prijsVan)} /maand`;

  const inschrijfOpties = [
    type.naam,
    ...project.woningen
      .filter((w) => w.woningType === type.naam)
      .map((w) => `${w.nummer} - ${type.naam}`),
  ];

  const voorkeurPreselect = voorgeselecteerdeWoning
    ? inschrijfOpties.find((o) => o.startsWith(voorgeselecteerdeWoning)) ?? type.naam
    : type.naam;

  const scrollNaarInschrijven = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document
      .getElementById("inschrijven")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    // Figma "Woningpagina / overlay" (frame 1:8): foto links op (34,194),
    // rechterkolom op x=818, plattegrondkaart 39 onder de foto, 153 wit
    // tussen de kaart en de planningband.
    <section className="bg-off-white min-h-screen">
      <div className="relative pt-[13.472vw] pb-[10.625vw] max-lg:pt-[90px] max-lg:pb-12">
        <WonenBijHeader
          variant="donker"
          ctaLabel="Terug naar overzicht"
          ctaHref={projectHref}
          ctaArrow
        />

        {/* Woningdetail: foto's links, specificaties rechts */}
        <div className="grid grid-cols-[46.944vw_1fr] gap-x-[7.5vw] pl-[2.361vw] pr-[2.431vw] max-lg:grid-cols-1 max-lg:px-5 max-lg:gap-y-8">
          {/* Mobiel: de linkerkolom valt uiteen (contents) zodat de
              plattegrondkaart via order ná de tekstkolom komt. */}
          <div className="max-lg:contents">
            <div
              className="relative w-full aspect-[676/482] overflow-hidden max-lg:order-1 max-lg:touch-pan-y"
              {...(type.fotos.length > 1 ? fotoSwipe : {})}
            >
              {/* Clip-reveal alleen om de foto's; de pijlen blijven erbuiten
                  zodat ze niet meeschalen tijdens de entrance. */}
              <RevealMedia when={intro} className="absolute inset-0">
                {type.fotos.map((foto, i) => (
                  <Image
                    key={foto + i}
                    src={foto}
                    alt={`${type.naam} - foto ${i + 1}`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, 47vw"
                    className={`object-cover transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      i === fotoIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </RevealMedia>
              {type.fotos.length > 1 ? (
                <CarouselPijlen
                  aantal={type.fotos.length}
                  actief={fotoIndex}
                  onStap={stapFoto}
                  when={intro}
                />
              ) : null}
            </div>

            {/* Plattegrond — Figma: witte kaart, titel op (38,47), tekening
                469 breed gecentreerd, pijlen op de kaartranden */}
            {type.plattegronden.length > 0 ? (
              <Reveal className="relative mt-[2.708vw] bg-white pt-[3.264vw] pb-[4.722vw] max-lg:order-3 max-lg:mt-0 max-lg:p-5">
                <p className="pl-[2.639vw] font-heading font-normal text-[1.389vw] leading-[1.715vw] text-off-black max-lg:pl-0 max-lg:text-[16px] max-lg:leading-[1.1]">
                  {type.plattegrondLabel ?? "Plattegrond"}
                  {type.plattegronden.length > 1 ? (
                    <span className="hidden max-lg:inline ml-2 font-body font-medium text-[12px] leading-none text-off-black/50 align-middle">
                      {plattegrondIndex + 1}/{type.plattegronden.length}
                    </span>
                  ) : null}
                </p>
                <div
                  className="relative mt-[1.875vw] mx-[7.153vw] aspect-[469/341] max-lg:mt-4 max-lg:mx-0 max-lg:touch-pan-y"
                  {...(type.plattegronden.length > 1 ? plattegrondSwipe : {})}
                >
                  {type.plattegronden.map((plattegrond, i) => (
                    <Image
                      key={plattegrond + i}
                      src={plattegrond}
                      alt={`${type.naam} - plattegrond ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 90vw, 40vw"
                      className={`object-contain transition-opacity duration-500 ${
                        i === plattegrondIndex ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ))}
                  {/* Onzichtbaar tikvlak dat de lightbox opent; laat de
                      desktop-rendering volledig ongemoeid. */}
                  <button
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Bekijk plattegrond op volledig scherm"
                    className="absolute inset-0 bg-transparent border-none p-0 m-0 cursor-zoom-in"
                  />
                </div>
                {type.plattegronden.length > 1 ? (
                  <CarouselPijlen
                    aantal={type.plattegronden.length}
                    actief={plattegrondIndex}
                    dotVariant="donker"
                    onStap={stapPlattegrond}
                  />
                ) : null}
              </Reveal>
            ) : null}
          </div>

          <div className="max-lg:order-2">
            <Reveal
              as="p"
              when={intro}
              delay={0.15}
              y={16}
              className="font-heading font-normal text-[1.389vw] leading-[1.715vw] text-off-black max-lg:text-[16px] max-lg:leading-[1.1]"
            >
              {project.naam}
            </Reveal>
            <h1 className="mt-[0.646vw] font-body font-medium text-[2.639vw] leading-[2.708vw] text-off-black max-lg:mt-2 max-lg:text-[26px] max-lg:leading-[30px]">
              <RevealWords text={type.naam} when={intro} delay={0.2} />
            </h1>

            {/* Specificaties met iconen — kolommen op 196px-pitch, tekst 32
                rechts van de kolomrand, rijritme 40px (rij is 22 door het icoon) */}
            <Reveal
              when={intro}
              delay={0.35}
              y={20}
              className="mt-[3.125vw] grid grid-cols-[13.611vw_1fr] gap-y-[1.25vw] max-lg:mt-6 max-lg:grid-cols-2 max-lg:gap-x-4 max-lg:gap-y-4 max-lg:items-start"
            >
              <Spec icoon="m2-klein.svg" tekst={`${type.oppervlakte} m² oppervlakte`} />
              <Spec icoon="key-klein.svg" tekst={prijsLabel} />
              <Spec icoon="bed-klein.svg" tekst={`${type.slaapkamers} slaapkamers`} />
              {type.energielabel ? (
                <Spec icoon="leaf-klein.svg" tekst={`${type.energielabel} energielabel`} />
              ) : null}
              {type.buitenruimte ? (
                <Spec icoon="buitenruimte-klein.svg" tekst={type.buitenruimte} />
              ) : null}
              <Spec icoon="inschrijven.svg" tekst="Inschrijven mogelijk" />
            </Reveal>

            {/* Omschrijving */}
            <Reveal
              when={intro}
              delay={0.45}
              y={20}
              className="mt-[2.986vw] max-w-[29.792vw] max-lg:mt-6 max-lg:max-w-none"
            >
              {zichtbareBlokken.map((blok) => (
                <div key={blok.kop} className="mb-[1.667vw] max-lg:mb-4">
                  <p className="font-body font-semibold text-[1.111vw] leading-[1.667vw] tracking-[-0.022vw] text-off-black max-lg:text-[15px] max-lg:leading-[22px]">
                    {blok.kop}
                  </p>
                  <p className="font-body font-medium text-[1.111vw] leading-[1.667vw] tracking-[-0.022vw] text-off-black max-lg:text-[15px] max-lg:leading-[22px]">
                    {blok.tekst}
                  </p>
                </div>
              ))}
              {type.omschrijving.length > 2 ? (
                <button
                  onClick={() => setOmschrijvingOpen((v) => !v)}
                  className="font-body font-medium text-[0.972vw] leading-[1.125vw] text-off-black cursor-pointer bg-transparent border-none p-0 max-lg:text-[13px] max-lg:leading-normal max-lg:px-3 max-lg:py-2.5 max-lg:-mx-3 max-lg:-my-2.5"
                >
                  <span className="link-underline [--underline-h:1px] inline-block border-b border-transparent pb-[0.417vw] max-lg:pb-1">
                    {omschrijvingOpen ? "Lees minder" : "Lees meer"}
                  </span>
                </button>
              ) : null}
            </Reveal>

            {/* Acties — Figma: knoppen 36 hoog, 69 onder de lees-meer-lijn */}
            <Reveal
              when={intro}
              delay={0.55}
              y={20}
              className="mt-[4.792vw] flex gap-[1.181vw] max-lg:mt-6 max-lg:flex-wrap max-lg:gap-3"
            >
              <a
                href="#inschrijven"
                onClick={scrollNaarInschrijven}
                className="pill-hover flex items-center h-[2.5vw] bg-green text-off-white no-underline rounded-full px-[1.319vw] font-heading font-normal text-[0.972vw] leading-[1.201vw] tracking-[-0.019vw] max-lg:h-[44px] max-lg:px-5 max-lg:text-[14px] max-lg:leading-normal"
              >
                Schrijf je nu in
              </a>
              {volgendeTypeSlug ? (
                <a
                  href={`/wonenbij/${project.slug}/${volgendeTypeSlug}`}
                  onClick={(e) =>
                    navigate(e, `/wonenbij/${project.slug}/${volgendeTypeSlug}`)
                  }
                  className="pill-hover group flex items-center h-[2.5vw] gap-[0.625vw] bg-off-black text-off-white no-underline rounded-full pl-[1.181vw] pr-[1.458vw] font-heading font-normal text-[0.972vw] leading-[1.201vw] tracking-[-0.019vw] max-lg:h-[44px] max-lg:px-5 max-lg:text-[14px] max-lg:leading-normal"
                >
                  Volgende type
                  <PijlIcon className="w-[1.528vw] h-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[0.3vw] max-lg:w-[14px]" />
                </a>
              ) : null}
            </Reveal>
          </div>
        </div>
      </div>

      <ProjectPlanning fases={project.planning} />

      <DownloadsSection items={project.downloads} />

      <InschrijfForm
        variant="woning"
        heading="Interesse in deze woning?"
        intro="Schrijf u vrijblijvend in als geïnteresseerde voor dit project. Geef aan welk woningtype of welke specifieke woning uw voorkeur heeft en vul uw gegevens in. Zo kunnen wij u gericht informeren over het actuele aanbod en toekomstige beschikbaarheid."
        projectName={project.naam}
        projectSlug={project.slug}
        voorkeurOpties={inschrijfOpties}
        voorkeurLabel="Woning voorgeselecteerd"
        voorkeurPreselect={voorkeurPreselect}
      />

      {/* Figma: groene terugknop 242×46 op x=36, 147 boven de footer */}
      <div className="bg-off-white pl-[2.5vw] pb-[10.208vw] max-lg:px-5 max-lg:pb-12">
        <Reveal
          as="a"
          href={projectHref}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => navigate(e, projectHref)}
          className="pill-hover group inline-flex items-center h-[3.194vw] gap-[0.833vw] bg-green text-off-white no-underline rounded-full pl-[1.875vw] pr-[1.528vw] max-lg:h-auto max-lg:px-5 max-lg:py-2.5"
        >
          <PijlIcon className="w-[1.528vw] h-auto rotate-180 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-[0.3vw] max-lg:w-[16px]" />
          <span className="font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-lg:text-[14px] max-lg:leading-normal">
            Terug naar het project
          </span>
        </Reveal>
      </div>

      {/* Plattegrond-lightbox: fullscreen overlay. Op mobiel wordt de
          tekening groter dan het scherm gerenderd in een scrolbare
          container zodat details leesbaar zijn. */}
      {lightboxOpen && type.plattegronden.length > 0 ? (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Plattegrond vergroot"
          className="fixed inset-0 z-50 bg-off-white overflow-auto overscroll-contain menu-overlay-in"
        >
          <div className="relative w-full h-full max-lg:w-[180vw] max-lg:h-[130vh] menu-item-in">
            <Image
              src={type.plattegronden[plattegrondIndex]}
              alt={`${type.naam} - plattegrond vergroot`}
              fill
              sizes="180vw"
              className="object-contain"
            />
          </div>
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Sluiten"
            className="pill-hover fixed top-5 right-5 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white border border-off-black/15 cursor-pointer max-lg:size-[44px] max-lg:top-4 max-lg:right-4"
          >
            <span className="font-body font-medium text-[1.111vw] leading-none text-off-black max-lg:text-[18px]">
              ✕
            </span>
          </button>
        </div>
      ) : null}
    </section>
  );
}

/** Horizontale swipe (>=40px) op touch: -1 = vorige, 1 = volgende. */
function useSwipe(onStap: (richting: number) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return;
      const dx = e.changedTouches[0].clientX - start.current.x;
      const dy = e.changedTouches[0].clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
        onStap(dx < 0 ? 1 : -1);
      }
    },
  };
}

function Spec({ icoon, tekst }: { icoon: string; tekst: string }) {
  // Figma: icoon links op de kolomrand, tekst op +32 (14px GT 500 lh 16.2).
  return (
    <div className="flex items-center max-lg:gap-3">
      <div className="w-[2.222vw] shrink-0 flex justify-start items-center max-lg:w-auto">
        <Image
          src={`/images/wonenbij/icons/${icoon}`}
          alt=""
          width={22}
          height={22}
          className="w-[1.528vw] h-[1.528vw] object-contain max-lg:w-[18px] max-lg:h-[18px]"
        />
      </div>
      <span className="font-body font-medium text-[0.972vw] leading-[1.125vw] text-off-black max-lg:text-[14px] max-lg:leading-normal">
        {tekst}
      </span>
    </div>
  );
}

function CarouselPijlen({
  aantal,
  actief,
  onStap,
  dotVariant = "licht",
  when,
}: {
  aantal: number;
  actief: number;
  onStap: (richting: number) => void;
  /** "licht" = off-white dots (op foto), "donker" = off-black (op witte kaart). */
  dotVariant?: "licht" | "donker";
  /** Expliciete reveal-trigger (bv. de hero-intro); anders eigen observer. */
  when?: boolean;
}) {
  if (aantal < 2) return null;
  const dotKleur = dotVariant === "licht" ? "bg-off-white" : "bg-off-black";
  return (
    <>
      <Reveal
        as="button"
        when={when}
        y={0}
        delay={0.9}
        onClick={() => onStap(-1)}
        aria-label="Vorige"
        className="pill-hover absolute left-[1.319vw] top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white cursor-pointer border-none max-lg:size-[44px] max-lg:left-3"
      >
        <PijlIcon className="w-[1.389vw] h-auto rotate-180 text-off-black max-lg:w-[16px]" />
      </Reveal>
      <Reveal
        as="button"
        when={when}
        y={0}
        delay={0.9}
        onClick={() => onStap(1)}
        aria-label="Volgende"
        className="pill-hover absolute right-[1.528vw] top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white cursor-pointer border-none max-lg:size-[44px] max-lg:right-3"
      >
        <PijlIcon className="w-[1.389vw] h-auto text-off-black max-lg:w-[16px]" />
      </Reveal>
      {/* Positie-dots, alleen mobiel (desktop blijft exact Figma). */}
      <div
        aria-hidden="true"
        className="hidden max-lg:flex absolute bottom-3 left-1/2 -translate-x-1/2 gap-[6px]"
      >
        {Array.from({ length: aantal }, (_, i) => (
          <span
            key={i}
            className={`size-[6px] rounded-full ${dotKleur} ${
              i === actief ? "" : "opacity-40"
            }`}
          />
        ))}
      </div>
    </>
  );
}
