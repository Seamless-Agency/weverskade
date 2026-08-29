"use client";

import Image from "next/image";
import type { PlanningFase } from "@/data/wonenbij";
import {
  Reveal,
  RevealGroup,
  RevealLine,
  RevealWords,
} from "@/components/wonenbij/motion";

/**
 * Blauwe band met de vier projectfases, gescheiden door verticale lijnen.
 * Figma: titel op x=267 (107 onder de bandtop), kolommen op 232px-pitch vanaf
 * x=273, tekst 43 rechts van de stip, omschrijving 24 onder het faseblok.
 * Elke fase heeft een stip; de actieve fase het voortgangsicoon.
 */
export default function ProjectPlanning({ fases }: { fases: PlanningFase[] }) {
  if (!fases.length) return null;

  const actieveIndex = fases.findIndex((fase) => fase.actief);

  return (
    <section
      id="planning"
      className="bg-blue pt-[7.431vw] pb-[8.889vw] max-lg:py-14"
      data-nav-theme="blue"
    >
      <div className="pl-[18.542vw] pr-[2.431vw] max-lg:px-5">
        <h2 className="font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-white max-lg:text-[36px] max-lg:leading-[1.1] max-lg:tracking-[-0.72px]">
          <RevealWords text="Projectplanning" />
        </h2>
      </div>

      {/* Mobiel bewust geen grid-gap: die zou via de subgrid ook tussen de
          rijen bínnen een fase komen; de fase-afstand zit in max-lg:mt-10
          op de fases zelf. */}
      <RevealGroup className="mt-[5.139vw] pl-[18.958vw] grid grid-cols-[16.111vw_16.111vw_16.111vw_16.111vw] max-lg:mt-10 max-lg:px-5 max-lg:grid-cols-1">
        {fases.map((fase, i) => (
          // Subgrid met drie rijen (kop / omschrijving / verwachtingen):
          // zo beginnen die blokken in alle kolommen op dezelfde hoogte,
          // ook als een fasetitel of omschrijving langer is (CMS-tekst).
          <div
            key={fase.titel + fase.periode}
            className={`relative grid grid-rows-subgrid row-span-3 content-start max-lg:pl-0 ${
              i > 0
                ? "max-lg:mt-10 max-lg:border-t max-lg:border-off-white/40 max-lg:pt-8"
                : ""
            }`}
          >
            {/* Verticale scheidingslijn: 27 links van de kolom, 5 boven de stip,
                onderkant 62 boven de kolom-onderkant (Figma: 267 hoog bij
                Figma-content) — groeit zo mee met langere CMS-tekst.
                De lijn tekent zichzelf van boven naar beneden, na de fases. */}
            {i > 0 ? (
              <RevealLine
                axis="y"
                delay={0.5 + i * 0.12}
                className="absolute left-[-1.875vw] top-[-0.347vw] bottom-[4.306vw] w-px bg-white max-lg:hidden"
              />
            ) : null}
            <Reveal delay={0.1 + i * 0.12} className="flex items-start gap-[1.181vw] max-lg:gap-3">
              <span className="relative shrink-0 mt-[0.139vw] size-[1.806vw] max-lg:size-[24px]">
                {actieveIndex >= 0 && i < actieveIndex ? (
                  // Afgeronde fase: wit rondje met vinkje in de bandkleur
                  <svg viewBox="0 0 26 26" className="size-full" aria-hidden>
                    <circle cx="13" cy="13" r="13" fill="#F7F5F0" />
                    <path
                      d="M7.5 13.5 11 17 18.5 9.5"
                      fill="none"
                      stroke="#717F8B"
                      strokeWidth="2.2"
                    />
                  </svg>
                ) : (
                  <Image
                    src="/images/wonenbij/icons/planning-dot.svg"
                    alt=""
                    fill
                    className="object-contain"
                  />
                )}
                {fase.actief ? (
                  <Image
                    src="/images/wonenbij/icons/planning-loading.svg"
                    alt="Huidige fase"
                    width={16}
                    height={16}
                    className="absolute inset-0 m-auto w-[60%] h-[60%]"
                  />
                ) : null}
              </span>
              {/* Zelfde rechtermarge als de omschrijving eronder, zodat een
                  lange fasetitel afbreekt vóór de scheidingslijn (die staat
                  1.875vw links van de volgende kolom). */}
              <div className="mr-[2.708vw] max-lg:mr-0">
                <p className="font-body font-normal text-[0.833vw] leading-[1.458vw] text-off-white max-lg:text-[12px] max-lg:leading-[18px]">
                  {fase.periode}
                </p>
                <p className="font-heading font-normal text-[1.042vw] leading-[1.458vw] text-off-white max-lg:text-[16px] max-lg:leading-[22px]">
                  {fase.titel}
                </p>
              </div>
            </Reveal>

            <Reveal
              delay={0.2 + i * 0.12}
              className="mt-[1.667vw] ml-[0.278vw] mr-[2.708vw] font-body font-medium text-[0.833vw] leading-[1.181vw] tracking-[-0.017vw] text-off-white max-lg:mt-4 max-lg:mx-0 max-lg:text-[13px] max-lg:leading-[19px]"
            >
              <p>{fase.omschrijving}</p>
            </Reveal>
            {fase.verwachtingen.length ? (
              <Reveal
                delay={0.28 + i * 0.12}
                className="mt-[1.389vw] ml-[0.278vw] mr-[2.708vw] font-body font-medium text-[0.833vw] leading-[1.181vw] tracking-[-0.017vw] text-off-white max-lg:mt-4 max-lg:mx-0 max-lg:text-[13px] max-lg:leading-[19px]"
              >
                <p className="font-semibold leading-[1.389vw] max-lg:leading-[20px]">
                  {fase.verwachtingenTitel ?? "Dit mag je verwachten"}
                </p>
                <ul className="list-disc ml-[1.25vw] max-lg:ml-5">
                  {fase.verwachtingen.map((punt) => (
                    <li key={punt} className="leading-[1.389vw] max-lg:leading-[20px]">
                      {punt}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : (
              <div />
            )}
          </div>
        ))}
      </RevealGroup>
    </section>
  );
}
