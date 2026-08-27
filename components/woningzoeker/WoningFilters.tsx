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
  /**
   * Alles op één regel (wonen-bij woningzoeker, desktop): status, slaapkamers
   * en huur naast elkaar met het resultaat rechts, zonder eigen sluitlijn —
   * de lijstlijn eronder sluit het blok af. Standaard: gestapeld.
   */
  inline?: boolean;
}

export default function WoningFilters({
  filters,
  onChange,
  aantallen,
  huurBereik,
  slaapkamerOpties,
  resultaatAantal,
  totaalAantal,
  inline = false,
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

  const statusGroep = (
    <div className="flex flex-wrap gap-[0.5vw] max-lg:gap-2">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const actief = filters.statussen.includes(status);
        return (
          <button
            key={status}
            type="button"
            onClick={() => toggleStatus(status)}
            aria-pressed={actief}
            className={`flex items-center gap-[0.42vw] rounded-full border px-[0.9vw] py-[0.42vw] font-body text-[0.9vw] font-medium transition-colors max-lg:gap-2 max-lg:px-4 max-lg:py-3 max-lg:text-[14px] ${
              actief
                ? "border-off-black bg-off-black text-off-white"
                : "border-off-black/25 text-off-black/55 hover:border-off-black/50"
            }`}
          >
            <span
              aria-hidden
              className="h-[0.55vw] w-[0.55vw] shrink-0 rounded-full max-lg:h-2 max-lg:w-2"
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
  );

  const slaapkamersVeld = (
    <label className="flex flex-col gap-[0.35vw] max-lg:gap-1.5">
      <span className="font-body text-[0.8vw] font-medium uppercase tracking-[0.06em] text-off-black/45 max-lg:text-[11px]">
        Slaapkamers
      </span>
      <select
        value={filters.minSlaapkamers}
        onChange={(e) =>
          onChange({ ...filters, minSlaapkamers: Number(e.target.value) })
        }
        className="w-full cursor-pointer appearance-none border-b border-off-black/30 bg-transparent pb-[0.35vw] font-body text-[1vw] font-medium text-off-black outline-none focus-visible:border-off-black max-lg:pb-1.5 max-lg:text-[15px]"
      >
        <option value={0}>Alle</option>
        {slaapkamerOpties.map((n) => (
          <option key={n} value={n}>
            {n} of meer
          </option>
        ))}
      </select>
    </label>
  );

  const huurVeld = (
    <label className="flex flex-col gap-[0.35vw] max-lg:gap-1.5">
      <span className="flex items-baseline justify-between gap-4 font-body text-[0.8vw] font-medium uppercase tracking-[0.06em] text-off-black/45 max-lg:text-[11px]">
        Max. huur
        <span className="font-body text-[0.9vw] normal-case tracking-normal text-off-black max-lg:text-[13px]">
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
  );

  const wissenKnop = !isDefault ? (
    <button
      type="button"
      onClick={() =>
        onChange({
          statussen: [...STATUS_ORDER],
          minSlaapkamers: 0,
          maxHuur: huurBereik.max,
        })
      }
      className="link-underline font-body text-[0.9vw] font-medium text-off-black/60 max-lg:text-[13px]"
    >
      Filters wissen
    </button>
  ) : null;

  const resultaatTekst = (
    <p className="font-body text-[0.95vw] font-medium text-off-black max-lg:text-[14px]">
      {resultaatAantal} van {totaalAantal} woningen
    </p>
  );

  if (inline) {
    // Eén nette regel boven de lijst: onderkanten uitgelijnd, resultaat rechts.
    return (
      <div className="flex flex-wrap items-end gap-x-[2.222vw] gap-y-3">
        {statusGroep}
        <div className="w-[12.5vw]">{slaapkamersVeld}</div>
        <div className="w-[17.361vw]">{huurVeld}</div>
        <div className="ml-auto flex items-baseline gap-[1.111vw] pb-[0.14vw]">
          {wissenKnop}
          {resultaatTekst}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-off-black/12 pb-[1.4vw] max-lg:pb-5">
      {statusGroep}

      <div className="mt-[1.1vw] flex items-end gap-[1.6vw] max-lg:mt-5 max-lg:flex-col max-lg:items-stretch max-lg:gap-4">
        <div className="flex-1">{slaapkamersVeld}</div>
        <div className="flex-1">{huurVeld}</div>
      </div>

      <div className="mt-[1.1vw] flex items-baseline justify-between max-lg:mt-5">
        {resultaatTekst}
        {wissenKnop}
      </div>
    </div>
  );
}
