"use client";

import { useEffect, useState } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

/**
 * Pop-up na het sluiten van de inschrijving (wens Vivianne, 30-10). Verschijnt
 * bij binnenkomst op de project- en woningpagina's, eenmaal per sessie per
 * project; daarna blijven de woningen gewoon te bekijken.
 */
export default function InschrijvingGeslotenMelding({
  projectSlug,
  tekst,
  knopLabel = "Bekijk de woningen",
  naarAnker,
}: {
  projectSlug: string;
  tekst: string;
  knopLabel?: string;
  /** Sectie waar de knop na het sluiten naartoe scrolt (bijv. "aanbod"). */
  naarAnker?: string;
}) {
  const sleutel = `inschrijving-gesloten-${projectSlug}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Na hydratatie bepalen: sessionStorage bestaat niet op de server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!sessionStorage.getItem(sleutel)) setOpen(true);
  }, [sleutel]);

  const sluiten = () => {
    sessionStorage.setItem(sleutel, "1");
    setOpen(false);
  };

  const ref = useFocusTrap<HTMLDivElement>(open, sluiten);

  useEffect(() => {
    if (!open) return;
    const vorige = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = vorige;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-off-black/50 px-5 menu-overlay-in"
      onClick={sluiten}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inschrijving-gesloten-titel"
        onClick={(e) => e.stopPropagation()}
        className="w-[38.194vw] bg-off-white px-[3.125vw] pt-[2.778vw] pb-[3.125vw] menu-item-in max-lg:w-full max-lg:max-w-[440px] max-lg:px-6 max-lg:pt-7 max-lg:pb-8"
      >
        <h2
          id="inschrijving-gesloten-titel"
          className="font-body font-medium text-[2.5vw] leading-[2.778vw] text-off-black max-lg:text-[26px] max-lg:leading-[30px]"
        >
          Inschrijving gesloten
        </h2>
        <p className="mt-[1.389vw] whitespace-pre-line font-body font-medium text-[1.25vw] leading-[1.736vw] text-off-black max-lg:mt-4 max-lg:text-[16px] max-lg:leading-[23px]">
          {tekst}
        </p>
        <button
          type="button"
          onClick={() => {
            sluiten();
            if (naarAnker) {
              // Pas na het vrijgeven van de pagina-scroll (effect-cleanup).
              requestAnimationFrame(() =>
                document
                  .getElementById(naarAnker)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              );
            }
          }}
          className="pill-hover mt-[2.222vw] inline-flex items-center h-[2.5vw] bg-green text-off-white rounded-full px-[1.319vw] font-heading font-normal text-[0.972vw] leading-[1.201vw] tracking-[-0.019vw] cursor-pointer border-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-off-black max-lg:mt-8 max-lg:h-[44px] max-lg:px-5 max-lg:text-[14px] max-lg:leading-normal"
        >
          {knopLabel}
        </button>
      </div>
    </div>
  );
}
