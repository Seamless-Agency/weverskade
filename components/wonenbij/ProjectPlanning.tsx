"use client";

import Image from "next/image";
import type { PlanningFase } from "@/data/wonenbij";

/**
 * Blauwe band met de vier projectfases, gescheiden door verticale lijnen.
 * De actieve fase krijgt het voortgangsicoon uit het design.
 */
export default function ProjectPlanning({ fases }: { fases: PlanningFase[] }) {
  if (!fases.length) return null;

  return (
    <section
      id="planning"
      className="bg-blue py-[7.431vw] max-md:py-14"
      data-nav-theme="blue"
    >
      <div className="pl-[18.542vw] pr-[2.431vw] max-md:px-5">
        <h2 className="font-heading font-normal text-[4.653vw] leading-none tracking-[-0.093vw] text-off-white max-md:text-[36px] max-md:tracking-[-0.72px]">
          Projectplanning
        </h2>

        <div className="mt-[6.5vw] grid grid-cols-4 max-md:mt-10 max-md:grid-cols-1 max-md:gap-10">
          {fases.map((fase, i) => (
            <div
              key={fase.titel + fase.periode}
              className={`relative pr-[2.083vw] max-md:pr-0 ${
                i > 0
                  ? "pl-[2.083vw] border-l border-off-white/40 max-md:pl-0 max-md:border-l-0 max-md:border-t max-md:pt-8"
                  : ""
              }`}
            >
              <div className="flex items-start gap-[0.972vw] max-md:gap-3">
                {fase.actief ? (
                  <span className="relative shrink-0 mt-[0.2vw] size-[1.806vw] max-md:size-[24px]">
                    <Image
                      src="/images/wonenbij/icons/planning-dot.svg"
                      alt=""
                      fill
                      className="object-contain"
                    />
                    <Image
                      src="/images/wonenbij/icons/planning-loading.svg"
                      alt="Huidige fase"
                      width={16}
                      height={16}
                      className="absolute inset-0 m-auto w-[60%] h-[60%]"
                    />
                  </span>
                ) : null}
                <div>
                  <p className="font-body font-normal text-[0.833vw] leading-[1.458vw] text-off-white max-md:text-[12px] max-md:leading-[18px]">
                    {fase.periode}
                  </p>
                  <p className="font-heading font-normal text-[1.042vw] leading-[1.458vw] text-off-white max-md:text-[16px] max-md:leading-[22px]">
                    {fase.titel}
                  </p>
                </div>
              </div>

              <div className="mt-[2.5vw] font-body font-medium text-[0.833vw] leading-[1.181vw] tracking-[-0.017vw] text-off-white max-md:mt-4 max-md:text-[13px] max-md:leading-[19px]">
                <p>{fase.omschrijving}</p>
                {fase.verwachtingen.length ? (
                  <>
                    <p className="mt-[1.389vw] font-semibold max-md:mt-4">
                      {fase.verwachtingenTitel ?? "Dit mag je verwachten"}
                    </p>
                    <ul className="list-disc ml-[1.25vw] mt-[0.2vw] max-md:ml-5">
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
      </div>
    </section>
  );
}
