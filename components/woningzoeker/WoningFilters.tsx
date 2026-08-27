"use client";

import {
  STATUS_META,
  STATUS_ORDER,
  formatHuur,
  type WoningStatus,
} from "@/data/woningzoeker";

export interface FilterState {
  statussen: WoningStatus[];
  minSlaapkamers: number;
  maxHuur: number;
}

interface WoningFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  /** Aantallen per status over de hele set - niet over het filterresultaat. */
  aantallen: Record<WoningStatus, number>;
  huurBereik: { min: number; max: number };
  slaapkamerOpties: number[];
  resultaatAantal: number;
  totaalAantal: number;
}

export default function WoningFilters({
  filters,
  onChange,
  aantallen,
  huurBereik,
  slaapkamerOpties,
  resultaatAantal,
  totaalAantal,
}: WoningFiltersProps) {
  const toggleStatus = (status: WoningStatus) => {
    const actief = filters.statussen.includes(status);
    const next = actief
      ? filters.statussen.filter((s) => s !== status)
      : [...filters.statussen, status];
    // Alles uitzetten laat een lege lijst achter - dat is nooit de bedoeling,
    // dus de laatste actieve status blijft staan.
    if (next.length === 0) return;
    onChange({ ...filters, statussen: next });
  };

  const isDefault =
    filters.statussen.length === STATUS_ORDER.length &&
    filters.minSlaapkamers === 0 &&
    filters.maxHuur >= huurBereik.max;

  return (
    <div className="border-b border-off-black/12 pb-[1.4vw] max-md:pb-5">
      {/* ─── Status ─── */}
      <div className="flex flex-wrap gap-[0.5vw] max-md:gap-2">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          const actief = filters.statussen.includes(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              aria-pressed={actief}
              className={`flex items-center gap-[0.42vw] rounded-full border px-[0.9vw] py-[0.42vw] font-body text-[0.9vw] font-medium transition-colors max-md:gap-2 max-md:px-3.5 max-md:py-1.5 max-md:text-[13px] ${
                actief
                  ? "border-off-black bg-off-black text-off-white"
                  : "border-off-black/25 text-off-black/55 hover:border-off-black/50"
              }`}
            >
              <span
                aria-hidden
                className="h-[0.55vw] w-[0.55vw] shrink-0 rounded-full max-md:h-2 max-md:w-2"
                style={{ backgroundColor: meta.color }}
              />
              {meta.label}
              <span className={actief ? "text-off-white/60" : "text-off-black/35"}>
                {aantallen[status]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Slaapkamers + huur ─── */}
      <div className="mt-[1.1vw] flex items-end gap-[1.6vw] max-md:mt-5 max-md:flex-col max-md:items-stretch max-md:gap-4">
        <label className="flex flex-1 flex-col gap-[0.35vw] max-md:gap-1.5">
          <span className="font-body text-[0.8vw] font-medium uppercase tracking-[0.06em] text-off-black/45 max-md:text-[11px]">
            Slaapkamers
          </span>
          <select
            value={filters.minSlaapkamers}
            onChange={(e) =>
              onChange({ ...filters, minSlaapkamers: Number(e.target.value) })
            }
            className="w-full cursor-pointer appearance-none border-b border-off-black/30 bg-transparent pb-[0.35vw] font-body text-[1vw] font-medium text-off-black outline-none focus-visible:border-off-black max-md:pb-1.5 max-md:text-[15px]"
          >
            <option value={0}>Alle</option>
            {slaapkamerOpties.map((n) => (
              <option key={n} value={n}>
                {n} of meer
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-[0.35vw] max-md:gap-1.5">
          <span className="flex items-baseline justify-between font-body text-[0.8vw] font-medium uppercase tracking-[0.06em] text-off-black/45 max-md:text-[11px]">
            Max. huur
            <span className="font-body text-[0.9vw] normal-case tracking-normal text-off-black max-md:text-[13px]">
              {filters.maxHuur >= huurBereik.max
                ? "Geen maximum"
                : `${formatHuur(filters.maxHuur)} p/m`}
            </span>
          </span>
          <input
            type="range"
            min={huurBereik.min}
            max={huurBereik.max}
            step={25}
            value={filters.maxHuur}
            onChange={(e) =>
              onChange({ ...filters, maxHuur: Number(e.target.value) })
            }
            className="woningzoeker-range w-full cursor-pointer"
          />
        </label>
      </div>

      {/* ─── Resultaatregel ─── */}
      <div className="mt-[1.1vw] flex items-baseline justify-between max-md:mt-5">
        <p className="font-body text-[0.95vw] font-medium text-off-black max-md:text-[14px]">
          {resultaatAantal} van {totaalAantal} woningen
        </p>
        {!isDefault ? (
          <button
            type="button"
            onClick={() =>
              onChange({
                statussen: [...STATUS_ORDER],
                minSlaapkamers: 0,
                maxHuur: huurBereik.max,
              })
            }
            className="link-underline font-body text-[0.9vw] font-medium text-off-black/60 max-md:text-[13px]"
          >
            Filters wissen
          </button>
        ) : null}
      </div>
    </div>
  );
}
