"use client";

import { STATUS_META, formatHuur, type Woning } from "@/data/woningzoeker";

interface WoningListProps {
  woningen: Woning[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export default function WoningList({
  woningen,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: WoningListProps) {
  if (woningen.length === 0) {
    return (
      <p className="py-[2.8vw] text-center font-body text-[1vw] font-medium text-off-black/45 max-lg:py-10 max-lg:text-[15px]">
        Geen woningen die aan deze filters voldoen.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-off-black/10">
      {woningen.map((woning) => {
        const meta = STATUS_META[woning.status];
        const isSelected = woning.id === selectedId;
        const isHovered = woning.id === hoveredId;

        return (
          <li key={woning.id}>
            <button
              type="button"
              onClick={() => onSelect(woning.id)}
              onMouseEnter={() => onHover(woning.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(woning.id)}
              onBlur={() => onHover(null)}
              aria-pressed={isSelected}
              className={`flex w-full items-center gap-[1vw] px-[0.7vw] py-[0.9vw] text-left transition-colors max-lg:gap-3 max-lg:px-2 max-lg:py-3.5 ${
                isSelected
                  ? "bg-off-black/6"
                  : isHovered
                    ? "bg-off-black/3"
                    : "bg-transparent"
              }`}
            >
              <span
                aria-hidden
                className="h-[0.62vw] w-[0.62vw] shrink-0 rounded-full max-lg:h-2.5 max-lg:w-2.5"
                style={{ backgroundColor: meta.color }}
              />

              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-[0.5vw] max-lg:gap-2">
                  <span className="font-body text-[1.05vw] font-medium leading-tight text-off-black max-lg:text-[16px]">
                    {woning.nummer}
                  </span>
                  <span className="truncate font-heading text-[0.9vw] font-normal leading-tight text-off-black/50 max-lg:text-[13px]">
                    {woning.woningType}
                  </span>
                </span>
                <span className="mt-[0.15vw] block font-body text-[0.88vw] font-normal leading-tight text-off-black/55 max-lg:mt-0.5 max-lg:text-[13px]">
                  {woning.oppervlakte} m² · {woning.slaapkamers}{" "}
                  {woning.slaapkamers === 1 ? "slaapkamer" : "slaapkamers"} ·{" "}
                  {woning.verdieping === 0
                    ? "begane grond"
                    : `${woning.verdieping}e verdieping`}
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block font-body text-[1.05vw] font-medium leading-tight text-off-black max-lg:text-[16px]">
                  {formatHuur(woning.huurprijs)}
                </span>
                <span className="mt-[0.15vw] block font-body text-[0.8vw] font-normal leading-tight text-off-black/45 max-lg:mt-0.5 max-lg:text-[11px]">
                  {woning.status === "beschikbaar" ? "per maand" : meta.label}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
