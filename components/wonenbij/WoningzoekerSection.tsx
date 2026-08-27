"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import RenderOverlay from "@/components/woningzoeker/RenderOverlay";
import WoningFilters, {
  type FilterState,
} from "@/components/woningzoeker/WoningFilters";
import { STATUS_ORDER } from "@/data/woningzoeker";
import type { Woning, WoningStatus } from "@/data/woningzoeker";
import {
  STATUS_TYPE_META,
  formatPrijs,
  type Aanzicht,
  type WoningType,
} from "@/data/wonenbij";
import { usePageNavigation } from "@/hooks/usePageNavigation";

type SortKey = "prijs" | "oppervlakte" | "beschikbaarheid" | "slaapkamers";

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: "prijs", label: "Prijs" },
  { key: "oppervlakte", label: "Oppervlakte" },
  { key: "beschikbaarheid", label: "Beschikbaarheid" },
  { key: "slaapkamers", label: "Slaapkamers" },
];

interface WoningzoekerSectionProps {
  projectSlug: string;
  woningTypes: WoningType[];
  woningen: Woning[];
  render?: string;
  renderAlt?: string;
  renderWidth?: number;
  renderHeight?: number;
  /** Meerdere gevelaanzichten (voor/achter); heeft voorrang op de losse render. */
  aanzichten?: Aanzicht[];
}

/**
 * De woningzoeker op de projectpagina: links de woningtypes, rechts de
 * render met per woning een overgetrokken vlak (render + overlay, geen BIM).
 * Hover over een type licht de bijbehorende woningen op; klik op een woning
 * opent de woningpagina met die woning voorgeselecteerd.
 */
export default function WoningzoekerSection({
  projectSlug,
  woningTypes,
  woningen,
  render,
  renderAlt,
  renderWidth,
  renderHeight,
  aanzichten,
}: WoningzoekerSectionProps) {
  const navigate = usePageNavigation();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [hoveredWoningId, setHoveredWoningId] = useState<string | null>(null);
  const [aanzichtIndex, setAanzichtIndex] = useState(0);

  // ─── Filters (status / slaapkamers / max. huur) over alle woningen ───
  const huurBereik = useMemo(() => {
    if (woningen.length === 0) return { min: 0, max: 0 };
    const prijzen = woningen.map((w) => w.huurprijs);
    // Naar boven/onder afronden op 25 zodat de slider op ronde stappen landt.
    return {
      min: Math.floor(Math.min(...prijzen) / 25) * 25,
      max: Math.ceil(Math.max(...prijzen) / 25) * 25,
    };
  }, [woningen]);

  const slaapkamerOpties = useMemo(
    () => [...new Set(woningen.map((w) => w.slaapkamers))].sort((a, b) => a - b),
    [woningen]
  );

  const aantallen = useMemo(() => {
    const basis = { beschikbaar: 0, "in-optie": 0, bezet: 0 } as Record<
      WoningStatus,
      number
    >;
    for (const woning of woningen) basis[woning.status] += 1;
    return basis;
  }, [woningen]);

  const [filters, setFilters] = useState<FilterState>({
    statussen: [...STATUS_ORDER],
    minSlaapkamers: 0,
    maxHuur: huurBereik.max,
  });

  const gefilterd = useMemo(
    () =>
      woningen.filter(
        (w) =>
          filters.statussen.includes(w.status) &&
          w.slaapkamers >= filters.minSlaapkamers &&
          w.huurprijs <= filters.maxHuur
      ),
    [woningen, filters]
  );

  // Eén lijst van aanzichten: expliciet aangeleverd, of de losse render als
  // enkel aanzicht. De actieve view bepaalt welke woningen klikbaar zijn.
  const views: Aanzicht[] = useMemo(() => {
    if (aanzichten?.length) return aanzichten;
    if (render && renderWidth && renderHeight) {
      return [
        {
          key: "render",
          label: "Overzicht",
          render,
          renderAlt: renderAlt ?? "Render van het gebouw",
          renderWidth,
          renderHeight,
          woningen,
        },
      ];
    }
    return [];
  }, [aanzichten, render, renderAlt, renderWidth, renderHeight, woningen]);

  const actiefAanzicht = views[Math.min(aanzichtIndex, views.length - 1)] ?? null;

  const gesorteerd = useMemo(() => {
    if (!sortKey) return woningTypes;
    const richting = sortAsc ? 1 : -1;
    return [...woningTypes].sort((a, b) => {
      switch (sortKey) {
        case "prijs":
          return (a.prijsVan - b.prijsVan) * richting;
        case "oppervlakte":
          return (a.oppervlakte - b.oppervlakte) * richting;
        case "slaapkamers":
          return (a.slaapkamers - b.slaapkamers) * richting;
        case "beschikbaarheid":
          return a.status.localeCompare(b.status) * richting;
      }
    });
  }, [woningTypes, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  /** Woningen die oplichten op de render: door het filter én (bij type-hover)
   *  van het gehoverde type. De rest vervaagt. */
  const zichtbareIds = useMemo(() => {
    let zichtbaar = (actiefAanzicht?.woningen ?? []).filter(
      (w) =>
        filters.statussen.includes(w.status) &&
        w.slaapkamers >= filters.minSlaapkamers &&
        w.huurprijs <= filters.maxHuur
    );
    if (hoveredType) {
      zichtbaar = zichtbaar.filter((w) => w.woningType === hoveredType);
    }
    return new Set(zichtbaar.map((w) => w.id));
  }, [actiefAanzicht, hoveredType, filters]);

  /** Typen waarvan minimaal één woning door het filter komt. Typen zonder
   *  gekoppelde woningen blijven altijd zichtbaar. */
  const zichtbareTypes = useMemo(() => {
    return gesorteerd.filter((type) => {
      const heeftWoningen = woningen.some((w) => w.woningType === type.naam);
      if (!heeftWoningen) return true;
      return gefilterd.some((w) => w.woningType === type.naam);
    });
  }, [gesorteerd, woningen, gefilterd]);

  const typeSlugVoorWoning = (woning: Woning): string => {
    const type = woningTypes.find((t) => t.naam === woning.woningType);
    return type?.slug ?? woningTypes[0]?.slug ?? "";
  };

  const openWoning = (id: string) => {
    // Zoek in alle aanzichten: de vakjes op de luchtfoto zijn andere
    // woning-objecten dan die op de gevelaanzichten.
    const woning =
      views.flatMap((view) => view.woningen).find((w) => w.id === id) ??
      woningen.find((w) => w.id === id);
    if (!woning) return;
    const typeSlug = typeSlugVoorWoning(woning);
    if (!typeSlug) return;
    window.location.href = `/wonenbij/${projectSlug}/${typeSlug}?woning=${encodeURIComponent(woning.nummer)}`;
  };

  /** Vanuit een overzichtsbeeld (luchtfoto) doorklikken naar een gevel-aanzicht. */
  const openAanzicht = (doelKey: string) => {
    const index = views.findIndex((view) => view.key === doelKey);
    if (index < 0) return;
    setAanzichtIndex(index);
    setHoveredWoningId(null);
  };

  const heeftRender = Boolean(
    actiefAanzicht &&
      (actiefAanzicht.woningen.length || actiefAanzicht.zones?.length)
  );

  return (
    <section id="aanbod" className="bg-white py-[7.5vw] max-md:py-14" data-nav-theme="light">
      <div className="px-[2.431vw] max-md:px-5">
        <h2 className="font-heading font-normal text-[4.653vw] leading-none tracking-[-0.093vw] text-off-black max-md:text-[36px] max-md:tracking-[-0.72px]">
          Woningzoeker
        </h2>

        {/* Resultaat + sorteerpills */}
        <div className="mt-[4.861vw] flex items-center justify-between max-md:mt-8 max-md:flex-col max-md:items-start max-md:gap-4">
          <p className="font-heading font-normal text-[1.667vw] leading-none text-off-black max-md:text-[18px]">
            {woningen.length ? gefilterd.length : woningTypes.length} woningen
            gevonden
          </p>
          <div className="flex flex-wrap gap-[0.694vw] max-md:gap-2">
            {SORT_LABELS.map(({ key, label }) => {
              const actief = sortKey === key;
              return (
                <button
                  key={key}
                  onClick={() => toggleSort(key)}
                  className={`flex items-center gap-[0.556vw] rounded-full px-[1.111vw] py-[0.417vw] font-body font-medium text-[1.111vw] tracking-[-0.022vw] cursor-pointer border-none transition-colors duration-200 max-md:px-3 max-md:py-1.5 max-md:text-[13px] ${
                    actief
                      ? "bg-green text-off-white"
                      : "bg-off-white text-off-black"
                  }`}
                >
                  {label}
                  <svg
                    viewBox="0 0 12.6 8.84"
                    className={`w-[0.833vw] h-auto max-md:w-[10px] transition-transform duration-300 ${
                      actief && !sortAsc ? "-rotate-90" : "rotate-90"
                    }`}
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12.4243 4.84264C12.6586 4.60833 12.6586 4.22843 12.4243 3.99411L8.60589 0.175736C8.37157 -0.0585785 7.99167 -0.0585785 7.75736 0.175736C7.52304 0.410051 7.52304 0.78995 7.75736 1.02426L11.1515 4.41838L7.75736 7.81249C7.52304 8.0468 7.52304 8.4267 7.75736 8.66102C7.99167 8.89533 8.37157 8.89533 8.60589 8.66102L12.4243 4.84264ZM0 4.41838V5.01838H12V4.41838V3.81838H0V4.41838Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lijst + render */}
        <div
          className={`mt-[1.389vw] grid gap-x-[2.431vw] max-md:mt-6 max-md:grid-cols-1 max-md:gap-y-8 ${
            heeftRender ? "grid-cols-[43.819vw_1fr]" : "grid-cols-1"
          }`}
        >
          <div>
            {woningen.length ? (
              <div className="mb-[1.4vw] max-md:mb-5">
                <WoningFilters
                  filters={filters}
                  onChange={setFilters}
                  aantallen={aantallen}
                  huurBereik={huurBereik}
                  slaapkamerOpties={slaapkamerOpties}
                  resultaatAantal={gefilterd.length}
                  totaalAantal={woningen.length}
                />
              </div>
            ) : null}
            {zichtbareTypes.map((type, i) => (
              <a
                key={type.slug}
                href={`/wonenbij/${projectSlug}/${type.slug}`}
                onClick={(e) => navigate(e, `/wonenbij/${projectSlug}/${type.slug}`)}
                onMouseEnter={() => setHoveredType(type.naam)}
                onMouseLeave={() => setHoveredType(null)}
                className={`grid grid-cols-[14.722vw_1fr] gap-x-[1.528vw] items-start border-t border-off-black/40 py-[1.944vw] no-underline group max-md:grid-cols-[100px_1fr] max-md:gap-x-4 max-md:py-4 ${
                  i === zichtbareTypes.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="relative w-full aspect-[212/138] overflow-hidden">
                  <Image
                    src={type.fotos[0] ?? "/images/wonenbij/aanbod-card.png"}
                    alt={type.naam}
                    fill
                    sizes="(max-width: 768px) 100px, 15vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </div>
                <div className="relative min-h-[9.583vw] max-md:min-h-0">
                  <p className="font-heading font-normal text-[1.667vw] leading-[1.05] text-off-black max-md:text-[17px]">
                    {type.naam}
                  </p>
                  <p className="mt-[0.417vw] font-body font-medium text-[0.833vw] leading-[1.389vw] text-off-black max-md:mt-1 max-md:text-[12px] max-md:leading-[17px]">
                    {STATUS_TYPE_META[type.status]}
                  </p>
                  <div className="mt-[0.694vw] flex items-start gap-[0.694vw] max-md:mt-2 max-md:gap-2">
                    <Image
                      src="/images/wonenbij/icons/key-klein.svg"
                      alt=""
                      width={12}
                      height={12}
                      className="w-[0.833vw] h-auto mt-[0.2vw] max-md:w-[11px]"
                    />
                    <div className="font-body font-medium text-[0.833vw] leading-[1.389vw] text-off-black max-md:text-[12px] max-md:leading-[17px]">
                      <p>{formatPrijs(type.prijsVan)} p/m</p>
                      <p>{type.slaapkamers} slaapkamers</p>
                      <p>{type.oppervlakte} m²</p>
                    </div>
                  </div>
                  <span className="absolute right-0 top-[3.4vw] inline-block bg-green text-off-white rounded-full px-[1.111vw] py-[0.417vw] font-heading font-normal text-[0.764vw] tracking-[-0.015vw] max-md:static max-md:mt-2 max-md:px-3 max-md:py-1 max-md:text-[11px]">
                    Over deze woning
                  </span>
                </div>
              </a>
            ))}
          </div>

          {heeftRender && actiefAanzicht ? (
            <div className="max-md:order-first">
              {views.length > 1 ? (
                <div className="mb-[0.972vw] flex gap-[0.556vw] max-md:mb-3 max-md:gap-2">
                  {views.map((view, i) => (
                    <button
                      key={view.key}
                      onClick={() => {
                        setAanzichtIndex(i);
                        setHoveredWoningId(null);
                      }}
                      aria-pressed={i === aanzichtIndex}
                      className={`rounded-full px-[1.111vw] py-[0.417vw] font-body font-medium text-[1.042vw] tracking-[-0.021vw] cursor-pointer border-none transition-colors duration-200 max-md:px-3 max-md:py-1.5 max-md:text-[13px] ${
                        i === aanzichtIndex
                          ? "bg-off-black text-off-white"
                          : "bg-off-white text-off-black hover:bg-off-black/10"
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <RenderOverlay
                key={actiefAanzicht.key}
                render={actiefAanzicht.render}
                renderAlt={actiefAanzicht.renderAlt}
                renderWidth={actiefAanzicht.renderWidth}
                renderHeight={actiefAanzicht.renderHeight}
                woningen={actiefAanzicht.woningen}
                zichtbareIds={zichtbareIds}
                selectedId={null}
                hoveredId={hoveredWoningId}
                onSelect={openWoning}
                onHover={setHoveredWoningId}
                zones={actiefAanzicht.zones}
                onZoneOpen={openAanzicht}
              />
              <p className="mt-[0.972vw] font-body font-medium text-[0.833vw] leading-[1.25] text-off-black/60 max-md:mt-2 max-md:text-[12px]">
                {actiefAanzicht.zones?.length && actiefAanzicht.woningen.length
                  ? "Klik op een ingetekende woning voor meer informatie, of op het gebouw voor de gevelweergave."
                  : actiefAanzicht.zones?.length
                    ? "Klik op het gebouw om de beschikbare woningen per gevel te bekijken."
                    : "Klik op een woning in het gebouw voor meer informatie en om in te schrijven."}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
