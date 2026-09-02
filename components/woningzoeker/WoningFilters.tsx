"use client";

import type { ReactNode } from "react";
import {
  STATUS_META,
  STATUS_ORDER,
  formatHuur,
  type WoningStatus,
} from "@/data/woningzoeker";
import { ChevronIcon } from "@/components/wonenbij/icons";

export interface FilterState {
  statussen: WoningStatus[];
  minSlaapkamers: number;
  maxHuur: number;
}

export interface SorteerOptie {
  value: string;
  label: string;
}

export interface Sortering {
  waarde: string;
  opties: SorteerOptie[];
  onChange: (waarde: string) => void;
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
  /** Sorteermenu als onderdeel van dezelfde balk (wonen-bij woningzoeker). */
  sortering?: Sortering;
  /**
   * Alles op één regel (wonen-bij woningzoeker, desktop): status, slaapkamers
   * en huur links naast elkaar, het sorteermenu rechts, zonder eigen
   * sluitlijn — de lijstlijn eronder sluit het blok af. Standaard: gestapeld.
   */
  inline?: boolean;
  /**
   * Gestapelde variant zonder sluitlijn en zonder resultaatregel — voor de
   * wonen-bij woningzoeker op mobiel, waar de hoofdteller en de lijstlijn
   * die rollen al vervullen.
   */
  kaal?: boolean;
}

/* ─── Bouwstenen: micro-label boven, veld op de onderlijn ─────────────── */

const MICRO_LABEL =
  "font-body text-[0.8vw] font-medium uppercase leading-[1.111vw] tracking-[0.06em] text-off-black/45 max-lg:text-[11px] max-lg:leading-normal";

const SELECT_CLASS =
  "w-full cursor-pointer appearance-none border-b border-off-black/30 bg-transparent pb-[0.35vw] pr-[1.6vw] font-body text-[1vw] font-medium text-off-black outline-none transition-colors duration-300 hover:border-off-black/60 focus-visible:border-off-black max-lg:pb-1.5 max-lg:pr-6 max-lg:text-[15px]";

/** Native select in de Weverskade-stijl: onderlijn + chevron rechts. */
function Keuze({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string | number;
  onChange: (value: string) => void;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <span className="relative block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={SELECT_CLASS}
      >
        {children}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-[0.1vw] bottom-[0.75vw] w-[0.8vw] h-auto text-off-black/60 max-lg:right-0.5 max-lg:bottom-[11px] max-lg:w-[12px]" />
    </span>
  );
}

/** Sorteermenu; ook los bruikbaar als er niets te filteren valt (alleen types). */
export function SorteerVeld({
  sortering,
  className = "",
}: {
  sortering: Sortering;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col justify-between gap-[0.35vw] max-lg:gap-1.5 ${className}`}
    >
      <span className={MICRO_LABEL}>Sorteren</span>
      <Keuze value={sortering.waarde} onChange={sortering.onChange}>
        {sortering.opties.map((optie) => (
          <option key={optie.value} value={optie.value}>
            {optie.label}
          </option>
        ))}
      </Keuze>
    </label>
  );
}

export default function WoningFilters({
  filters,
  onChange,
  aantallen,
  huurBereik,
  slaapkamerOpties,
  resultaatAantal,
  totaalAantal,
  sortering,
  inline = false,
  kaal = false,
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
            className={`flex items-center gap-[0.42vw] rounded-full border px-[0.9vw] py-[0.42vw] font-body text-[0.9vw] font-medium transition-colors duration-300 max-lg:gap-2 max-lg:px-4 max-lg:py-3 max-lg:text-[14px] ${
              actief
                ? "border-off-black bg-off-black text-off-white"
                : "border-off-black/25 text-off-black/55 hover:border-off-black/60 hover:text-off-black"
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
    <label className="flex h-full flex-col justify-between gap-[0.35vw] max-lg:h-auto max-lg:gap-1.5">
      <span className={MICRO_LABEL}>Slaapkamers</span>
      <Keuze
        value={filters.minSlaapkamers}
        onChange={(v) => onChange({ ...filters, minSlaapkamers: Number(v) })}
      >
        <option value={0}>Alle</option>
        {slaapkamerOpties.map((n) => (
          <option key={n} value={n}>
            {n} of meer
          </option>
        ))}
      </Keuze>
    </label>
  );

  const huurVeld = (
    <label className="flex h-full flex-col justify-between gap-[0.35vw] max-lg:h-auto max-lg:gap-1.5">
      <span className={`flex items-start justify-between gap-4 ${MICRO_LABEL}`}>
        Max. huur
        <span className="font-body text-[0.9vw] normal-case leading-[1.111vw] tracking-normal text-off-black/60 max-lg:text-[13px] max-lg:leading-normal">
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
        className="woningzoeker-range woningzoeker-range--lijn w-full cursor-pointer"
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
    // Eén balk: micro-labels op één bovenlijn, alle onderlijnen (pill-bodem,
    // veldlijn, slider-track) op één onderlijn via een vaste kolomhoogte.
    // Filters links, sorteren rechts. Het resultaat leeft in de
    // hoofdteller van de sectie, niet hier.
    return (
      <div className="flex items-end justify-between gap-x-[2.222vw]">
        <div className="flex items-end gap-x-[2.222vw]">
          <div className="flex h-[4.028vw] flex-col justify-between">
            <span className={MICRO_LABEL}>Status</span>
            {statusGroep}
          </div>
          <div className="flex h-[4.028vw] w-[12.5vw] flex-col justify-between">
            {slaapkamersVeld}
          </div>
          <div className="flex h-[4.028vw] w-[17.361vw] flex-col justify-between">
            {huurVeld}
          </div>
        </div>
        {sortering ? (
          <SorteerVeld
            sortering={sortering}
            className="h-[4.028vw] w-[15.278vw] shrink-0"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={kaal ? "" : "border-b border-off-black/12 pb-[1.4vw] max-lg:pb-5"}>
      {statusGroep}

      <div className="mt-[1.1vw] flex items-end gap-[1.6vw] max-lg:mt-5 max-lg:flex-col max-lg:items-stretch max-lg:gap-4">
        <div className="flex-1">{slaapkamersVeld}</div>
        <div className="flex-1">{huurVeld}</div>
        {sortering ? (
          <SorteerVeld sortering={sortering} className="flex-1" />
        ) : null}
      </div>

      {kaal ? null : (
        <div className="mt-[1.1vw] flex items-baseline justify-between max-lg:mt-5">
          {resultaatTekst}
          {wissenKnop}
        </div>
      )}
    </div>
  );
}
