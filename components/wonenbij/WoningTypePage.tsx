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
    <section className="bg-off-white min-h-screen">
      <div className="relative pt-[9.028vw] max-md:pt-[90px]">
        <WonenBijHeader
          variant="donker"
          ctaLabel="Terug naar overzicht"
          ctaHref={projectHref}
          ctaArrow
        />

        {/* Woningdetail: foto's links, specificaties rechts */}
        <div className="grid grid-cols-12 gap-x-[1.389vw] px-[2.431vw] max-md:grid-cols-1 max-md:px-5 max-md:gap-y-8">
          <div className="col-span-6">
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

            {/* Plattegrond */}
            {type.plattegronden.length > 0 ? (
              <div className="mt-[2.5vw] bg-white p-[2.639vw] max-md:mt-6 max-md:p-5">
                <p className="font-heading font-normal text-[1.389vw] leading-none text-off-black max-md:text-[16px]">
                  {type.plattegrondLabel ?? "Plattegrond"}
                </p>
                <div className="relative mt-[1.667vw] w-full aspect-[469/341] max-md:mt-4">
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
              </div>
            ) : null}
          </div>

          <div className="col-span-5 col-start-8 max-md:col-start-1">
            <p className="font-heading font-normal text-[1.389vw] leading-none text-off-black max-md:text-[16px]">
              {project.naam}
            </p>
            <h1 className="mt-[0.556vw] font-body font-medium text-[2.639vw] leading-[2.708vw] text-off-black max-md:mt-2 max-md:text-[26px] max-md:leading-[30px]">
              {type.naam}
            </h1>

            {/* Specificaties met iconen */}
            <div className="mt-[3.472vw] grid grid-cols-2 gap-x-[2vw] gap-y-[1.667vw] max-md:mt-6 max-md:gap-y-4">
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
            <div className="mt-[2.917vw] max-w-[29.792vw] max-md:mt-6 max-md:max-w-none">
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
                  className="font-body font-medium text-[0.972vw] text-off-black border-b border-off-black pb-[0.14vw] cursor-pointer bg-transparent border-x-0 border-t-0 p-0 max-md:text-[13px]"
                >
                  {omschrijvingOpen ? "Lees minder" : "Lees meer"}
                </button>
              ) : null}
            </div>

            {/* Acties */}
            <div className="mt-[2.5vw] flex gap-[1.111vw] max-md:mt-6 max-md:flex-wrap max-md:gap-3">
              <a
                href="#inschrijven"
                onClick={scrollNaarInschrijven}
                className="bg-green text-off-white no-underline rounded-full px-[1.389vw] py-[0.625vw] font-heading font-normal text-[0.972vw] tracking-[-0.019vw] max-md:px-5 max-md:py-2.5 max-md:text-[14px]"
              >
                Schrijf je nu in
              </a>
              {volgendeTypeSlug ? (
                <a
                  href={`/wonenbij/${project.slug}/${volgendeTypeSlug}`}
                  onClick={(e) =>
                    navigate(e, `/wonenbij/${project.slug}/${volgendeTypeSlug}`)
                  }
                  className="flex items-center gap-[0.556vw] bg-off-black text-off-white no-underline rounded-full px-[1.389vw] py-[0.625vw] font-heading font-normal text-[0.972vw] tracking-[-0.019vw] max-md:px-5 max-md:py-2.5 max-md:text-[14px]"
                >
                  Volgende type
                  <PijlIcon className="w-[1.111vw] h-auto max-md:w-[14px]" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[5.556vw] max-md:mt-10">
        <ProjectPlanning fases={project.planning} />
      </div>

      <DownloadsSection items={project.downloads} />

      <InschrijfForm
        heading="Interesse in deze woning?"
        intro="Schrijf u vrijblijvend in als geïnteresseerde voor dit project. Geef aan welk woningtype of welke specifieke woning uw voorkeur heeft en vul uw gegevens in. Zo kunnen wij u gericht informeren over het actuele aanbod en toekomstige beschikbaarheid."
        projectName={project.naam}
        projectSlug={project.slug}
        voorkeurOpties={inschrijfOpties}
        voorkeurLabel="Woning voorgeselecteerd"
        voorkeurPreselect={voorkeurPreselect}
      />

      <div className="bg-off-white px-[2.431vw] pb-[5.556vw] max-md:px-5 max-md:pb-12">
        <a
          href={projectHref}
          onClick={(e) => navigate(e, projectHref)}
          className="inline-flex items-center gap-[0.694vw] bg-green text-off-white no-underline rounded-full px-[1.667vw] py-[0.833vw] max-md:px-5 max-md:py-2.5"
        >
          <PijlIcon className="w-[1.528vw] h-auto rotate-180 max-md:w-[16px]" />
          <span className="font-heading font-normal text-[1.181vw] tracking-[-0.024vw] max-md:text-[14px]">
            Terug naar overzicht
          </span>
        </a>
      </div>
    </section>
  );
}

function Spec({ icoon, tekst }: { icoon: string; tekst: string }) {
  return (
    <div className="flex items-center gap-[0.833vw] max-md:gap-3">
      <Image
        src={`/images/wonenbij/icons/${icoon}`}
        alt=""
        width={22}
        height={22}
        className="w-[1.528vw] h-[1.528vw] object-contain max-md:w-[18px] max-md:h-[18px]"
      />
      <span className="font-body font-medium text-[0.972vw] leading-none text-off-black max-md:text-[14px]">
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
        className="absolute left-[0.972vw] top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white/90 cursor-pointer border-none transition-opacity duration-200 hover:opacity-80 max-md:size-[36px] max-md:left-3"
      >
        <PijlIcon className="w-[1.389vw] h-auto rotate-180 text-off-black max-md:w-[16px]" />
      </button>
      <button
        onClick={() => onStap(1)}
        aria-label="Volgende"
        className="absolute right-[0.972vw] top-1/2 -translate-y-1/2 flex items-center justify-center size-[2.778vw] rounded-full bg-off-white/90 cursor-pointer border-none transition-opacity duration-200 hover:opacity-80 max-md:size-[36px] max-md:right-3"
      >
        <PijlIcon className="w-[1.389vw] h-auto text-off-black max-md:w-[16px]" />
      </button>
    </>
  );
}
