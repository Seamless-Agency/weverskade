"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import RenderOverlay from "@/components/woningzoeker/RenderOverlay";
import WoningFilters, {
  SorteerVeld,
  type FilterState,
  type SorteerOptie,
} from "@/components/woningzoeker/WoningFilters";
import { STATUS_ORDER } from "@/data/woningzoeker";
import type { Woning, WoningStatus } from "@/data/woningzoeker";
import {
  STATUS_TYPE_META,
  formatPrijs,
  type Aanzicht,
  type WoningType,
  type WoningTypeStatus,
} from "@/data/wonenbij";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { useInView } from "@/hooks/useInView";
import { Reveal, RevealWords } from "@/components/wonenbij/motion";

// Sorteren zit als één menu in de filterbalk (bewuste afwijking van de vier
// losse sorteerknoppen in Figma): alle opties op één plek, naast de filters.
type Sortering =
  | "standaard"
  | "prijs-asc"
  | "prijs-desc"
  | "oppervlakte-asc"
  | "oppervlakte-desc"
  | "slaapkamers-asc"
  | "slaapkamers-desc"
  | "beschikbaarheid";

const SORTEER_OPTIES: (SorteerOptie & { value: Sortering })[] = [
  { value: "standaard", label: "Standaard" },
  { value: "prijs-asc", label: "Prijs: laag - hoog" },
  { value: "prijs-desc", label: "Prijs: hoog - laag" },
  { value: "oppervlakte-asc", label: "Oppervlakte: klein - groot" },
  { value: "oppervlakte-desc", label: "Oppervlakte: groot - klein" },
  { value: "slaapkamers-asc", label: "Slaapkamers: weinig - veel" },
  { value: "slaapkamers-desc", label: "Slaapkamers: veel - weinig" },
  { value: "beschikbaarheid", label: "Beschikbaarheid" },
];

/** Sorteervolgorde op status: eerst wat je nu kunt huren. */
const STATUS_TYPE_VOLGORDE: Record<WoningTypeStatus, number> = {
  beschikbaar: 0,
  inschrijven: 1,
  "in-optie": 2,
  bezet: 3,
};

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
  const [sortering, setSortering] = useState<Sortering>("standaard");
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [hoveredWoningId, setHoveredWoningId] = useState<string | null>(null);
  const [aanzichtIndex, setAanzichtIndex] = useState(0);

  // Affordance: puls de woningvlakken zodra het paneel goed in beeld is, en
  // toon een hint-label tot de bezoeker voor het eerst met de gevel werkt.
  const [paneelKijkRef, paneelInView] = useInView<HTMLDivElement>({
    threshold: 0.35,
  });
  const [hintWeg, setHintWeg] = useState(false);

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
    if (sortering === "standaard") return woningTypes;
    const [veld, richting] = sortering.split("-");
    const factor = richting === "desc" ? -1 : 1;
    return [...woningTypes].sort((a, b) => {
      switch (veld) {
        case "prijs":
          return (a.prijsVan - b.prijsVan) * factor;
        case "oppervlakte":
          return (a.oppervlakte - b.oppervlakte) * factor;
        case "slaapkamers":
          return (a.slaapkamers - b.slaapkamers) * factor;
        case "beschikbaarheid":
          return STATUS_TYPE_VOLGORDE[a.status] - STATUS_TYPE_VOLGORDE[b.status];
        default:
          return 0;
      }
    });
  }, [woningTypes, sortering]);

  const sorteerMenu = {
    waarde: sortering,
    opties: SORTEER_OPTIES,
    onChange: (waarde: string) => setSortering(waarde as Sortering),
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
    navigate.to(
      `/wonenbij/${projectSlug}/${typeSlug}?woning=${encodeURIComponent(woning.nummer)}`
    );
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

  const filtersActief =
    filters.statussen.length !== STATUS_ORDER.length ||
    filters.minSlaapkamers !== 0 ||
    filters.maxHuur < huurBereik.max;

  return (
    // Figma: titel op x=31 (55 onder de fotosectie), resultaatregel op x=36,
    // lijst 35..666, render sluit op 666 aan. Bewuste afwijking: de vier
    // losse sorteerknoppen zijn vervangen door één filterbalk (status,
    // slaapkamers, max. huur en sorteren) zodat filteren en sorteren als
    // één geheel voelen; de teller staat rechts op de titelregel.
    <section id="aanbod" className="bg-white pt-[3.819vw] pb-[8.681vw] max-lg:py-14" data-nav-theme="white">
      <div>
        {/* Titelregel: kop links, resultaatteller (met wissen-link zodra er
            een filter actief is) rechts op dezelfde basislijn */}
        <div className="flex items-end justify-between pl-[2.153vw] pr-[2.847vw] max-lg:block max-lg:px-5">
          <h2 className="font-heading font-normal text-[4.653vw] leading-[5.736vw] tracking-[-0.093vw] text-off-black max-lg:text-[36px] max-lg:leading-[1.1] max-lg:tracking-[-0.72px]">
            <RevealWords text="Woningzoeker" />
          </h2>
          <Reveal
            as="p"
            delay={0.2}
            y={16}
            className="shrink-0 pb-[0.833vw] font-heading font-normal text-[1.667vw] leading-[2.056vw] text-off-black max-lg:mt-5 max-lg:pb-0 max-lg:text-[18px] max-lg:leading-[1.1]"
          >
            {woningen.length
              ? gefilterd.length < woningen.length
                ? `${gefilterd.length} van ${woningen.length} woningen gevonden`
                : `${woningen.length} woningen gevonden`
              : `${woningTypes.length} woningtypes gevonden`}
            {woningen.length && filtersActief ? (
              <button
                onClick={() =>
                  setFilters({
                    statussen: [...STATUS_ORDER],
                    minSlaapkamers: 0,
                    maxHuur: huurBereik.max,
                  })
                }
                className="ml-[1.111vw] align-baseline font-body font-medium text-[0.903vw] leading-none text-off-black/50 underline underline-offset-[0.278vw] cursor-pointer border-none bg-transparent p-0 transition-colors duration-200 hover:text-off-black max-lg:ml-3 max-lg:text-[13px]"
              >
                Filters wissen
              </button>
            ) : null}
          </Reveal>
        </div>

        {/* Filterbalk (desktop): status, slaapkamers en max. huur links,
            sorteren rechts — één geheel op één onderlijn. Zonder woningen
            valt er niets te filteren en blijft alleen het sorteermenu over. */}
        <Reveal
          delay={0.1}
          className="mt-[2.361vw] hidden pl-[2.5vw] pr-[2.847vw] lg:block"
        >
          {woningen.length ? (
            <WoningFilters
              inline
              filters={filters}
              onChange={setFilters}
              aantallen={aantallen}
              huurBereik={huurBereik}
              slaapkamerOpties={slaapkamerOpties}
              resultaatAantal={gefilterd.length}
              totaalAantal={woningen.length}
              sortering={sorteerMenu}
            />
          ) : (
            <div className="flex justify-end">
              <SorteerVeld sortering={sorteerMenu} className="w-[15.278vw]" />
            </div>
          )}
        </Reveal>

        {/* Lijst + render */}
        <Reveal
          delay={0.2}
          duration={1}
          className={`mt-[1.528vw] ml-[2.431vw] mr-[2.569vw] grid max-lg:mt-6 max-lg:mx-5 max-lg:grid-cols-1 max-lg:gap-y-8 ${
            heeftRender ? "grid-cols-[43.819vw_1fr]" : "grid-cols-1"
          }`}
        >
          <div>
            <div className="mb-5 lg:hidden">
              {woningen.length ? (
                <WoningFilters
                  kaal
                  filters={filters}
                  onChange={setFilters}
                  aantallen={aantallen}
                  huurBereik={huurBereik}
                  slaapkamerOpties={slaapkamerOpties}
                  resultaatAantal={gefilterd.length}
                  totaalAantal={woningen.length}
                  sortering={sorteerMenu}
                />
              ) : (
                <SorteerVeld sortering={sorteerMenu} />
              )}
            </div>
            {zichtbareTypes.map((type, i) => (
              <a
                key={type.slug}
                href={`/wonenbij/${projectSlug}/${type.slug}`}
                onClick={(e) => navigate(e, `/wonenbij/${projectSlug}/${type.slug}`)}
                onMouseEnter={() => setHoveredType(type.naam)}
                onMouseLeave={() => setHoveredType(null)}
                className={`grid grid-cols-[14.722vw_1fr] gap-x-[1.181vw] items-start border-t border-off-black/40 pt-[2.014vw] pb-[2.292vw] no-underline group transition-colors duration-200 hover:bg-off-white max-lg:grid-cols-[100px_1fr] max-lg:gap-x-4 max-lg:py-4 ${
                  i === zichtbareTypes.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="relative w-full mt-[0.208vw] aspect-[212/138] overflow-hidden max-lg:mt-0">
                  <Image
                    src={type.fotos[0] ?? "/images/wonenbij/aanbod-card.png"}
                    alt={type.naam}
                    fill
                    sizes="(max-width: 768px) 100px, 15vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </div>
                <div className="relative">
                  <p className="font-heading font-normal text-[1.667vw] leading-[2.056vw] text-off-black max-lg:text-[17px] max-lg:leading-[1.05]">
                    {type.naam}
                  </p>
                  <p className="font-body font-medium text-[0.833vw] leading-[1.389vw] text-off-black max-lg:mt-1 max-lg:text-[12px] max-lg:leading-[17px]">
                    {STATUS_TYPE_META[type.status]}
                  </p>
                  <div className="mt-[2.222vw] max-lg:mt-2">
                    {[
                      { icoon: "key-klein.svg", w: "w-[0.833vw]", tekst: `${formatPrijs(type.prijsVan)} p/m` },
                      { icoon: "bed-klein.svg", w: "w-[0.972vw]", tekst: `${type.slaapkamers} ${type.slaapkamers === 1 ? "slaapkamer" : "slaapkamers"}` },
                      { icoon: "m2-klein.svg", w: "w-[0.764vw]", tekst: `${type.oppervlakte} m²` },
                    ].map(({ icoon, w, tekst }) => (
                      <div key={icoon} className="flex items-center h-[1.389vw] max-lg:h-[17px]">
                        <div className="ml-[0.139vw] w-[1.111vw] flex justify-center shrink-0 max-lg:ml-0 max-lg:w-[14px]">
                          <Image
                            src={`/images/wonenbij/icons/${icoon}`}
                            alt=""
                            width={16}
                            height={12}
                            className={`${w} h-auto max-lg:w-[11px]`}
                          />
                        </div>
                        <p className="ml-[1.111vw] font-body font-medium text-[0.833vw] leading-[1.389vw] text-off-black max-lg:ml-2 max-lg:text-[12px] max-lg:leading-[17px]">
                          {tekst}
                        </p>
                      </div>
                    ))}
                  </div>
                  <span className="absolute right-[3.611vw] top-[7.708vw] inline-flex items-center justify-center w-[8.056vw] h-[1.875vw] bg-green text-off-white rounded-full font-heading font-normal text-[0.764vw] leading-[0.944vw] tracking-[-0.015vw] max-lg:static max-lg:mt-2 max-lg:inline-block max-lg:w-auto max-lg:h-auto max-lg:px-3 max-lg:py-1 max-lg:text-[11px] max-lg:leading-normal">
                    Over deze woning
                  </span>
                </div>
              </a>
            ))}
          </div>

          {heeftRender && actiefAanzicht ? (
            // Figma: de render is een paneel dat exact even hoog is als de
            // lijst en er naadloos tegenaan ligt. Het Figma-frame kende maar
            // drie typekaarten; bij een langere lijst zou het paneel onbeperkt
            // meegroeien. Daarom is het paneel gemaxt op de viewport en plakt
            // het (sticky) terwijl de lijst doorscrolt — bij een korte lijst
            // volgt het gewoon de lijsthoogte en blijft het exact Figma. De
            // aanzicht-knoppen liggen als overlay op het paneel zodat de
            // gelijke hoogte nooit breekt; op mobiel staan ze eronder.
            <div className="max-lg:order-first">
              {/* Het paneel volgt de beeldverhouding van het actieve aanzicht:
                  zo vult de foto het paneel rand-tot-rand (Figma) zonder dat
                  cover iets van de klikbare gevel afsnijdt. Het plakt
                  verticaal gecentreerd in de viewport, zodat de restruimte
                  op hoge schermen boven en onder verdeeld wordt i.p.v. als
                  één gat onder de foto te vallen. --wz-paneel-h = de
                  paneelbreedte (100vw - marges - lijstkolom = 51.181vw)
                  gedeeld door de beeldverhouding. */}
              <div
                ref={paneelKijkRef}
                className="relative lg:sticky lg:top-[max(1.389vw,calc((100svh-var(--wz-paneel-h))/2))] lg:max-h-[calc(100svh-2.778vw)]"
                style={{
                  aspectRatio: `${actiefAanzicht.renderWidth} / ${actiefAanzicht.renderHeight}`,
                  "--wz-paneel-h": `${((51.181 * actiefAanzicht.renderHeight) / actiefAanzicht.renderWidth).toFixed(3)}vw`,
                } as React.CSSProperties}
              >
              <RenderOverlay
                key={actiefAanzicht.key}
                vullend
                passend={actiefAanzicht.weergave === "passend"}
                pulseer={paneelInView}
                render={actiefAanzicht.render}
                renderAlt={actiefAanzicht.renderAlt}
                renderWidth={actiefAanzicht.renderWidth}
                renderHeight={actiefAanzicht.renderHeight}
                woningen={actiefAanzicht.woningen}
                zichtbareIds={zichtbareIds}
                selectedId={null}
                hoveredId={hoveredWoningId}
                onSelect={openWoning}
                onHover={(id) => {
                  setHoveredWoningId(id);
                  if (id) setHintWeg(true);
                }}
                zones={actiefAanzicht.zones}
                onZoneOpen={openAanzicht}
              />
              {/* Hint dat de gevel interactief is; verdwijnt na de eerste
                  hover/tik op een woningvlak. */}
              <div
                aria-hidden={hintWeg}
                className={`pointer-events-none absolute top-[1.111vw] left-[1.111vw] z-10 transition-opacity duration-500 max-lg:top-3 max-lg:left-3 ${
                  hintWeg ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="inline-flex items-center bg-off-black/75 text-off-white rounded-full h-[2.083vw] px-[1.042vw] font-body font-medium text-[0.903vw] leading-none max-lg:h-auto max-lg:px-3 max-lg:py-1.5 max-lg:text-[12px]">
                  <span className="max-lg:hidden">
                    Beweeg over de gevel voor prijs en beschikbaarheid
                  </span>
                  <span className="hidden max-lg:inline">
                    Tik op een woning op de gevel
                  </span>
                </span>
              </div>
              {views.length > 1 ? (
                <div className="absolute bottom-[1.111vw] left-[1.111vw] z-10 hidden gap-[0.556vw] lg:flex">
                  {views.map((view, i) => (
                    <button
                      key={view.key}
                      onClick={() => {
                        setAanzichtIndex(i);
                        setHoveredWoningId(null);
                      }}
                      aria-pressed={i === aanzichtIndex}
                      className={`rounded-full border px-[1.111vw] py-[0.417vw] font-body font-medium text-[1.042vw] tracking-[-0.021vw] cursor-pointer transition-colors duration-200 ${
                        i === aanzichtIndex
                          ? "border-transparent bg-off-black text-off-white"
                          : "border-off-black/15 bg-off-white/90 text-off-black hover:bg-off-white"
                      }`}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="lg:hidden">
                {views.length > 1 ? (
                  <div className="mt-3 flex gap-2">
                    {views.map((view, i) => (
                      <button
                        key={view.key}
                        onClick={() => {
                          setAanzichtIndex(i);
                          setHoveredWoningId(null);
                        }}
                        aria-pressed={i === aanzichtIndex}
                        className={`rounded-full px-4 py-3 font-body font-medium text-[14px] cursor-pointer border-none transition-colors duration-200 ${
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
                <p className="mt-2 font-body font-medium text-[12px] leading-[1.25] text-off-black/60">
                  {actiefAanzicht.zones?.length && actiefAanzicht.woningen.length
                    ? "Klik op een ingetekende woning voor meer informatie, of op het gebouw voor de gevelweergave."
                    : actiefAanzicht.zones?.length
                      ? "Klik op het gebouw om de beschikbare woningen per gevel te bekijken."
                      : "Klik op een woning in het gebouw voor meer informatie en om in te schrijven."}
                </p>
              </div>
              </div>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
