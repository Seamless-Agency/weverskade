"use client";

import Image from "next/image";
import type { PlanningFase } from "@/data/wonenbij";

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
      className="bg-blue pt-[7.431vw] pb-[8.889vw] max-md:py-14"
      data-nav-theme="blue"
    >
      <div className="pl-[18.542vw] pr-[2.431vw] max-md:px-5">
        <h2 className="font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-white max-md:text-[36px] max-md:leading-none max-md:tracking-[-0.72px]">
          Projectplanning
        </h2>
      </div>

      <div className="mt-[5.139vw] pl-[18.958vw] grid grid-cols-[16.111vw_16.111vw_16.111vw_16.111vw] max-md:mt-10 max-md:px-5 max-md:grid-cols-1 max-md:gap-10">
        {fases.map((fase, i) => (
          <div
            key={fase.titel + fase.periode}
            className={`relative max-md:pl-0 ${
              i > 0
                ? "max-md:border-t max-md:border-off-white/40 max-md:pt-8"
                : ""
            }`}
          >
            {/* Verticale scheidingslijn: 27 links van de kolom, 5 boven de stip,
                onderkant 62 boven de kolom-onderkant (Figma: 267 hoog bij
                Figma-content) — groeit zo mee met langere CMS-tekst */}
            {i > 0 ? (
              <span
                aria-hidden
                className="absolute left-[-1.875vw] top-[-0.347vw] bottom-[4.306vw] w-px bg-white max-md:hidden"
              />
            ) : null}
            <div className="flex items-start gap-[1.181vw] max-md:gap-3">
              <span className="relative shrink-0 mt-[0.139vw] size-[1.806vw] max-md:size-[24px]">
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
              <div>
                <p className="font-body font-normal text-[0.833vw] leading-[1.458vw] text-off-white max-md:text-[12px] max-md:leading-[18px]">
                  {fase.periode}
                </p>
                <p className="font-heading font-normal text-[1.042vw] leading-[1.458vw] text-off-white max-md:text-[16px] max-md:leading-[22px]">
                  {fase.titel}
                </p>
              </div>
            </div>

            <div className="mt-[1.667vw] ml-[0.278vw] mr-[2.708vw] font-body font-medium text-[0.833vw] leading-[1.181vw] tracking-[-0.017vw] text-off-white max-md:mt-4 max-md:mx-0 max-md:text-[13px] max-md:leading-[19px]">
              <p>{fase.omschrijving}</p>
              {fase.verwachtingen.length ? (
                <>
                  <p className="mt-[1.389vw] font-semibold leading-[1.389vw] max-md:mt-4 max-md:leading-[20px]">
                    {fase.verwachtingenTitel ?? "Dit mag je verwachten"}
                  </p>
                  <ul className="list-disc ml-[1.25vw] max-md:ml-5">
                    {fase.verwachtingen.map((punt) => (
                      <li key={punt} className="leading-[1.389vw] max-md:leading-[20px]">
                        {punt}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
