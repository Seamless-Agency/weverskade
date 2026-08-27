"use client";

import { useState } from "react";
import Image from "next/image";
import WonenBijHeader from "@/components/wonenbij/WonenBijHeader";
import ProjectPlanning from "@/components/wonenbij/ProjectPlanning";
import DownloadsSection from "@/components/wonenbij/DownloadsSection";
import InschrijfForm from "@/components/wonenbij/InschrijfForm";
import { PijlIcon } from "@/components/wonenbij/icons";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { formatPrijs, type WonenBijProject, type WoningType } from "@/data/wonenbij";

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
  const [fotoIndex, setFotoIndex] = useState(0);
  const [plattegrondIndex, setPlattegrondIndex] = useState(0);
  const [omschrijvingOpen, setOmschrijvingOpen] = useState(false);

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
      <div className="relative pt-[13.472vw] pb-[10.625vw] max-md:pt-[90px] max-md:pb-12">
        <WonenBijHeader
          variant="donker"
          ctaLabel="Terug naar overzicht"
          ctaHref={projectHref}
          ctaArrow
        />

        {/* Woningdetail: foto's links, specificaties rechts */}
        <div className="grid grid-cols-[46.944vw_1fr] gap-x-[7.5vw] pl-[2.361vw] pr-[2.431vw] max-md:grid-cols-1 max-md:px-5 max-md:gap-y-8">
          <div>
            <div className="relative w-full aspect-[676/482] overflow-hidden">
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
              {type.fotos.length > 1 ? (
                <CarouselPijlen
                  aantal={type.fotos.length}
                  onStap={(richting) =>
                    setFotoIndex(
                      (i) => (i + richting + type.fotos.length) % type.fotos.length
                    )
                  }
                />
              ) : null}
            </div>

            {/* Plattegrond — Figma: witte kaart, titel op (38,47), tekening
                469 breed gecentreerd, pijlen op de kaartranden */}
            {type.plattegronden.length > 0 ? (
              <div className="relative mt-[2.708vw] bg-white pt-[3.264vw] pb-[4.722vw] max-md:mt-6 max-md:p-5">
                <p className="pl-[2.639vw] font-heading font-normal text-[1.389vw] leading-[1.715vw] text-off-black max-md:pl-0 max-md:text-[16px] max-md:leading-none">
                  {type.plattegrondLabel ?? "Plattegrond"}
                </p>
                <div className="relative mt-[1.875vw] mx-[7.153vw] aspect-[469/341] max-md:mt-4 max-md:mx-0">
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
                </div>
                {type.plattegronden.length > 1 ? (
                  <CarouselPijlen
                    aantal={type.plattegronden.length}
                    onStap={(richting) =>
                      setPlattegrondIndex(
                        (i) =>
                          (i + richting + type.plattegronden.length) %
                          type.plattegronden.length
                      )
                    }
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          <div>
            <p className="font-heading font-normal text-[1.389vw] leading-[1.715vw] text-off-black max-md:text-[16px] max-md:leading-none">
              {project.naam}
            </p>
            <h1 className="mt-[0.646vw] font-body font-medium text-[2.639vw] leading-[2.708vw] text-off-black max-md:mt-2 max-md:text-[26px] max-md:leading-[30px]">
              {type.naam}
            </h1>

            {/* Specificaties met iconen — kolommen op 196px-pitch, tekst 32
                rechts van de kolomrand, rijritme 40px (rij is 22 door het icoon) */}
            <div className="mt-[3.125vw] grid grid-cols-[13.611vw_1fr] gap-y-[1.25vw] max-md:mt-6 max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-4">
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
            </div>

            {/* Omschrijving */}
            <div className="mt-[2.986vw] max-w-[29.792vw] max-md:mt-6 max-md:max-w-none">
              {zichtbareBlokken.map((blok) => (
                <div key={blok.kop} className="mb-[1.667vw] max-md:mb-4">
                  <p className="font-body font-semibold text-[1.111vw] leading-[1.667vw] tracking-[-0.022vw] text-off-black max-md:text-[15px] max-md:leading-[22px]">
                    {blok.kop}
                  </p>
                  <p className="font-body font-medium text-[1.111vw] leading-[1.667vw] tracking-[-0.022vw] text-off-black max-md:text-[15px] max-md:leading-[22px]">
                    {blok.tekst}
                  </p>
                </div>
              ))}
              {type.omschrijving.length > 2 ? (
                <button
                  onClick={() => setOmschrijvingOpen((v) => !v)}
                  className="font-body font-medium text-[0.972vw] leading-[1.125vw] text-off-black border-b border-off-black pb-[0.417vw] cursor-pointer bg-transparent border-x-0 border-t-0 p-0 max-md:text-[13px] max-md:leading-normal"
                >
                  {omschrijvingOpen ? "Lees minder" : "Lees meer"}
                </button>
              ) : null}
            </div>

            {/* Acties — Figma: knoppen 36 hoog, 69 onder de lees-meer-lijn */}
            <div className="mt-[4.792vw] flex gap-[1.181vw] max-md:mt-6 max-md:flex-wrap max-md:gap-3">
              <a
                href="#inschrijven"
                onClick={scrollNaarInschrijven}
                className="flex items-center h-[2.5vw] bg-green text-off-white no-underline rounded-full px-[1.319vw] font-heading font-normal text-[0.972vw] leading-[1.201vw] tracking-[-0.019vw] max-md:h-auto max-md:px-5 max-md:py-2.5 max-md:text-[14px] max-md:leading-normal"
              >
                Schrijf je nu in
              </a>
              {volgendeTypeSlug ? (
                <a
                  href={`/wonenbij/${project.slug}/${volgendeTypeSlug}`}
                  onClick={(e) =>
                    navigate(e, `/wonenbij/${project.slug}/${volgendeTypeSlug}`)
                  }
                  className="flex items-center h-[2.5vw] gap-[0.625vw] bg-off-black text-off-white no-underline rounded-full pl-[1.181vw] pr-[1.458vw] font-heading font-normal text-[0.972vw] leading-[1.201vw] tracking-[-0.019vw] max-md:h-auto max-md:px-5 max-md:py-2.5 max-md:text-[14px] max-md:leading-normal"
                >
                  Volgende type
                  <PijlIcon className="w-[1.528vw] h-auto max-md:w-[14px]" />
                </a>
              ) : null}
            </div>
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
      <div className="bg-off-white pl-[2.5vw] pb-[10.208vw] max-md:px-5 max-md:pb-12">
        <a
          href={projectHref}
          onClick={(e) => navigate(e, projectHref)}
          className="inline-flex items-center h-[3.194vw] gap-[0.833vw] bg-green text-off-white no-underline rounded-full pl-[1.875vw] pr-[1.528vw] max-md:h-auto max-md:px-5 max-md:py-2.5"
        >
          <PijlIcon className="w-[1.528vw] h-auto rotate-180 max-md:w-[16px]" />
          <span className="font-heading font-normal text-[1.181vw] leading-[1.458vw] tracking-[-0.024vw] max-md:text-[14px] max-md:leading-normal">
            Terug naar het project
          </span>
        </a>
      </div>
    </section>
  );
}

function Spec({ icoon, tekst }: { icoon: string; tekst: string }) {
  // Figma: icoon links op de kolomrand, tekst op +32 (14px GT 500 lh 16.2).
  return (
    <div className="flex items-center max-md:gap-3">
      <div className="w-[2.222vw] shrink-0 flex justify-start items-center max-md:w-auto">
        <Image
          src={`/images/wonenbij/icons/${icoon}`}
          alt=""
          width={22}
          height={22}
          className="w-[1.528vw] h-[1.528vw] object-contain max-md:w-[18px] max-md:h-[18px]"
        />
      </div>
      <span className="font-body font-medium text-[0.972vw] leading-[1.125vw] text-off-black max-md:text-[14px] max-md:leading-normal">
        {tekst}
      </span>
    </div>
  );
}

function CarouselPijlen({
  aantal,
  onStap,
}: {
  aantal: number;
  onStap: (richting: number) => void;
}) {
  if (aantal < 2) return null;
  return (
    <>
      <button
        onClick={() => onStap(-1)}
        aria-label="Vorige"
        className="absolute left-[1.319vw] top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white cursor-pointer border-none transition-opacity duration-200 hover:opacity-80 max-md:size-[36px] max-md:left-3"
      >
        <PijlIcon className="w-[1.389vw] h-auto rotate-180 text-off-black max-md:w-[16px]" />
      </button>
      <button
        onClick={() => onStap(1)}
        aria-label="Volgende"
        className="absolute right-[1.528vw] top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white cursor-pointer border-none transition-opacity duration-200 hover:opacity-80 max-md:size-[36px] max-md:right-3"
      >
        <PijlIcon className="w-[1.389vw] h-auto text-off-black max-md:w-[16px]" />
      </button>
    </>
  );
}
