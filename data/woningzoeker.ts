/**
 * Woningzoeker - datamodel voor de render + overlay woningkiezer.
 *
 * Het uitgangspunt: per gebouw is er één render (of foto). Daar wordt éénmalig
 * een polygoon per woning overheen getekend. Die polygonen staan als
 * genormaliseerde coördinaten (0–1) in het CMS, dus ze blijven kloppen op elk
 * schermformaat en bij elke uitsnede van dezelfde render. Daarna hoeft de
 * redactie alleen nog de status om te zetten: beschikbaar → in optie → bezet.
 */

import { voorgevelWoningen } from "@/data/wonenbij";

export type WoningStatus = "beschikbaar" | "in-optie" | "bezet";

/** Fase van het project als geheel - bepaalt de pill op de wonen-bij pagina. */
export type ProjectFase = "binnenkort" | "inschrijving" | "in-verhuur";

/** Genormaliseerd punt: 0 = linker-/bovenrand, 1 = rechter-/onderrand. */
export interface PolygonPoint {
  x: number;
  y: number;
}

export interface Woning {
  /** Stabiele sleutel - in Sanity is dit de _key van het array-item. */
  id: string;
  /** Bouwnummer, bijv. "A.101". */
  nummer: string;
  /** Woningtype, bijv. "Type B - hoekwoning". */
  woningType: string;
  status: WoningStatus;
  verdieping: number;
  /** Gebruiksoppervlakte in m². */
  oppervlakte: number;
  slaapkamers: number;
  /** Kale huur per maand in hele euro's. */
  huurprijs: number;
  orientatie?: string;
  buitenruimte?: string;
  /** Pad naar de plattegrond. */
  plattegrond?: string;
  /** De getekende omtrek. Minimaal 3 punten. */
  polygon: PolygonPoint[];
}

export interface WoningzoekerProject {
  slug: string;
  name: string;
  tagline?: string;
  fase: ProjectFase;
  /** Korte toelichting boven de kiezer. */
  intro?: string;
  render: string;
  renderAlt: string;
  /** Natuurlijke afmetingen van de render - bepaalt de aspect ratio van de viewer. */
  renderWidth: number;
  renderHeight: number;
  woningen: Woning[];
}

/* ─── Statuspresentatie ─────────────────────────────────────────────── */

export const STATUS_META: Record<
  WoningStatus,
  { label: string; color: string; textOnColor: string }
> = {
  beschikbaar: { label: "Beschikbaar", color: "#848F71", textOnColor: "#F7F5F0" },
  "in-optie": { label: "In optie", color: "#9A755D", textOnColor: "#F7F5F0" },
  bezet: { label: "Bezet", color: "#717F8B", textOnColor: "#F7F5F0" },
};

export const STATUS_ORDER: WoningStatus[] = ["beschikbaar", "in-optie", "bezet"];

export const FASE_META: Record<ProjectFase, { label: string; color: string }> = {
  binnenkort: { label: "Binnenkort", color: "#717F8B" },
  inschrijving: { label: "Inschrijving open", color: "#9A755D" },
  "in-verhuur": { label: "In verhuur", color: "#848F71" },
};

export function formatHuur(bedrag: number): string {
  return `€${bedrag.toLocaleString("nl-NL")}`;
}

/* ─── Demodata ──────────────────────────────────────────────────────────
 * Taanschuurkade - 15 woningen over 3 verdiepingen, getekend over de
 * bestaande luchtfoto. Dit staat los van Sanity zodat de proof of concept
 * ook draait zonder CMS-content; zodra het project in Sanity staat wint
 * Sanity altijd (zie app/woningzoeker/[slug]/page.tsx).
 * ------------------------------------------------------------------- */

export const demoProjecten: WoningzoekerProject[] = [
  {
    slug: "taanschuurkade",
    name: "Taanschuurkade",
    tagline: "Wonen aan het water",
    fase: "inschrijving",
    intro:
      "Klik een woning aan op het gevelaanzicht om de plattegrond, oppervlakte en huurprijs te bekijken. De kleur geeft de actuele status aan.",
    render: "/images/woningzoeker/taanschuur-voorgevel.jpg",
    renderAlt: "Voorgevel Zuidwest van Taanschuurkade met beschikbare woningen",
    renderWidth: 3803,
    renderHeight: 2484,
    woningen: voorgevelWoningen,
  },
];

export function getDemoProjectBySlug(slug: string): WoningzoekerProject | undefined {
  return demoProjecten.find((p) => p.slug === slug);
}

export function getAllDemoSlugs(): string[] {
  return demoProjecten.map((p) => p.slug);
}
