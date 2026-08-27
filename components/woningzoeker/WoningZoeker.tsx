"use client";

import { useMemo, useRef, useState } from "react";
import RenderOverlay from "./RenderOverlay";
import WoningFilters, { type FilterState } from "./WoningFilters";
import WoningList from "./WoningList";
import WoningDetail from "./WoningDetail";
import {
  FASE_META,
  STATUS_META,
  STATUS_ORDER,
  type WoningStatus,
  type WoningzoekerProject,
} from "@/data/woningzoeker";

interface WoningZoekerProps {
  project: WoningzoekerProject;
}

export default function WoningZoeker({ project }: WoningZoekerProps) {
  const { woningen } = project;

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const zichtbaar = useMemo(
    () =>
      woningen.filter(
        (w) =>
          filters.statussen.includes(w.status) &&
          w.slaapkamers >= filters.minSlaapkamers &&
          w.huurprijs <= filters.maxHuur
      ),
    [woningen, filters]
  );

  const zichtbareIds = useMemo(
    () => new Set(zichtbaar.map((w) => w.id)),
    [zichtbaar]
  );

  const gesorteerd = useMemo(
    () =>
      [...zichtbaar].sort(
        (a, b) => b.verdieping - a.verdieping || a.nummer.localeCompare(b.nummer)
      ),
    [zichtbaar]
  );

  const selected = woningen.find((w) => w.id === selectedId) ?? null;
  const fase = FASE_META[project.fase];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Op mobiel staat het paneel onder de render - breng het in beeld.
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  };

  return (
    <section className="bg-off-white">
      {/* ─── Kop ─── */}
      <div className="px-[2.431vw] pt-[2.8vw] max-md:px-5 max-md:pt-8">
        <div className="flex items-end justify-between gap-[2vw] max-md:flex-col max-md:items-start max-md:gap-4">
          <div>
            <span
              className="inline-block rounded-full px-[1vw] py-[0.4vw] font-heading text-[0.9vw] font-normal text-off-white max-md:px-4 max-md:py-1.5 max-md:text-[13px]"
              style={{ backgroundColor: fase.color }}
            >
              {fase.label}
            </span>
            <h2 className="mt-[0.8vw] font-body text-[3.2vw] font-medium leading-[1.05] tracking-[-0.06vw] text-off-black max-md:mt-4 max-md:text-[32px] max-md:tracking-[-0.5px]">
              Beschikbare woningen
            </h2>
          </div>
          {project.intro ? (
            <p className="max-w-[28vw] font-body text-[1.05vw] font-medium leading-snug text-off-black/60 max-md:max-w-none max-md:text-[15px]">
              {project.intro}
            </p>
          ) : null}
        </div>
      </div>

      {/* ─── Render + paneel ─── */}
      <div className="mt-[1.8vw] grid grid-cols-[1.55fr_1fr] items-start gap-[1.6vw] px-[2.431vw] pb-[4vw] max-md:mt-6 max-md:grid-cols-1 max-md:gap-0 max-md:px-5 max-md:pb-12">
        {/* Render - blijft in beeld tijdens het scrollen door de lijst. */}
        <div className="sticky top-[6vw] max-md:static">
          <RenderOverlay
            render={project.render}
            renderAlt={project.renderAlt}
            renderWidth={project.renderWidth}
            renderHeight={project.renderHeight}
            woningen={woningen}
            zichtbareIds={zichtbareIds}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={handleSelect}
            onHover={setHoveredId}
          />

          {/* Legenda */}
          <div className="mt-[0.9vw] flex flex-wrap items-center gap-x-[1.4vw] gap-y-[0.4vw] max-md:mt-4 max-md:gap-x-5 max-md:gap-y-2">
            {STATUS_ORDER.map((status) => (
              <span key={status} className="flex items-center gap-[0.45vw] max-md:gap-2">
                <span
                  aria-hidden
                  className="h-[0.6vw] w-[0.6vw] rounded-full max-md:h-2.5 max-md:w-2.5"
                  style={{ backgroundColor: STATUS_META[status].color }}
                />
                <span className="font-body text-[0.85vw] font-normal text-off-black/55 max-md:text-[12px]">
                  {STATUS_META[status].label} ({aantallen[status]})
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Paneel - filters + lijst, of het detail van één woning. */}
        <div ref={panelRef} className="max-md:mt-8 max-md:scroll-mt-4">
          {selected ? (
            <WoningDetail
              key={selected.id}
              woning={selected}
              projectName={project.name}
              projectSlug={project.slug}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <>
              <WoningFilters
                filters={filters}
                onChange={setFilters}
                aantallen={aantallen}
                huurBereik={huurBereik}
                slaapkamerOpties={slaapkamerOpties}
                resultaatAantal={zichtbaar.length}
                totaalAantal={woningen.length}
              />
              <div className="mt-[0.5vw] max-md:mt-2">
                <WoningList
                  woningen={gesorteerd}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  onSelect={handleSelect}
                  onHover={setHoveredId}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
