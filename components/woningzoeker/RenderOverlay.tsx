"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { STATUS_META, formatHuur } from "@/data/woningzoeker";
import type { PolygonPoint, Woning } from "@/data/woningzoeker";
import type { OverzichtZone } from "@/data/wonenbij";

interface RenderOverlayProps {
  render: string;
  renderAlt: string;
  renderWidth: number;
  renderHeight: number;
  woningen: Woning[];
  /** Woningen die door het filter komen. De rest vervaagt. */
  zichtbareIds: Set<string>;
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  /**
   * Klikbare zones die een ander aanzicht openen (bijv. het gebouw op de
   * luchtfoto). Ze liggen ónder de woningvlakken, zodat een ingetekende
   * woning altijd wint waar ze overlappen.
   */
  zones?: OverzichtZone[];
  onZoneOpen?: (doelKey: string) => void;
  /**
   * Paneel-modus (wonen-bij woningzoeker): het beeld vult de beschikbare
   * ruimte volledig (cover, gecentreerd bijgesneden) in plaats van zijn eigen
   * beeldverhouding af te dwingen. Op desktop vult de overlay de ouder
   * (absolute inset-0); onder lg houdt hij de natuurlijke verhouding aan.
   */
  vullend?: boolean;
  /**
   * Binnen de paneel-modus: beeld volledig passend tonen (contain, op witte
   * achtergrond) i.p.v. bijgesneden — voor technische geveltekeningen.
   */
  passend?: boolean;
  /**
   * Alleen aanzetten waar de render de LCP is (standalone woningzoeker);
   * in een sectie onder de vouw zou priority de hero-preload verdringen.
   */
  prioriteit?: boolean;
}

function toPoints(polygon: PolygonPoint[]): string {
  return polygon.map((p) => `${p.x},${p.y}`).join(" ");
}

/** Zwaartepunt van de polygoon - ankerpunt voor label en tooltip. */
function centroid(polygon: PolygonPoint[]): PolygonPoint {
  const sum = polygon.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / polygon.length, y: sum.y / polygon.length };
}

export default function RenderOverlay({
  render,
  renderAlt,
  renderWidth,
  renderHeight,
  woningen,
  zichtbareIds,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  zones,
  onZoneOpen,
  vullend = false,
  passend = false,
  prioriteit = false,
}: RenderOverlayProps) {
  const [hoveredZoneKey, setHoveredZoneKey] = useState<string | null>(null);
  const active = woningen.find((w) => w.id === (hoveredId ?? selectedId)) ?? null;
  const activeAnchor = active ? centroid(active.polygon) : null;

  // Paneel-modus: meet het paneel en bereken de cover-box waarin beeld,
  // overlay en labels samen leven — zo blijven de polygonen exact geregistreerd
  // terwijl de randen van het beeld wegvallen.
  const panelRef = useRef<HTMLDivElement>(null);
  const [paneel, setPaneel] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!vullend) return;
    const el = panelRef.current;
    if (!el) return;
    const meet = () => setPaneel({ w: el.clientWidth, h: el.clientHeight });
    meet();
    const observer = new ResizeObserver(meet);
    observer.observe(el);
    return () => observer.disconnect();
  }, [vullend]);

  let coverStyle: CSSProperties = { position: "absolute", inset: 0 };
  if (vullend && paneel) {
    // Cover (foto's) snijdt de randen weg; contain (tekeningen) toont alles,
    // met een marge rondom zodat de tekening als object op het paneel ligt.
    const inzet = passend ? 24 : 0;
    const schaal = passend
      ? Math.min(
          (paneel.w - inzet * 2) / renderWidth,
          (paneel.h - inzet * 2) / renderHeight
        )
      : Math.max(paneel.w / renderWidth, paneel.h / renderHeight);
    const w = renderWidth * schaal;
    const h = renderHeight * schaal;
    coverStyle = {
      position: "absolute",
      width: w,
      height: h,
      left: (paneel.w - w) / 2,
      top: (paneel.h - h) / 2,
    };
  }

  if (vullend) {
    return (
      <div
        ref={panelRef}
        className={`relative w-full overflow-hidden lg:absolute lg:inset-0 max-lg:[aspect-ratio:var(--wz-ar)] ${passend ? "bg-off-white" : "bg-off-black/5"}`}
        style={{ "--wz-ar": `${renderWidth} / ${renderHeight}` } as CSSProperties}
      >
        <div style={coverStyle}>{inhoud()}</div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full overflow-hidden bg-off-black/5"
      style={{
        aspectRatio: `${renderWidth} / ${renderHeight}`,
        // Een staande render mag de viewport niet overschrijden - anders scrollt
        // de "sticky" render alsnog uit beeld. De max-breedte volgt uit de
        // beeldverhouding, zodat die exact behouden blijft.
        maxWidth: `calc(76vh * ${renderWidth} / ${renderHeight})`,
      }}
    >
      {inhoud()}
    </div>
  );

  function inhoud() {
    return (
      <>
      <Image
        src={render}
        alt={renderAlt}
        fill
        sizes="(max-width: 768px) 100vw, 60vw"
        className="object-cover"
        priority={prioriteit}
      />

      {/* De overlay deelt exact het coördinatenstelsel van de render:
          viewBox 0–1 plus preserveAspectRatio="none" laat de genormaliseerde
          punten meeschalen met elke weergavegrootte. */}
      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-label="Woningen op de render"
      >
        {/* Zones eerst, zodat de woningvlakken erbovenop liggen. */}
        {zones?.map((zone) => {
          const isHovered = zone.doelKey === hoveredZoneKey;
          return (
            <polygon
              key={`zone-${zone.doelKey}`}
              points={toPoints(zone.polygon)}
              fill="#848F71"
              fillOpacity={isHovered ? 0.32 : 0.14}
              stroke="#F7F5F0"
              strokeOpacity={isHovered ? 1 : 0.65}
              strokeWidth={isHovered ? 2.5 : 1.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              tabIndex={0}
              role="button"
              aria-label={zone.label}
              className="cursor-pointer outline-none transition-[fill-opacity] duration-200 focus-visible:stroke-off-white"
              onClick={() => onZoneOpen?.(zone.doelKey)}
              onMouseEnter={() => setHoveredZoneKey(zone.doelKey)}
              onMouseLeave={() => setHoveredZoneKey(null)}
              onFocus={() => setHoveredZoneKey(zone.doelKey)}
              onBlur={() => setHoveredZoneKey(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onZoneOpen?.(zone.doelKey);
                }
              }}
            >
              <title>{zone.label}</title>
            </polygon>
          );
        })}
        {woningen.map((woning) => {
          const meta = STATUS_META[woning.status];
          const isVisible = zichtbareIds.has(woning.id);
          const isSelected = woning.id === selectedId;
          const isHovered = woning.id === hoveredId;
          const isActive = isSelected || isHovered;

          // Uitgefilterde woningen blijven zichtbaar als vage vorm, zodat je
          // ziet dat er meer is - maar ze trekken geen aandacht meer.
          const fillOpacity = !isVisible ? 0.08 : isActive ? 0.78 : 0.5;
          const strokeOpacity = !isVisible ? 0.2 : 1;

          return (
            <g key={woning.id}>
            {/* Onzichtbare halo als extra tikvlak op touch-apparaten: de echte
                vlakken zijn op een telefoon maar ~15-20px groot. */}
            <polygon
              points={toPoints(woning.polygon)}
              fill="transparent"
              stroke="transparent"
              strokeWidth={24}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="hidden pointer-coarse:block cursor-pointer"
              style={{ pointerEvents: isVisible ? "auto" : "none" }}
              onClick={() => onSelect(woning.id)}
              aria-hidden
            />
            <polygon
              points={toPoints(woning.polygon)}
              fill={meta.color}
              fillOpacity={fillOpacity}
              stroke={isActive ? "#F7F5F0" : meta.color}
              strokeOpacity={strokeOpacity}
              strokeWidth={isActive ? 2.5 : 1}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              tabIndex={isVisible ? 0 : -1}
              role="button"
              aria-label={`${woning.nummer} - ${woning.woningType}, ${meta.label}`}
              aria-pressed={isSelected}
              className="cursor-pointer outline-none transition-[fill-opacity] duration-200 focus-visible:stroke-off-white"
              style={{ pointerEvents: isVisible ? "auto" : "none" }}
              onClick={() => onSelect(woning.id)}
              onMouseEnter={() => onHover(woning.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(woning.id)}
              onBlur={() => onHover(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(woning.id);
                }
              }}
            >
              <title>{`${woning.nummer} - ${meta.label}`}</title>
            </polygon>
            </g>
          );
        })}
      </svg>

      {/* Label bij het zwaartepunt van elke zone - maakt de klik ontdekbaar. */}
      {zones?.map((zone) => {
        const anchor = centroid(zone.polygon);
        const isHovered = zone.doelKey === hoveredZoneKey;
        return (
          <div
            key={`zone-label-${zone.doelKey}`}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${anchor.x * 100}%`, top: `${anchor.y * 100}%` }}
          >
            <span
              className={`inline-block whitespace-nowrap rounded-full px-[0.9vw] py-[0.45vw] font-body text-[0.83vw] font-medium leading-tight text-off-white backdrop-blur-sm transition-colors duration-200 max-lg:px-3 max-lg:py-1.5 max-lg:text-[11px] ${
                isHovered ? "bg-green" : "bg-off-black/85"
              }`}
            >
              {zone.label}
            </span>
          </div>
        );
      })}

      {/* Tooltip bij het zwaartepunt van de actieve woning. */}
      {active && activeAnchor ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${activeAnchor.x * 100}%`,
            top: `${activeAnchor.y * 100}%`,
          }}
        >
          <div className="whitespace-nowrap rounded-full bg-off-black/85 px-[0.9vw] py-[0.45vw] text-center backdrop-blur-sm max-lg:px-3 max-lg:py-1.5">
            <span className="font-body text-[0.83vw] font-medium leading-tight text-off-white max-lg:text-[11px]">
              {active.nummer}
            </span>
            <span className="font-body text-[0.83vw] font-normal leading-tight text-off-white/70 max-lg:text-[11px]">
              {" · "}
              {active.oppervlakte} m²
              {active.status === "beschikbaar"
                ? ` · ${active.prijsVanaf ? "v.a. " : ""}${formatHuur(active.huurprijs)}`
                : ` · ${STATUS_META[active.status].label}`}
            </span>
          </div>
        </div>
      ) : null}
      </>
    );
  }
}
