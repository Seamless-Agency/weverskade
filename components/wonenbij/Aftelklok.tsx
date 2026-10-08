"use client";

import { useEffect, useState } from "react";

/* Aftelklok voor de voorpremière van een project (wens Vivianne, 08-10).
   "premiere" = gecentreerd in de hero, licht op de foto, met dubbele punten;
   "klein" = links uitgelijnd en donker in het inschrijfblok.
   Elke cijferwissel rolt van onder een masker omhoog (zelfde curve als de
   woord-reveals): de nieuwe key laat de animatie opnieuw lopen.
   De server bepaalt óf er afgeteld wordt; de klok tikt alleen in de browser
   en verschijnt pas na de mount, zodat server- en client-HTML nooit van
   elkaar afwijken. Op nul biedt hij aan de pagina te verversen (de server
   zet de pagina binnen een minuut om naar de normale versie). */

const EENHEDEN = [
  { label: "dagen", ms: 86_400_000 },
  { label: "uren", ms: 3_600_000 },
  { label: "minuten", ms: 60_000 },
  { label: "seconden", ms: 1_000 },
] as const;

function delen(resterend: number): string[] {
  let rest = Math.max(0, resterend);
  return EENHEDEN.map(({ ms }) => {
    const waarde = Math.floor(rest / ms);
    rest -= waarde * ms;
    return String(waarde).padStart(2, "0");
  });
}

/** Eén cijfer in een masker; bij een nieuwe waarde rolt het omhoog in beeld. */
function Cijfer({ waarde, positie }: { waarde: string; positie: string }) {
  return (
    <span className="relative inline-block overflow-hidden align-top">
      <span key={`${positie}-${waarde}`} className="cijfer-in inline-block">
        {waarde}
      </span>
    </span>
  );
}

export default function Aftelklok({
  tot,
  variant = "premiere",
}: {
  /** ISO-moment waarop de verhuur start. */
  tot: string;
  variant?: "premiere" | "klein";
}) {
  const doel = Date.parse(tot);
  const [nu, setNu] = useState<number | null>(null);

  useEffect(() => {
    const tik = () => setNu(Date.now());
    tik();
    const id = window.setInterval(tik, 1000);
    return () => window.clearInterval(id);
  }, []);

  const premiere = variant === "premiere";

  if (nu !== null && nu >= doel) {
    return (
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={`pill-hover inline-flex items-center rounded-full bg-green text-off-white font-heading font-normal ${
          premiere
            ? "h-[2.847vw] px-[1.667vw] text-[1.181vw] max-lg:h-11 max-lg:px-5 max-lg:text-[15px]"
            : "h-[2.5vw] px-[1.319vw] text-[0.972vw] max-lg:h-11 max-lg:px-5 max-lg:text-[14px]"
        }`}
      >
        Het aanbod is beschikbaar, ververs de pagina
      </button>
    );
  }

  const cijfers = nu === null ? ["00", "00", "00", "00"] : delen(doel - nu);
  const cijferClass = premiere
    ? "text-[4.167vw] leading-[4.444vw] tracking-[-0.083vw] max-lg:text-[34px] max-lg:leading-[38px] max-lg:tracking-[-0.68px]"
    : "text-[3.75vw] leading-[3.958vw] tracking-[-0.075vw] max-lg:text-[28px] max-lg:leading-[30px] max-lg:tracking-[-0.56px]";

  return (
    <div
      role="timer"
      aria-label="Tijd tot de start van de verhuur"
      className={`flex items-start transition-opacity duration-700 ${
        premiere ? "justify-center text-off-white" : "text-off-black gap-[1.944vw] max-lg:gap-5"
      } ${nu === null ? "opacity-0" : "opacity-100"}`}
    >
      {cijfers.map((paar, i) => (
        <div key={EENHEDEN[i].label} className="flex items-start">
          <div className={`flex flex-col ${premiere ? "items-center" : ""}`}>
            {/* Vaste breedte per cijfer (het merkfont heeft geen tabelcijfers):
                zo staat de rij stil terwijl de seconden rollen. */}
            <span className={`flex font-body font-medium ${cijferClass}`}>
              {paar.split("").map((c, j) => (
                <span key={j} className="inline-flex w-[0.62em] justify-center">
                  <Cijfer waarde={c} positie={`${i}${j}`} />
                </span>
              ))}
            </span>
            <span
              className={`font-body font-medium ${
                premiere
                  ? "mt-[0.417vw] text-[0.764vw] leading-[1.042vw] text-off-white/55 max-lg:mt-1 max-lg:text-[10px] max-lg:leading-[13px]"
                  : "mt-[0.417vw] text-[0.903vw] leading-[1.25vw] text-off-black/60 max-lg:mt-1 max-lg:text-[11px] max-lg:leading-[14px]"
              }`}
            >
              {EENHEDEN[i].label}
            </span>
          </div>
          {premiere && i < cijfers.length - 1 ? (
            <span
              aria-hidden="true"
              className={`mx-[1.389vw] font-body font-normal text-off-white/30 max-lg:mx-2 ${cijferClass}`}
            >
              :
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
