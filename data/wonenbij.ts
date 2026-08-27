/**
 * Wonen bij Weverskade - datamodel + demo-content voor de aparte
 * wonen-omgeving (wonenbij.weverskade.com).
 *
 * Zelfde conventie als de rest van de site: Sanity is leidend, maar elke
 * pagina rendert ook zonder CMS-content op basis van deze fallback-data.
 * De demo volgt 1:1 de Figma-frames van 23 juli 2026.
 */

import type { PolygonPoint, Woning } from "@/data/woningzoeker";

/* ─── Types ─────────────────────────────────────────────────────────── */

export type WoningTypeStatus =
  | "inschrijven"
  | "beschikbaar"
  | "in-optie"
  | "bezet";

export interface OmschrijvingBlok {
  kop: string;
  tekst: string;
}

export interface WoningType {
  slug: string;
  naam: string;
  status: WoningTypeStatus;
  prijsVan: number;
  prijsTot?: number;
  oppervlakte: number;
  slaapkamers: number;
  energielabel?: string;
  buitenruimte?: string;
  fotos: string[];
  plattegronden: string[];
  plattegrondLabel?: string;
  omschrijving: OmschrijvingBlok[];
}

export interface Feit {
  icoon: FeitIcoon;
  label: string;
  waarde: string;
}

export type FeitIcoon =
  | "locatie"
  | "woningen"
  | "oppervlakte"
  | "slaapkamers"
  | "buitenruimte"
  | "duurzaamheid"
  | "huurprijs"
  | "beschikbaarheid";

export interface PlanningFase {
  periode: string;
  titel: string;
  omschrijving: string;
  verwachtingenTitel?: string;
  verwachtingen: string[];
  actief?: boolean;
}

export interface DownloadItem {
  titel: string;
  url: string;
}

export interface FaqItem {
  vraag: string;
  antwoord: string;
}

export interface LocatieItem {
  titel: string;
  tekst: string;
}

/** Klikbaar gebied op een overzichtsbeeld dat een ander aanzicht opent. */
export interface OverzichtZone {
  /** `key` van het aanzicht dat opent bij klik. */
  doelKey: string;
  label: string;
  polygon: PolygonPoint[];
}

/** Eén gevelaanzicht in de woningzoeker: een render met overgetrokken woningen. */
export interface Aanzicht {
  key: string;
  label: string;
  render: string;
  renderAlt: string;
  renderWidth: number;
  renderHeight: number;
  woningen: Woning[];
  /**
   * Klikbare zones die een ander aanzicht openen. Een aanzicht met zones is
   * een overzichtsbeeld (zoals de luchtfoto): het toont geen woningvlakken,
   * maar linkt door naar de gevel-aanzichten met de overlay.
   */
  zones?: OverzichtZone[];
}

export interface WonenBijProject {
  slug: string;
  naam: string;
  plaats: string;
  heroImage: string;
  intro: string;
  feiten: Feit[];
  hurenFotos: string[];
  begeleiding: BegeleidingSectie;
  welkomLabel: string;
  welkomTitel: string;
  welkomTekst: string;
  welkomTekstRechts: string;
  welkomFotos: string[];
  carouselFotos: string[];
  locatieLabel: string;
  locatieTitel: string;
  locatieIntro: string;
  locatieItems: LocatieItem[];
  mapImage?: string;
  mapLat?: number;
  mapLng?: number;
  planning: PlanningFase[];
  downloads: DownloadItem[];
  faq: FaqItem[];
  woningTypes: WoningType[];
  /** Render + overgetrokken woningen voor de woningzoeker-overlay. */
  render?: string;
  renderAlt?: string;
  renderWidth?: number;
  renderHeight?: number;
  woningen: Woning[];
  /** Meerdere gevelaanzichten (voor/achter); heeft voorrang op de losse render. */
  aanzichten?: Aanzicht[];
}

export interface BegeleidingSectie {
  label: string;
  titel: string;
  punten: string[];
  slotTekst: string;
  knopTekst: string;
}

export const STATUS_TYPE_META: Record<WoningTypeStatus, string> = {
  inschrijven: "Status: inschrijven mogelijk",
  beschikbaar: "Status: direct beschikbaar",
  "in-optie": "Status: in optie",
  bezet: "Status: verhuurd",
};

export function formatPrijs(bedrag: number): string {
  return `€${bedrag.toLocaleString("nl-NL")}`;
}

/* ─── Demo: woningtypes Taanschuurkade ──────────────────────────────── */

const OMSCHRIJVING_STANDAARD: OmschrijvingBlok[] = [
  {
    kop: "Over dit appartement",
    tekst:
      "Dit appartement is ontworpen met oog voor comfort, ruimte en dagelijks gemak. De slimme indeling, royale raampartijen en hoogwaardige afwerking zorgen voor een lichte en aangename leefomgeving. Met een moderne keuken, comfortabele slaapkamers en een fijne buitenruimte biedt deze woning alles wat u nodig heeft om zorgeloos te wonen in Taanschuurkade.",
  },
  {
    kop: "Duurzaam wonen",
    tekst:
      "Dankzij energiezuinige installaties en een energielabel A+++ woon je comfortabel met een lager energieverbruik. Een toekomstbestendige woning waarin duurzaamheid en wooncomfort vanzelfsprekend samengaan.",
  },
  {
    kop: "Hoogwaardige afwerking",
    tekst:
      "Het appartement wordt zorgvuldig en stijlvol afgewerkt. De moderne keuken, comfortabele badkamer en kwalitatieve materialen vormen samen een rustige basis die je helemaal naar eigen smaak kunt inrichten.",
  },
  {
    kop: "Keuken",
    tekst:
      "De moderne keuken is praktisch ingedeeld en voorzien van eigentijdse inbouwapparatuur. Een comfortabele plek om dagelijks te koken en gezellig samen te komen.",
  },
];

const demoWoningTypes: WoningType[] = [
  {
    slug: "type-a-hoekappartement",
    naam: "Type A - hoekappartement",
    status: "inschrijven",
    prijsVan: 1495,
    prijsTot: 1555,
    oppervlakte: 82,
    slaapkamers: 2,
    energielabel: "A+++",
    buitenruimte: "12 m² terras",
    fotos: ["/images/wonenbij/woning-foto.png", "/images/wonenbij/picture-1.jpg"],
    plattegronden: ["/images/woningzoeker/plattegrond-type-a.svg"],
    plattegrondLabel: "Plattegrond eerste verdieping",
    omschrijving: OMSCHRIJVING_STANDAARD,
  },
  {
    slug: "type-b-doorzonappartement",
    naam: "Type B - doorzonappartement",
    status: "inschrijven",
    prijsVan: 1665,
    prijsTot: 1850,
    oppervlakte: 96,
    slaapkamers: 3,
    energielabel: "A+++",
    buitenruimte: "8 m² balkon",
    fotos: ["/images/wonenbij/picture-1.jpg", "/images/wonenbij/woning-foto.png"],
    plattegronden: [
      "/images/wonenbij/plattegrond-type-b.jpg",
      "/images/woningzoeker/plattegrond-type-b.svg",
    ],
    plattegrondLabel: "Plattegrond eerste verdieping",
    omschrijving: OMSCHRIJVING_STANDAARD,
  },
  {
    slug: "type-c-penthouse",
    naam: "Type C - penthouse",
    status: "inschrijven",
    prijsVan: 2245,
    prijsTot: 2350,
    oppervlakte: 124,
    slaapkamers: 3,
    energielabel: "A+++",
    buitenruimte: "12 m² balkon",
    fotos: ["/images/wonenbij/carousel-2.png", "/images/wonenbij/woning-foto.png"],
    plattegronden: ["/images/woningzoeker/plattegrond-type-c.svg"],
    plattegrondLabel: "Plattegrond bovenste verdieping",
    omschrijving: OMSCHRIJVING_STANDAARD,
  },
];

/* ─── Demo: woningen op de gevelaanzichten ──────────────────────────
 * Overgetrokken van de aangeleverde huisnummeroverzichten (WEV24003):
 * Voorgevel Zuidwest (11A–17D) en Achtergevel Noordoost (11D–17H).
 * De vlakken zijn per woning uit de kleurcodering van de tekening
 * gedetecteerd en genormaliseerd (0–1). In productie trekt de redactie
 * ze over met de PolygonTracer in Sanity.
 * ------------------------------------------------------------------- */

function rechthoek(x0: number, y0: number, x1: number, y1: number) {
  return [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
}

export const voorgevelWoningen: Woning[] = [
  {
    id: "17a", nummer: "17A", woningType: "Type C - penthouse",
    status: "beschikbaar", verdieping: 3, oppervlakte: 124, slaapkamers: 3,
    huurprijs: 2245, orientatie: "Zuidwest", buitenruimte: "Balkon 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-c.svg",
    polygon: rechthoek(0.4407, 0.6135, 0.5585, 0.6715),
  },
  {
    id: "17b", nummer: "17B", woningType: "Type C - penthouse",
    status: "in-optie", verdieping: 3, oppervlakte: 124, slaapkamers: 3,
    huurprijs: 2260, orientatie: "Zuidwest", buitenruimte: "Balkon 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-c.svg",
    polygon: rechthoek(0.5638, 0.6135, 0.6758, 0.6715),
  },
  {
    id: "17c", nummer: "17C", woningType: "Type C - penthouse",
    status: "beschikbaar", verdieping: 3, oppervlakte: 124, slaapkamers: 3,
    huurprijs: 2275, orientatie: "Zuidwest", buitenruimte: "Balkon 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-c.svg",
    polygon: rechthoek(0.6805, 0.6135, 0.8004, 0.6715),
  },
  {
    id: "17d", nummer: "17D", woningType: "Type C - penthouse",
    status: "beschikbaar", verdieping: 3, oppervlakte: 124, slaapkamers: 3,
    huurprijs: 2290, orientatie: "Zuidwest", buitenruimte: "Balkon 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-c.svg",
    polygon: rechthoek(0.8062, 0.6135, 0.9209, 0.6715),
  },
  {
    id: "15a", nummer: "15A", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1745, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.4407, 0.6852, 0.5543, 0.7432),
  },
  {
    id: "15b", nummer: "15B", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1760, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.5590, 0.6852, 0.6800, 0.7432),
  },
  {
    id: "15c", nummer: "15C", woningType: "Type B - doorzonappartement",
    status: "in-optie", verdieping: 2, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1775, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.6852, 0.6852, 0.7967, 0.7432),
  },
  {
    id: "15d", nummer: "15D", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1790, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.8015, 0.6852, 0.9266, 0.7432),
  },
  {
    id: "13a", nummer: "13A", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1665, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.4423, 0.7560, 0.5585, 0.8140),
  },
  {
    id: "13b", nummer: "13B", woningType: "Type B - doorzonappartement",
    status: "bezet", verdieping: 1, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1680, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.5638, 0.7560, 0.6758, 0.8140),
  },
  {
    id: "13c", nummer: "13C", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1695, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.6805, 0.7560, 0.8004, 0.8140),
  },
  {
    id: "13d", nummer: "13D", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1710, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.8062, 0.7560, 0.9209, 0.8140),
  },
  {
    id: "11a", nummer: "11A", woningType: "Type A - hoekappartement",
    status: "beschikbaar", verdieping: 0, oppervlakte: 82, slaapkamers: 2,
    huurprijs: 1495, orientatie: "Zuidwest", buitenruimte: "Terras 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-a.svg",
    polygon: rechthoek(0.5590, 0.8277, 0.6800, 0.8841),
  },
  {
    id: "11b", nummer: "11B", woningType: "Type A - hoekappartement",
    status: "in-optie", verdieping: 0, oppervlakte: 82, slaapkamers: 2,
    huurprijs: 1510, orientatie: "Zuidwest", buitenruimte: "Terras 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-a.svg",
    polygon: rechthoek(0.6852, 0.8277, 0.7967, 0.8841),
  },
  {
    id: "11c", nummer: "11C", woningType: "Type A - hoekappartement",
    status: "beschikbaar", verdieping: 0, oppervlakte: 82, slaapkamers: 2,
    huurprijs: 1525, orientatie: "Zuidwest", buitenruimte: "Terras 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-a.svg",
    polygon: rechthoek(0.8015, 0.8277, 0.9266, 0.8841),
  },
];

export const achtergevelWoningen: Woning[] = [
  {
    id: "17e", nummer: "17E", woningType: "Type C - penthouse",
    status: "beschikbaar", verdieping: 3, oppervlakte: 124, slaapkamers: 3,
    huurprijs: 2305, orientatie: "Noordoost", buitenruimte: "Balkon 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-c.svg",
    polygon: rechthoek(0.0730, 0.6175, 0.2062, 0.6773),
  },
  {
    id: "17f", nummer: "17F", woningType: "Type C - penthouse",
    status: "beschikbaar", verdieping: 3, oppervlakte: 124, slaapkamers: 3,
    huurprijs: 2320, orientatie: "Noordoost", buitenruimte: "Balkon 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-c.svg",
    polygon: rechthoek(0.2112, 0.6175, 0.3290, 0.6773),
  },
  {
    id: "17h", nummer: "17H", woningType: "Type C - penthouse",
    status: "beschikbaar", verdieping: 3, oppervlakte: 124, slaapkamers: 3,
    huurprijs: 2350, orientatie: "Noordoost", buitenruimte: "Balkon 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-c.svg",
    polygon: rechthoek(0.3345, 0.6175, 0.4650, 0.6773),
  },
  {
    id: "15e", nummer: "15E", woningType: "Type B - doorzonappartement",
    status: "bezet", verdieping: 2, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1805, orientatie: "Noordoost", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.0818, 0.6916, 0.2013, 0.7482),
  },
  {
    id: "15f", nummer: "15F", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1820, orientatie: "Noordoost", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.2068, 0.6916, 0.3334, 0.7482),
  },
  {
    id: "15h", nummer: "15H", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1850, orientatie: "Noordoost", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.3390, 0.6916, 0.4656, 0.7482),
  },
  {
    id: "13e", nummer: "13E", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1725, orientatie: "Noordoost", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.0730, 0.7602, 0.2062, 0.8199),
  },
  {
    id: "13f", nummer: "13F", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1740, orientatie: "Noordoost", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.2112, 0.7602, 0.3290, 0.8199),
  },
  {
    id: "13h", nummer: "13H", woningType: "Type B - doorzonappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 96, slaapkamers: 3,
    huurprijs: 1770, orientatie: "Noordoost", buitenruimte: "Balkon 8 m²",
    plattegrond: "/images/wonenbij/plattegrond-type-b.jpg",
    polygon: rechthoek(0.3345, 0.7602, 0.4656, 0.8199),
  },
  {
    id: "11d", nummer: "11D", woningType: "Type A - hoekappartement",
    status: "beschikbaar", verdieping: 0, oppervlakte: 82, slaapkamers: 2,
    huurprijs: 1540, orientatie: "Noordoost", buitenruimte: "Terras 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-a.svg",
    polygon: rechthoek(0.0818, 0.8311, 0.2013, 0.8876),
  },
  {
    id: "11e", nummer: "11E", woningType: "Type A - hoekappartement",
    status: "beschikbaar", verdieping: 0, oppervlakte: 82, slaapkamers: 2,
    huurprijs: 1555, orientatie: "Noordoost", buitenruimte: "Terras 12 m²",
    plattegrond: "/images/woningzoeker/plattegrond-type-a.svg",
    polygon: rechthoek(0.2074, 0.8311, 0.3340, 0.8876),
  },
];

const PLATTEGROND_A = "/images/woningzoeker/plattegrond-type-a.svg";
const PLATTEGROND_B = "/images/woningzoeker/plattegrond-type-b.svg";
const PLATTEGROND_C = "/images/woningzoeker/plattegrond-type-c.svg";

/* Tweede demo: dezelfde woningkiezer, maar dan op een luchtfoto/render in
 * plaats van een gevelaanzicht - laat zien dat het patroon op elk beeld werkt.
 * Ook hergebruikt als luchtfoto-aanzicht in de wonen-bij woningzoeker. */
export const luchtfotoWoningen: Woning[] = [
  {
    id: "a301", nummer: "A.301", woningType: "Type C - penthouse",
    status: "bezet", verdieping: 3, oppervlakte: 118, slaapkamers: 3,
    huurprijs: 2150, orientatie: "Zuidwest", buitenruimte: "Dakterras 22 m²",
    plattegrond: PLATTEGROND_C,
    polygon: [
      { x: 0.2, y: 0.3782 }, { x: 0.2386, y: 0.3978 },
      { x: 0.24, y: 0.4264 }, { x: 0.2014, y: 0.4053 },
    ],
  },
  {
    id: "a302", nummer: "A.302", woningType: "Type C - penthouse",
    status: "beschikbaar", verdieping: 3, oppervlakte: 124, slaapkamers: 3,
    huurprijs: 2245, orientatie: "Zuidwest", buitenruimte: "Dakterras 24 m²",
    plattegrond: PLATTEGROND_C,
    polygon: [
      { x: 0.2434, y: 0.4003 }, { x: 0.282, y: 0.4199 },
      { x: 0.2833, y: 0.4502 }, { x: 0.2447, y: 0.429 },
    ],
  },
  {
    id: "a303", nummer: "A.303", woningType: "Type B - doorzonwoning",
    status: "in-optie", verdieping: 3, oppervlakte: 96, slaapkamers: 2,
    huurprijs: 1795, orientatie: "Zuidwest", buitenruimte: "Balkon 9 m²",
    plattegrond: PLATTEGROND_B,
    polygon: [
      { x: 0.2868, y: 0.4224 }, { x: 0.3254, y: 0.442 },
      { x: 0.3266, y: 0.4739 }, { x: 0.288, y: 0.4528 },
    ],
  },
  {
    id: "a304", nummer: "A.304", woningType: "Type B - doorzonwoning",
    status: "beschikbaar", verdieping: 3, oppervlakte: 96, slaapkamers: 2,
    huurprijs: 1795, orientatie: "Zuidwest", buitenruimte: "Balkon 9 m²",
    plattegrond: PLATTEGROND_B,
    polygon: [
      { x: 0.3302, y: 0.4444 }, { x: 0.3688, y: 0.4641 },
      { x: 0.3699, y: 0.4976 }, { x: 0.3313, y: 0.4765 },
    ],
  },
  {
    id: "a305", nummer: "A.305", woningType: "Type C - penthouse",
    status: "beschikbaar", verdieping: 3, oppervlakte: 131, slaapkamers: 4,
    huurprijs: 2390, orientatie: "West", buitenruimte: "Dakterras 28 m²",
    plattegrond: PLATTEGROND_C,
    polygon: [
      { x: 0.3736, y: 0.4665 }, { x: 0.4122, y: 0.4862 },
      { x: 0.4132, y: 0.5213 }, { x: 0.3746, y: 0.5002 },
    ],
  },
  {
    id: "a201", nummer: "A.201", woningType: "Type A - hoekwoning",
    status: "bezet", verdieping: 2, oppervlakte: 82, slaapkamers: 2,
    huurprijs: 1545, orientatie: "Zuid", buitenruimte: "Balkon 7 m²",
    plattegrond: PLATTEGROND_A,
    polygon: [
      { x: 0.2017, y: 0.4109 }, { x: 0.2402, y: 0.4323 },
      { x: 0.2415, y: 0.4609 }, { x: 0.2031, y: 0.438 },
    ],
  },
  {
    id: "a202", nummer: "A.202", woningType: "Type B - doorzonwoning",
    status: "beschikbaar", verdieping: 2, oppervlakte: 94, slaapkamers: 2,
    huurprijs: 1720, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: PLATTEGROND_B,
    polygon: [
      { x: 0.245, y: 0.4349 }, { x: 0.2835, y: 0.4563 },
      { x: 0.2847, y: 0.4866 }, { x: 0.2463, y: 0.4637 },
    ],
  },
  {
    id: "a203", nummer: "A.203", woningType: "Type B - doorzonwoning",
    status: "beschikbaar", verdieping: 2, oppervlakte: 94, slaapkamers: 2,
    huurprijs: 1720, orientatie: "Zuidwest", buitenruimte: "Balkon 8 m²",
    plattegrond: PLATTEGROND_B,
    polygon: [
      { x: 0.2883, y: 0.459 }, { x: 0.3268, y: 0.4804 },
      { x: 0.3279, y: 0.5122 }, { x: 0.2895, y: 0.4894 },
    ],
  },
  {
    id: "a204", nummer: "A.204", woningType: "Type A - hoekwoning",
    status: "in-optie", verdieping: 2, oppervlakte: 79, slaapkamers: 1,
    huurprijs: 1485, orientatie: "West", buitenruimte: "Balkon 6 m²",
    plattegrond: PLATTEGROND_A,
    polygon: [
      { x: 0.3316, y: 0.483 }, { x: 0.3701, y: 0.5044 },
      { x: 0.3711, y: 0.5379 }, { x: 0.3327, y: 0.5151 },
    ],
  },
  {
    id: "a205", nummer: "A.205", woningType: "Type B - doorzonwoning",
    status: "beschikbaar", verdieping: 2, oppervlakte: 98, slaapkamers: 3,
    huurprijs: 1810, orientatie: "West", buitenruimte: "Balkon 10 m²",
    plattegrond: PLATTEGROND_B,
    polygon: [
      { x: 0.3749, y: 0.5071 }, { x: 0.4134, y: 0.5285 },
      { x: 0.4144, y: 0.5636 }, { x: 0.3759, y: 0.5407 },
    ],
  },
  {
    id: "a101", nummer: "A.101", woningType: "Type A - hoekwoning",
    status: "beschikbaar", verdieping: 1, oppervlakte: 80, slaapkamers: 2,
    huurprijs: 1495, orientatie: "Zuid", buitenruimte: "Tuin 24 m²",
    plattegrond: PLATTEGROND_A,
    polygon: [
      { x: 0.2034, y: 0.4436 }, { x: 0.2418, y: 0.4667 },
      { x: 0.2431, y: 0.4953 }, { x: 0.2047, y: 0.4707 },
    ],
  },
  {
    id: "a102", nummer: "A.102", woningType: "Type A - hoekwoning",
    status: "bezet", verdieping: 1, oppervlakte: 80, slaapkamers: 2,
    huurprijs: 1495, orientatie: "Zuidwest", buitenruimte: "Tuin 22 m²",
    plattegrond: PLATTEGROND_A,
    polygon: [
      { x: 0.2465, y: 0.4696 }, { x: 0.285, y: 0.4928 },
      { x: 0.2862, y: 0.523 }, { x: 0.2478, y: 0.4984 },
    ],
  },
  {
    id: "a103", nummer: "A.103", woningType: "Type B - doorzonwoning",
    status: "beschikbaar", verdieping: 1, oppervlakte: 92, slaapkamers: 2,
    huurprijs: 1665, orientatie: "Zuidwest", buitenruimte: "Tuin 31 m²",
    plattegrond: PLATTEGROND_B,
    polygon: [
      { x: 0.2897, y: 0.4956 }, { x: 0.3282, y: 0.5188 },
      { x: 0.3293, y: 0.5506 }, { x: 0.2909, y: 0.526 },
    ],
  },
  {
    id: "a104", nummer: "A.104", woningType: "Type B - doorzonwoning",
    status: "beschikbaar", verdieping: 1, oppervlakte: 92, slaapkamers: 2,
    huurprijs: 1665, orientatie: "West", buitenruimte: "Tuin 29 m²",
    plattegrond: PLATTEGROND_B,
    polygon: [
      { x: 0.3329, y: 0.5216 }, { x: 0.3714, y: 0.5448 },
      { x: 0.3724, y: 0.5782 }, { x: 0.3341, y: 0.5536 },
    ],
  },
  {
    id: "a105", nummer: "A.105", woningType: "Type A - hoekwoning",
    status: "in-optie", verdieping: 1, oppervlakte: 84, slaapkamers: 2,
    huurprijs: 1560, orientatie: "West", buitenruimte: "Tuin 35 m²",
    plattegrond: PLATTEGROND_A,
    polygon: [
      { x: 0.3761, y: 0.5476 }, { x: 0.4146, y: 0.5708 },
      { x: 0.4155, y: 0.6059 }, { x: 0.3772, y: 0.5813 },
    ],
  },
];

/* De op de luchtfoto ingetekende vakjes uit de oorspronkelijke luchtfoto-demo,
 * met de typenamen gelijkgetrokken aan de wonen-bij woningtypes zodat
 * type-hover en doorklik naar de juiste woningpagina blijven werken. */
const luchtfotoVakjes: Woning[] = luchtfotoWoningen.map((woning) => ({
  ...woning,
  woningType: woning.woningType
    .replace("hoekwoning", "hoekappartement")
    .replace("doorzonwoning", "doorzonappartement"),
}));

export const demoAanzichten: Aanzicht[] = [
  {
    key: "luchtfoto",
    label: "Luchtfoto",
    render: "/images/wonen-bij-card-1-2ad8f2.png",
    renderAlt: "Luchtfoto van de Taanschuurkade en omgeving",
    renderWidth: 1262,
    renderHeight: 1364,
    woningen: luchtfotoVakjes,
    zones: [
      {
        doelKey: "voorgevel",
        label: "Bekijk alle woningen per gevel",
        polygon: [
          { x: 0.28, y: 0.16 },
          { x: 0.45, y: 0.14 },
          { x: 0.64, y: 0.26 },
          { x: 0.83, y: 0.36 },
          { x: 0.82, y: 0.59 },
          { x: 0.61, y: 0.73 },
          { x: 0.47, y: 0.74 },
          { x: 0.2, y: 0.62 },
          { x: 0.17, y: 0.32 },
        ],
      },
    ],
  },
  {
    key: "voorgevel",
    label: "Voorgevel",
    render: "/images/woningzoeker/taanschuur-voorgevel.jpg",
    renderAlt: "Voorgevel Zuidwest van Taanschuurkade met beschikbare woningen",
    renderWidth: 3803,
    renderHeight: 2484,
    woningen: voorgevelWoningen,
  },
  {
    key: "achtergevel",
    label: "Achtergevel",
    render: "/images/woningzoeker/taanschuur-achtergevel.jpg",
    renderAlt: "Achtergevel Noordoost van Taanschuurkade met beschikbare woningen",
    renderWidth: 3617,
    renderHeight: 2510,
    woningen: achtergevelWoningen,
  },
];

/* ─── Demo: projectpagina Taanschuurkade ────────────────────────────── */

export const demoBegeleiding: BegeleidingSectie = {
  label: "Huren bij Weverskade",
  titel: "Persoonlijk begeleid naar\njouw nieuwe woning",
  punten: [
    "Duidelijke informatie en snelle terugkoppeling",
    "Persoonlijke aandacht voor jouw woonwensen",
    "Begeleiding bij iedere stap van de inschrijving",
    "Een transparant en soepel verhuurtraject",
  ],
  slotTekst:
    "Ook na de sleuteloverdracht kun je rekenen op betrokken en betrouwbare service. Zo woon je comfortabel en zorgeloos in Weverskade.",
  knopTekst: "Contact opnemen",
};

const demoPlanning: PlanningFase[] = [
  {
    periode: "Februari 2025",
    titel: "Conceptontwikkeling",
    omschrijving:
      "In deze fase werken we het woonconcept uit: de architectuur, de indelingen en de kwaliteit van de afwerking.",
    verwachtingenTitel: "Dit mag je verwachten",
    verwachtingen: ["Informatie over het plan", "Eerste impressies", "Planning op hoofdlijnen"],
  },
  {
    periode: "December 2025",
    titel: "Verkoopvoorbereiding",
    omschrijving:
      "De verhuurdocumentatie wordt voorbereid: plattegronden, prijzen en de brochure worden definitief gemaakt.",
    verwachtingenTitel: "Dit mag je verwachten",
    verwachtingen: ["Inschrijven", "Plattegronden en prijzen", "Verhuurbrochure"],
  },
  {
    periode: "April 2026",
    titel: "In verhuur",
    omschrijving:
      "De inschrijving is geopend. Na de selectie ontvangen kandidaten persoonlijk bericht over de toewijzing.",
    verwachtingenTitel: "Dit mag je verwachten",
    verwachtingen: ["Bezichtigingen", "Toewijzing woningen", "Huurcontracten"],
    actief: true,
  },
  {
    periode: "September 2026",
    titel: "Oplevering",
    omschrijving:
      "De woningen worden opgeleverd en de sleutels overgedragen. Welkom thuis in Taanschuurkade.",
    verwachtingenTitel: "Dit mag je verwachten",
    verwachtingen: ["Sleuteloverdracht", "Opleverinspectie", "Servicepunt voor bewoners"],
  },
];

export const demoWonenBijProjecten: WonenBijProject[] = [
  {
    slug: "taanschuurkade",
    naam: "Taanschuurkade",
    plaats: "Maassluis",
    heroImage: "/images/wonenbij/vogelvlucht-hero.jpg",
    intro:
      "Aan de Taanschuurkade verrijst Weverskade: drie karaktervolle woongebouwen met veertig vrije sector huurappartementen, op een van de mooiste plekken van De Kade in Maassluis. De robuuste architectuur, geïnspireerd op de historische pakhuizen langs de haven, geeft het project een krachtig en tijdloos karakter. Met uitzicht op de Nieuwe Waterweg, duurzame technieken en hoogwaardige afwerking biedt Weverskade een eigentijdse woonomgeving waar comfort, ruimte en het leven aan het water vanzelfsprekend samenkomen.",
    feiten: [
      { icoon: "locatie", label: "Locatie", waarde: "Taanschuurkade, Maassluis" },
      { icoon: "woningen", label: "Aantal woningen", waarde: "42 appartementen\n2 penthouses" },
      { icoon: "oppervlakte", label: "Oppervlakte", waarde: "ca. 56 tot 128 m²" },
      { icoon: "slaapkamers", label: "Aantal slaapkamers", waarde: "2 tot 4" },
      { icoon: "buitenruimte", label: "Buitenruimte", waarde: "ca. 5 tot 12 m² balkon" },
      { icoon: "duurzaamheid", label: "Duurzaamheid", waarde: "Energielabel A++++" },
      { icoon: "huurprijs", label: "Huurprijs", waarde: "€1.200 - €2.600" },
      { icoon: "beschikbaarheid", label: "Beschikbaarheid", waarde: "42 woningen" },
    ],
    hurenFotos: [
      "/images/wonenbij/carousel-2.png",
      "/images/wonenbij/carousel-1.png",
      "/images/wonenbij/carousel-3.png",
    ],
    begeleiding: demoBegeleiding,
    welkomLabel: "Welkom bij",
    welkomTitel: "Taanschuurkade",
    welkomTekst:
      "Aan de Taanschuurkade verrijst Weverskade: drie karaktervolle woongebouwen met veertig vrije sector huurappartementen, op een van de mooiste plekken van De Kade in Maassluis.",
    welkomTekstRechts:
      "De robuuste architectuur, geïnspireerd op de historische pakhuizen langs de haven, geeft het project een krachtig en tijdloos karakter aan het water.",
    welkomFotos: ["/images/wonenbij/picture-1.jpg", "/images/wonenbij/picture-21.png"],
    carouselFotos: [
      "/images/wonenbij/carousel-1.png",
      "/images/wonenbij/carousel-2.png",
      "/images/wonenbij/carousel-3.png",
      "/images/wonenbij/picture-1.jpg",
    ],
    locatieLabel: "De locatie",
    locatieTitel: "Midden in Maassluis",
    locatieIntro:
      "Met uitzicht op de Nieuwe Waterweg, duurzame technieken en hoogwaardige afwerking biedt Weverskade een eigentijdse woonomgeving waar comfort, ruimte en het leven aan het water vanzelfsprekend samenkomen.",
    locatieItems: [
      {
        titel: "De stad",
        tekst:
          "Maassluis is een sfeervolle stad aan de Nieuwe Waterweg, waar maritieme historie en modern wonen samenkomen. Vanuit Weverskade zijn het historische centrum, winkels, horeca en openbaar vervoer binnen handbereik. De groene omgeving en ligging aan het water maken de stad een fijne plek om te wonen, ontspannen en eropuit te gaan.",
      },
      {
        titel: "De omgeving",
        tekst:
          "De Kade is een nieuw stuk stad aan het water, met ruimte voor wonen, werken en recreëren. Wandel langs de haven, stap op de fiets naar het strand of geniet van de horeca om de hoek.",
      },
      {
        titel: "Bereikbaarheid",
        tekst:
          "Met metrostation Maassluis Centrum op loopafstand sta je binnen een half uur in Rotterdam. Ook met de auto ben je via de A20 snel op weg; parkeren kan op eigen terrein.",
      },
    ],
    mapImage: "/images/wonenbij/map-taanschuurkade.png",
    mapLat: 51.918,
    mapLng: 4.246,
    planning: demoPlanning,
    downloads: [
      { titel: "Verhuurbrochure", url: "#" },
      { titel: "Technische omschrijving", url: "#" },
      { titel: "Keukenbrochure", url: "#" },
      { titel: "Sanitairbrochure", url: "#" },
    ],
    faq: [
      {
        vraag: "Zijn de woningen van Weverskade instapklaar?",
        antwoord:
          "Ja. De woningen worden compleet opgeleverd, inclusief een keuken en vloer- en wandafwerking. Hierdoor kunnen nieuwe bewoners hun woning direct betrekken zonder eerst uitgebreide werkzaamheden uit te voeren.",
      },
      {
        vraag: "Hoe kan ik mij aanmelden voor een woning van Weverskade?",
        antwoord:
          "Via het inschrijfformulier op deze pagina meld je je vrijblijvend aan. Geef je voorkeurstype door en wij informeren je zodra de inschrijving opent of er aanbod beschikbaar komt.",
      },
      {
        vraag: "Wat voor type woningen verhuurt Weverskade?",
        antwoord:
          "Weverskade verhuurt vrije sector huurappartementen en penthouses, variërend in oppervlakte en aantal slaapkamers. Alle woningen worden compleet en duurzaam opgeleverd.",
      },
      {
        vraag: "Kan ik mij aanmelden voor meerdere projecten tegelijk?",
        antwoord:
          "Ja, dat kan. Schrijf je per project in via de betreffende projectpagina. Je inschrijvingen staan los van elkaar en zijn altijd vrijblijvend.",
      },
    ],
    woningTypes: demoWoningTypes,
    render: "/images/woningzoeker/taanschuur-voorgevel.jpg",
    renderAlt: "Voorgevel Zuidwest van Taanschuurkade met beschikbare woningen",
    renderWidth: 3803,
    renderHeight: 2484,
    woningen: [...voorgevelWoningen, ...achtergevelWoningen],
    aanzichten: demoAanzichten,
  },
];

export function getWonenBijProject(slug: string): WonenBijProject | undefined {
  return demoWonenBijProjecten.find((p) => p.slug === slug);
}

/* ─── Demo: landing (one-pager) ─────────────────────────────────────── */

export interface LandingProjectKaart {
  slug: string;
  naam: string;
  plaats: string;
  image: string;
  /** true → link naar de wonen-bij projectpagina, anders naar /gebouw/[slug]. */
  heeftWonenBijPagina: boolean;
  /** Pill rechtsonder de kaart, bijv. "Status: huur". Weglaten = geen pill. */
  statusLabel?: string;
}

export interface KwaliteitItem {
  label: string;
  waarde: string;
}

export const landingDefaults = {
  heroImage: "/images/wonenbij/hero.png",
  heroTitel: "Wonen bij Weverskade",
  heroKnop: "Direct naar ons aanbod",
  introStatement:
    "Van stedelijke appartementen tot woonconcepten met extra service: kwaliteit, gebruiksgemak en een prettige leefomgeving staan centraal binnen de projecten van Weverskade.",
  introKnop: "Bekijk het aanbod",
  overKnop: "Actuele aanbod",
  overTitel: "Wonen bij\nWeverskade",
  overFoto: "/images/wonenbij/picture-1.jpg",
  overTekst:
    "Onze woningen worden met aandacht ontwikkeld en compleet opgeleverd, inclusief keuken, vloer- en wandafwerking. Zo ontstaat een comfortabele woonomgeving waarin bewoners zich direct thuis voelen.",
  overFoto2: "/images/wonenbij/picture-21.png",
  overTekstRechts:
    "Of je nu huurt of koopt: bij Weverskade vind je woningen met karakter op plekken waar het leven vanzelfsprekend samenkomt - van stedelijke appartementen tot wonen aan het water.",
  kwaliteitTitel: "Kwaliteit en gebruiksgemak",
  kwaliteitItems: [
    { label: "Duurzaamheid", waarde: "Energiezuinig en toekomstbestendig" },
    { label: "Comfort", waarde: "Compleet en instapklaar opgeleverd" },
    { label: "Flexibiliteit", waarde: "Woningtypes voor elke levensfase" },
    { label: "Service", waarde: "Persoonlijk contact met ons team" },
    { label: "Zekerheid", waarde: "Transparant en soepel huurtraject" },
    { label: "Omgeving", waarde: "Wonen op bijzondere plekken" },
  ] as KwaliteitItem[],
  aanbodTitel: "Beschikbare woningen",
  projectenTitel: "Onze woonprojecten",
  contactLabel: "Neem contact op",
  contactTekst:
    "Heeft u een vraag over een woning of project? Vul onderstaand formulier in en we nemen zo spoedig mogelijk contact op.",
};

export const demoLandingProjecten: LandingProjectKaart[] = [
  {
    slug: "taanschuurkade",
    naam: "Taanschuurkade",
    plaats: "Maassluis",
    image: "/images/wonenbij/vogelvlucht.jpg",
    heeftWonenBijPagina: true,
    statusLabel: "Status: huur",
  },
  {
    slug: "de-drie-lelies",
    naam: "De Drie Lelies",
    plaats: "Maassluis",
    image: "/images/wonen-bij-card-3-57e8ff.png",
    heeftWonenBijPagina: false,
    statusLabel: "Status: huur",
  },
  {
    slug: "weverstede",
    naam: "Weverstede",
    plaats: "Nieuwegein",
    image: "/images/wonen-bij-card-1-2ad8f2.png",
    heeftWonenBijPagina: false,
    statusLabel: "Status: huur",
  },
];

/** Kaartje in het geaggregeerde aanbod-overzicht op de one-pager. */
export interface AanbodKaart {
  projectSlug: string;
  projectNaam: string;
  plaats: string;
  typeSlug: string;
  typeNaam: string;
  status: WoningTypeStatus;
  prijsVan: number;
  slaapkamers: number;
  oppervlakte: number;
  foto: string;
}

export function demoAanbod(): AanbodKaart[] {
  return demoWonenBijProjecten.flatMap((project) =>
    project.woningTypes.map((type) => ({
      projectSlug: project.slug,
      projectNaam: project.naam,
      plaats: project.plaats,
      typeSlug: type.slug,
      typeNaam: type.naam,
      status: type.status,
      prijsVan: type.prijsVan,
      slaapkamers: type.slaapkamers,
      oppervlakte: type.oppervlakte,
      foto: type.fotos[0] ?? "/images/wonenbij/aanbod-card.png",
    }))
  );
}
