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
  /**
   * Hoe het beeld het woningzoeker-paneel vult: "vullend" (cover, voor
   * foto's) of "passend" (contain op witte achtergrond, voor technische
   * geveltekeningen). Standaard vullend.
   */
  weergave?: "vullend" | "passend";
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
  /**
   * Andere slugs die dezelfde projectpagina bedoelen, zoals de slug van het
   * bestaande Sanity-gebouwdocument. Die routes sturen door naar deze pagina
   * zolang de content in code leeft (na de CMS-migratie vervalt dit).
   */
  aliasSlugs?: string[];
  naam: string;
  plaats: string;
  heroImage: string;
  // Sectie-content is optioneel: een project zonder eigen data voor een
  // sectie (variant B, zonder woningzoeker) laat die sectie gewoon weg.
  // Alleen Taanschuurkade heeft het volledige demo-vangnet.
  intro?: string;
  feiten?: Feit[];
  hurenFotos?: string[];
  /** Generieke Weverskade-tekst; geldt voor elke variant. */
  begeleiding: BegeleidingSectie;
  welkomLabel: string;
  welkomTitel: string;
  welkomTekst?: string;
  welkomTekstRechts?: string;
  welkomFotos?: string[];
  carouselFotos?: string[];
  locatieLabel: string;
  locatieTitel?: string;
  locatieIntro?: string;
  locatieItems?: LocatieItem[];
  mapImage?: string;
  mapLat?: number;
  mapLng?: number;
  planning?: PlanningFase[];
  downloads?: DownloadItem[];
  faq?: FaqItem[];
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

/* ─── Woningtypes Taanschuurkade (echte data) ───────────────────────
 * Bronnen: oppervlaktestaat splitsing "de Taanschuur" (Excel, 14-4-2025)
 * voor huisnummers/types/m²/verdiepingen, en de kick-off-presentatie
 * (feb 2026) voor typeteksten, specificaties en huurprijsindicaties.
 *
 * TODO (wacht op Vivianne / Weverskade):
 * - Huurprijzen zijn de indicatieve ranges per type uit de kick-off;
 *   definitieve prijzen per woning zijn nog niet aangeleverd.
 * - Interieurbeelden zijn impressies van de modelwoning (Vega Projects),
 *   niet per type gelabeld; mapping per type is nog niet bevestigd.
 * - Servicekosten, buitenruimte-m² en oriëntatie per woning ontbreken.
 * - Plattegrond studio T5.00R (type 1B) ontbreekt; alleen T5.00L (1A)
 *   is aangeleverd. De twee studio's staan hier als één type "Studio".
 * ------------------------------------------------------------------- */

const FOTOMAP = "/images/wonenbij/taanschuurkade";

/** Afwerking/installaties gelden voor alle woningen (kick-off slides 4-8). */
const BLOK_AFWERKING: OmschrijvingBlok = {
  kop: "Hoogwaardige afwerking",
  tekst:
    "De woning wordt volledig afgewerkt opgeleverd, met een hoogwaardige vloer- en wandafwerking en een stijlvolle badkamer met grote tegels tot plafondhoogte, modern sanitair en een strak glazen douchescherm. Zo kun je er direct comfortabel wonen.",
};

const BLOK_DUURZAAM: OmschrijvingBlok = {
  kop: "Duurzaam wonen",
  tekst:
    "Met energielabel A+++ woon je comfortabel met een laag energieverbruik. Een individuele warmtepomp verzorgt de vloerverwarming, passieve vloerkoeling en het warme water, en gebalanceerde ventilatie met warmteterugwinning zorgt het hele jaar voor een aangenaam binnenklimaat.",
};

const BLOK_KEUKEN: OmschrijvingBlok = {
  kop: "Keuken",
  tekst:
    "De moderne keuken is voorzien van een inductiekookplaat, RVS afzuigkap, spoelbak met thermostatische mengkraan, Siemens vaatwasser en een koel-vriescombinatie. Bovenkasten bieden extra opbergruimte.",
};

const taanschuurkadeWoningTypes: WoningType[] = [
  {
    slug: "studio",
    naam: "Studio",
    status: "inschrijven",
    prijsVan: 1100,
    prijsTot: 1200,
    oppervlakte: 38,
    slaapkamers: 1,
    energielabel: "A+++",
    fotos: [
      `${FOTOMAP}/interieur-woonkamer.jpg`,
      `${FOTOMAP}/interieur-keuken-2.jpg`,
      `${FOTOMAP}/interieur-slaapkamer.jpg`,
      `${FOTOMAP}/interieur-badkamer.jpg`,
    ],
    plattegronden: [`${FOTOMAP}/plattegrond-t5-00l.jpg`],
    plattegrondLabel: "Plattegrond studio",
    omschrijving: [
      {
        kop: "Over deze studio",
        tekst:
          "Compact, compleet en verrassend ruim. Deze studio van circa 38 m² op de begane grond heeft een aparte slaapkamer en is ontworpen voor bewoners die comfortabel willen wonen zonder concessies te doen aan kwaliteit.",
      },
      BLOK_AFWERKING,
      BLOK_DUURZAAM,
      BLOK_KEUKEN,
    ],
  },
  {
    slug: "type-2-3-kamerappartement",
    naam: "Type 2 - 3-kamerappartement",
    status: "inschrijven",
    prijsVan: 1300,
    prijsTot: 1400,
    oppervlakte: 65,
    slaapkamers: 2,
    energielabel: "A+++",
    buitenruimte: "Balkon",
    fotos: [
      `${FOTOMAP}/interieur-eethoek.jpg`,
      `${FOTOMAP}/interieur-woonkamer-2.jpg`,
      `${FOTOMAP}/interieur-slaapkamer-2.jpg`,
      `${FOTOMAP}/interieur-badkamer.jpg`,
    ],
    plattegronden: [
      `${FOTOMAP}/plattegrond-t5-01l.jpg`,
      `${FOTOMAP}/plattegrond-t5-01r.jpg`,
    ],
    plattegrondLabel: "Plattegrond - linker- en rechtervariant",
    omschrijving: [
      {
        kop: "Over dit appartement",
        tekst:
          "Dit 3-kamerappartement van circa 65 m² combineert een lichte woonkamer met open keuken met twee volwaardige slaapkamers. Het eigen balkon maakt het wooncomfort compleet - een fijne plek voor stellen, kleine gezinnen en thuiswerkers.",
      },
      BLOK_AFWERKING,
      BLOK_DUURZAAM,
      BLOK_KEUKEN,
    ],
  },
  {
    slug: "type-3-3-kamerappartement",
    naam: "Type 3 - 3-kamerappartement",
    status: "inschrijven",
    prijsVan: 1300,
    prijsTot: 1400,
    oppervlakte: 70,
    slaapkamers: 2,
    energielabel: "A+++",
    buitenruimte: "Balkon",
    fotos: [
      `${FOTOMAP}/interieur-woonkamer-2.jpg`,
      `${FOTOMAP}/interieur-keuken.jpg`,
      `${FOTOMAP}/interieur-slaapkamer.jpg`,
      `${FOTOMAP}/interieur-badkamer.jpg`,
    ],
    plattegronden: [`${FOTOMAP}/plattegrond-t4-01l.jpg`],
    plattegrondLabel: "Plattegrond",
    omschrijving: [
      {
        kop: "Over dit appartement",
        tekst:
          "Met circa 70 m² is dit het ruimste woningtype van Taanschuurkade. De royale woonkamer, twee volwaardige slaapkamers en het eigen balkon bieden optimaal wooncomfort voor gezinnen en doorstromers.",
      },
      BLOK_AFWERKING,
      BLOK_DUURZAAM,
      BLOK_KEUKEN,
    ],
  },
  {
    slug: "type-4-3-kamerappartement",
    naam: "Type 4 - 3-kamerappartement",
    status: "inschrijven",
    prijsVan: 1300,
    prijsTot: 1400,
    oppervlakte: 69,
    slaapkamers: 2,
    energielabel: "A+++",
    buitenruimte: "Balkon",
    fotos: [
      `${FOTOMAP}/interieur-keuken.jpg`,
      `${FOTOMAP}/interieur-woonkamer-3.jpg`,
      `${FOTOMAP}/interieur-slaapkamer-2.jpg`,
      `${FOTOMAP}/interieur-hal.jpg`,
    ],
    plattegronden: [`${FOTOMAP}/plattegrond-t4-01r.jpg`],
    plattegrondLabel: "Plattegrond",
    omschrijving: [
      {
        kop: "Over dit appartement",
        tekst:
          "Ruimte, comfort en luxe komen samen in dit 3-kamerappartement van circa 69 m². Twee volwaardige slaapkamers en een royale leefruimte met eigen balkon maken de woning uitermate geschikt voor stellen, kleine gezinnen en thuiswerkers.",
      },
      BLOK_AFWERKING,
      BLOK_DUURZAAM,
      BLOK_KEUKEN,
    ],
  },
  {
    slug: "type-5-3-kamerappartement",
    naam: "Type 5 - 3-kamerappartement",
    status: "inschrijven",
    prijsVan: 1300,
    prijsTot: 1400,
    oppervlakte: 68,
    slaapkamers: 2,
    energielabel: "A+++",
    buitenruimte: "Balkon",
    fotos: [
      `${FOTOMAP}/interieur-woonkamer-3.jpg`,
      `${FOTOMAP}/interieur-eethoek.jpg`,
      `${FOTOMAP}/interieur-slaapkamer.jpg`,
      `${FOTOMAP}/interieur-badkamer.jpg`,
    ],
    plattegronden: [`${FOTOMAP}/plattegrond-t3-01l.jpg`],
    plattegrondLabel: "Plattegrond",
    omschrijving: [
      {
        kop: "Over dit appartement",
        tekst:
          "Praktisch ingedeeld en verrassend ruim: dit 3-kamerappartement van circa 68 m² heeft twee slaapkamers en een lichte woonkamer die aansluit op het eigen balkon. Een woning die direct klaar is voor gebruik.",
      },
      BLOK_AFWERKING,
      BLOK_DUURZAAM,
      BLOK_KEUKEN,
    ],
  },
  {
    slug: "type-6-2-kamerappartement",
    naam: "Type 6 - 2-kamerappartement",
    status: "inschrijven",
    prijsVan: 1250,
    prijsTot: 1350,
    oppervlakte: 57,
    slaapkamers: 1,
    energielabel: "A+++",
    buitenruimte: "Balkon",
    fotos: [
      `${FOTOMAP}/interieur-keuken-2.jpg`,
      `${FOTOMAP}/interieur-woonkamer.jpg`,
      `${FOTOMAP}/interieur-slaapkamer-2.jpg`,
      `${FOTOMAP}/interieur-hal.jpg`,
    ],
    plattegronden: [`${FOTOMAP}/plattegrond-t3-01r.jpg`],
    plattegrondLabel: "Plattegrond",
    omschrijving: [
      {
        kop: "Over dit appartement",
        tekst:
          "Dit 2-kamerappartement van circa 57 m² biedt de perfecte balans tussen comfort en functionaliteit. De royale woonkamer, aparte slaapkamer en het eigen balkon zorgen voor een aangename woonomgeving.",
      },
      BLOK_AFWERKING,
      BLOK_DUURZAAM,
      BLOK_KEUKEN,
    ],
  },
];

/* ─── Woningen Taanschuurkade (echte data) ──────────────────────────
 * Alle 40 woningen uit de oppervlaktestaat splitsing "de Taanschuur"
 * (Excel 14-4-2025), ingetekend op een uitsnede van de Higgsfield-render
 * "EXTERIEUR balkons 2" (torens 5-4-3, balkon-/waterzijde).
 *
 * Toren-identificatie: verdiepingsaantallen geteld op de render (v.l.n.r.
 * 5+BG / 6 / 8 lagen) matchen exact toren 5, 4, 3 uit de akte.
 * L/R-orientatie (L = links gezien vanaf deze gevel) is op drie
 * onafhankelijke manieren geverifieerd: (1) balkon/raam-volgorde in de
 * plattegronden T3.01L/R en T4.01L/R matcht de gevel alleen met L links,
 * (2) de kern tussen de T5-plattegronden spiegelt correct, (3) de
 * huisnummer-looporde 114-124 volgt de galerij aan de achterzijde.
 * Laat Weverskade dit bevestigen zodra de adressenoverzichten er zijn.
 *
 * Toren 3 heeft acht raamrijen boven de gemeenschappelijke plint
 * (balkonplaten geteld op beide balkonkolommen, pitch ~76px); verd 8
 * (186/188) is de bovenste raamrij direct onder de TAANSCHUUR-band en
 * de gable hoort bij dat vlak. De vloerlijnen hellen ~14px mee met het
 * perspectief van de render.
 *
 * Huurprijzen: vanaf-prijs van de indicatieve range per type uit de
 * kick-off (feb 2026), getoond als "v.a." - definitieve prijzen per
 * woning volgen. Woning 110 (studio 1B) heeft nog geen plattegrond;
 * alleen de spiegelvariant T5.00L (1A) is aangeleverd.
 * ------------------------------------------------------------------- */

export const taanschuurkadeWoningen: Woning[] = [
  {
    id: "t5-00r", nummer: "110", bouwnummer: "T5.00R",
    woningType: "Studio",
    status: "beschikbaar", verdieping: 0, oppervlakte: 38, slaapkamers: 1,
    huurprijs: 1100, prijsVanaf: true,
    polygon: [{ x: 0.1912, y: 0.8599 }, { x: 0.3402, y: 0.8599 }, { x: 0.3402, y: 0.9295 }, { x: 0.1912, y: 0.9295 }],
  },
  {
    id: "t5-00l", nummer: "112", bouwnummer: "T5.00L",
    woningType: "Studio",
    status: "beschikbaar", verdieping: 0, oppervlakte: 38, slaapkamers: 1,
    huurprijs: 1100, prijsVanaf: true,
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-00l.jpg",
    polygon: [{ x: 0.0454, y: 0.8599 }, { x: 0.1912, y: 0.8599 }, { x: 0.1912, y: 0.9295 }, { x: 0.0454, y: 0.9295 }],
  },
  {
    id: "t3-01r", nummer: "114", bouwnummer: "T3.01R",
    woningType: "Type 6 - 2-kamerappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 57, slaapkamers: 1,
    huurprijs: 1250, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01r.jpg",
    polygon: [{ x: 0.8367, y: 0.7856 }, { x: 0.9801, y: 0.7923 }, { x: 0.9801, y: 0.8618 }, { x: 0.8367, y: 0.8568 }],
  },
  {
    id: "t3-01l", nummer: "116", bouwnummer: "T3.01L",
    woningType: "Type 5 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 68, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01l.jpg",
    polygon: [{ x: 0.6486, y: 0.7768 }, { x: 0.8367, y: 0.7856 }, { x: 0.8367, y: 0.8568 }, { x: 0.6486, y: 0.8502 }],
  },
  {
    id: "t4-01r", nummer: "118", bouwnummer: "T4.01R",
    woningType: "Type 4 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 69, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01r.jpg",
    polygon: [{ x: 0.5116, y: 0.7971 }, { x: 0.6486, y: 0.7971 }, { x: 0.6486, y: 0.8696 }, { x: 0.5116, y: 0.8696 }],
  },
  {
    id: "t4-01l", nummer: "120", bouwnummer: "T4.01L",
    woningType: "Type 3 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 70, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01l.jpg",
    polygon: [{ x: 0.3458, y: 0.7971 }, { x: 0.5116, y: 0.7971 }, { x: 0.5116, y: 0.8696 }, { x: 0.3458, y: 0.8696 }],
  },
  {
    id: "t5-01r", nummer: "122", bouwnummer: "T5.01R",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01r.jpg",
    polygon: [{ x: 0.1912, y: 0.7845 }, { x: 0.3402, y: 0.7845 }, { x: 0.3402, y: 0.8599 }, { x: 0.1912, y: 0.8599 }],
  },
  {
    id: "t5-01l", nummer: "124", bouwnummer: "T5.01L",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 1, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01l.jpg",
    polygon: [{ x: 0.0454, y: 0.7845 }, { x: 0.1912, y: 0.7845 }, { x: 0.1912, y: 0.8599 }, { x: 0.0454, y: 0.8599 }],
  },
  {
    id: "t3-02r", nummer: "126", bouwnummer: "T3.02R",
    woningType: "Type 6 - 2-kamerappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 57, slaapkamers: 1,
    huurprijs: 1250, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01r.jpg",
    polygon: [{ x: 0.8367, y: 0.7127 }, { x: 0.9801, y: 0.7198 }, { x: 0.9801, y: 0.7923 }, { x: 0.8367, y: 0.7856 }],
  },
  {
    id: "t3-02l", nummer: "128", bouwnummer: "T3.02L",
    woningType: "Type 5 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 68, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01l.jpg",
    polygon: [{ x: 0.6486, y: 0.7034 }, { x: 0.8367, y: 0.7127 }, { x: 0.8367, y: 0.7856 }, { x: 0.6486, y: 0.7768 }],
  },
  {
    id: "t4-02r", nummer: "130", bouwnummer: "T4.02R",
    woningType: "Type 4 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 69, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01r.jpg",
    polygon: [{ x: 0.5116, y: 0.7246 }, { x: 0.6486, y: 0.7246 }, { x: 0.6486, y: 0.7971 }, { x: 0.5116, y: 0.7971 }],
  },
  {
    id: "t4-02l", nummer: "132", bouwnummer: "T4.02L",
    woningType: "Type 3 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 70, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01l.jpg",
    polygon: [{ x: 0.3458, y: 0.7246 }, { x: 0.5116, y: 0.7246 }, { x: 0.5116, y: 0.7971 }, { x: 0.3458, y: 0.7971 }],
  },
  {
    id: "t5-02r", nummer: "134", bouwnummer: "T5.02R",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01r.jpg",
    polygon: [{ x: 0.1912, y: 0.7101 }, { x: 0.3402, y: 0.7101 }, { x: 0.3402, y: 0.7845 }, { x: 0.1912, y: 0.7845 }],
  },
  {
    id: "t5-02l", nummer: "136", bouwnummer: "T5.02L",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 2, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01l.jpg",
    polygon: [{ x: 0.0454, y: 0.7101 }, { x: 0.1912, y: 0.7101 }, { x: 0.1912, y: 0.7845 }, { x: 0.0454, y: 0.7845 }],
  },
  {
    id: "t3-03r", nummer: "138", bouwnummer: "T3.03R",
    woningType: "Type 6 - 2-kamerappartement",
    status: "beschikbaar", verdieping: 3, oppervlakte: 57, slaapkamers: 1,
    huurprijs: 1250, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01r.jpg",
    polygon: [{ x: 0.8367, y: 0.6398 }, { x: 0.9801, y: 0.6473 }, { x: 0.9801, y: 0.7198 }, { x: 0.8367, y: 0.7127 }],
  },
  {
    id: "t3-03l", nummer: "140", bouwnummer: "T3.03L",
    woningType: "Type 5 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 3, oppervlakte: 68, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01l.jpg",
    polygon: [{ x: 0.6486, y: 0.6300 }, { x: 0.8367, y: 0.6398 }, { x: 0.8367, y: 0.7127 }, { x: 0.6486, y: 0.7034 }],
  },
  {
    id: "t4-03r", nummer: "142", bouwnummer: "T4.03R",
    woningType: "Type 4 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 3, oppervlakte: 69, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01r.jpg",
    polygon: [{ x: 0.5116, y: 0.6522 }, { x: 0.6486, y: 0.6522 }, { x: 0.6486, y: 0.7246 }, { x: 0.5116, y: 0.7246 }],
  },
  {
    id: "t4-03l", nummer: "144", bouwnummer: "T4.03L",
    woningType: "Type 3 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 3, oppervlakte: 70, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01l.jpg",
    polygon: [{ x: 0.3458, y: 0.6522 }, { x: 0.5116, y: 0.6522 }, { x: 0.5116, y: 0.7246 }, { x: 0.3458, y: 0.7246 }],
  },
  {
    id: "t5-03r", nummer: "146", bouwnummer: "T5.03R",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 3, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01r.jpg",
    polygon: [{ x: 0.1912, y: 0.6329 }, { x: 0.3402, y: 0.6329 }, { x: 0.3402, y: 0.7101 }, { x: 0.1912, y: 0.7101 }],
  },
  {
    id: "t5-03l", nummer: "148", bouwnummer: "T5.03L",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 3, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01l.jpg",
    polygon: [{ x: 0.0454, y: 0.6329 }, { x: 0.1912, y: 0.6329 }, { x: 0.1912, y: 0.7101 }, { x: 0.0454, y: 0.7101 }],
  },
  {
    id: "t3-04r", nummer: "150", bouwnummer: "T3.04R",
    woningType: "Type 6 - 2-kamerappartement",
    status: "beschikbaar", verdieping: 4, oppervlakte: 57, slaapkamers: 1,
    huurprijs: 1250, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01r.jpg",
    polygon: [{ x: 0.8367, y: 0.5677 }, { x: 0.9801, y: 0.5749 }, { x: 0.9801, y: 0.6473 }, { x: 0.8367, y: 0.6398 }],
  },
  {
    id: "t3-04l", nummer: "152", bouwnummer: "T3.04L",
    woningType: "Type 5 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 4, oppervlakte: 68, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01l.jpg",
    polygon: [{ x: 0.6486, y: 0.5585 }, { x: 0.8367, y: 0.5677 }, { x: 0.8367, y: 0.6398 }, { x: 0.6486, y: 0.6300 }],
  },
  {
    id: "t4-04r", nummer: "154", bouwnummer: "T4.04R",
    woningType: "Type 4 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 4, oppervlakte: 69, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01r.jpg",
    polygon: [{ x: 0.5116, y: 0.5778 }, { x: 0.6486, y: 0.5778 }, { x: 0.6486, y: 0.6522 }, { x: 0.5116, y: 0.6522 }],
  },
  {
    id: "t4-04l", nummer: "156", bouwnummer: "T4.04L",
    woningType: "Type 3 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 4, oppervlakte: 70, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01l.jpg",
    polygon: [{ x: 0.3458, y: 0.5778 }, { x: 0.5116, y: 0.5778 }, { x: 0.5116, y: 0.6522 }, { x: 0.3458, y: 0.6522 }],
  },
  {
    id: "t5-04r", nummer: "158", bouwnummer: "T5.04R",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 4, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01r.jpg",
    polygon: [{ x: 0.1912, y: 0.5604 }, { x: 0.3402, y: 0.5604 }, { x: 0.3402, y: 0.6329 }, { x: 0.1912, y: 0.6329 }],
  },
  {
    id: "t5-04l", nummer: "160", bouwnummer: "T5.04L",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 4, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01l.jpg",
    polygon: [{ x: 0.0454, y: 0.5604 }, { x: 0.1912, y: 0.5604 }, { x: 0.1912, y: 0.6329 }, { x: 0.0454, y: 0.6329 }],
  },
  {
    id: "t3-05r", nummer: "162", bouwnummer: "T3.05R",
    woningType: "Type 6 - 2-kamerappartement",
    status: "beschikbaar", verdieping: 5, oppervlakte: 57, slaapkamers: 1,
    huurprijs: 1250, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01r.jpg",
    polygon: [{ x: 0.8367, y: 0.4949 }, { x: 0.9801, y: 0.5024 }, { x: 0.9801, y: 0.5749 }, { x: 0.8367, y: 0.5677 }],
  },
  {
    id: "t3-05l", nummer: "164", bouwnummer: "T3.05L",
    woningType: "Type 5 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 5, oppervlakte: 68, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01l.jpg",
    polygon: [{ x: 0.6486, y: 0.4850 }, { x: 0.8367, y: 0.4949 }, { x: 0.8367, y: 0.5677 }, { x: 0.6486, y: 0.5585 }],
  },
  {
    id: "t4-05r", nummer: "166", bouwnummer: "T4.05R",
    woningType: "Type 4 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 5, oppervlakte: 69, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01r.jpg",
    polygon: [{ x: 0.5116, y: 0.4995 }, { x: 0.6486, y: 0.4995 }, { x: 0.6486, y: 0.5778 }, { x: 0.5116, y: 0.5778 }],
  },
  {
    id: "t4-05l", nummer: "168", bouwnummer: "T4.05L",
    woningType: "Type 3 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 5, oppervlakte: 70, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01l.jpg",
    polygon: [{ x: 0.3458, y: 0.4995 }, { x: 0.5116, y: 0.4995 }, { x: 0.5116, y: 0.5778 }, { x: 0.3458, y: 0.5778 }],
  },
  {
    id: "t5-05r", nummer: "170", bouwnummer: "T5.05R",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 5, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01r.jpg",
    polygon: [{ x: 0.1912, y: 0.4372 }, { x: 0.1936, y: 0.4367 }, { x: 0.3402, y: 0.4638 }, { x: 0.3402, y: 0.5604 }, { x: 0.1912, y: 0.5604 }],
  },
  {
    id: "t5-05l", nummer: "172", bouwnummer: "T5.05L",
    woningType: "Type 2 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 5, oppervlakte: 65, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t5-01l.jpg",
    polygon: [{ x: 0.0454, y: 0.4638 }, { x: 0.1912, y: 0.4372 }, { x: 0.1912, y: 0.5604 }, { x: 0.0454, y: 0.5604 }],
  },
  {
    id: "t3-06r", nummer: "174", bouwnummer: "T3.06R",
    woningType: "Type 6 - 2-kamerappartement",
    status: "beschikbaar", verdieping: 6, oppervlakte: 57, slaapkamers: 1,
    huurprijs: 1250, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01r.jpg",
    polygon: [{ x: 0.8367, y: 0.4237 }, { x: 0.9801, y: 0.4300 }, { x: 0.9801, y: 0.5024 }, { x: 0.8367, y: 0.4949 }],
  },
  {
    id: "t3-06l", nummer: "176", bouwnummer: "T3.06L",
    woningType: "Type 5 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 6, oppervlakte: 68, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01l.jpg",
    polygon: [{ x: 0.6486, y: 0.4155 }, { x: 0.8367, y: 0.4237 }, { x: 0.8367, y: 0.4949 }, { x: 0.6486, y: 0.4850 }],
  },
  {
    id: "t4-06r", nummer: "178", bouwnummer: "T4.06R",
    woningType: "Type 4 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 6, oppervlakte: 69, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01r.jpg",
    polygon: [{ x: 0.5116, y: 0.3465 }, { x: 0.6486, y: 0.3961 }, { x: 0.6486, y: 0.4995 }, { x: 0.5116, y: 0.4995 }],
  },
  {
    id: "t4-06l", nummer: "180", bouwnummer: "T4.06L",
    woningType: "Type 3 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 6, oppervlakte: 70, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t4-01l.jpg",
    polygon: [{ x: 0.3458, y: 0.3942 }, { x: 0.4940, y: 0.3401 }, { x: 0.5116, y: 0.3465 }, { x: 0.5116, y: 0.4995 }, { x: 0.3458, y: 0.4995 }],
  },
  {
    id: "t3-07r", nummer: "182", bouwnummer: "T3.07R",
    woningType: "Type 6 - 2-kamerappartement",
    status: "beschikbaar", verdieping: 7, oppervlakte: 57, slaapkamers: 1,
    huurprijs: 1250, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01r.jpg",
    polygon: [{ x: 0.8367, y: 0.3516 }, { x: 0.9801, y: 0.3575 }, { x: 0.9801, y: 0.4300 }, { x: 0.8367, y: 0.4237 }],
  },
  {
    id: "t3-07l", nummer: "184", bouwnummer: "T3.07L",
    woningType: "Type 5 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 7, oppervlakte: 69, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01l.jpg",
    polygon: [{ x: 0.6486, y: 0.3440 }, { x: 0.8367, y: 0.3516 }, { x: 0.8367, y: 0.4237 }, { x: 0.6486, y: 0.4155 }],
  },
  {
    id: "t3-08r", nummer: "186", bouwnummer: "T3.08R",
    woningType: "Type 6 - 2-kamerappartement",
    status: "beschikbaar", verdieping: 8, oppervlakte: 57, slaapkamers: 1,
    huurprijs: 1250, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01r.jpg",
    polygon: [{ x: 0.8367, y: 0.1804 }, { x: 0.9801, y: 0.2415 }, { x: 0.9801, y: 0.3575 }, { x: 0.8367, y: 0.3516 }],
  },
  {
    id: "t3-08l", nummer: "188", bouwnummer: "T3.08L",
    woningType: "Type 5 - 3-kamerappartement",
    status: "beschikbaar", verdieping: 8, oppervlakte: 68, slaapkamers: 2,
    huurprijs: 1300, prijsVanaf: true, buitenruimte: "Balkon",
    plattegrond: "/images/wonenbij/taanschuurkade/plattegrond-t3-01l.jpg",
    polygon: [{ x: 0.6486, y: 0.2493 }, { x: 0.8191, y: 0.1729 }, { x: 0.8367, y: 0.1804 }, { x: 0.8367, y: 0.3516 }, { x: 0.6486, y: 0.3440 }],
  },
];

const taanschuurkadeAanzichten: Aanzicht[] = [
  {
    key: "voorgevel",
    label: "Voorgevel",
    // "vullend": het paneel volgt de beeldverhouding van deze render
    // (WoningzoekerSection), dus cover vult rand-tot-rand zonder dat er
    // gevel buiten beeld valt.
    weergave: "vullend",
    render: "/images/wonenbij/taanschuurkade/woningzoeker-voorgevel.jpg",
    renderAlt:
      "Voorgevel van Taanschuurkade (torens 5, 4 en 3) met alle veertig woningen",
    renderWidth: 1255,
    renderHeight: 1035,
    woningen: taanschuurkadeWoningen,
  },
];

/* ─── Demo/PoC: woningen op de gevelaanzichten ──────────────────────
 * LET OP: dit is de proof of concept van de render-overlay, overgetrokken
 * van de oude huisnummeroverzichten (WEV24003) met fictieve nummers
 * (11A-17H) en prijzen. NIET gekoppeld aan de echte Taanschuurkade-data:
 * de definitieve gevel-/adressenoverzichten (huisnr. 110-188) en de
 * huurprijzen per woning zijn nog niet aangeleverd. Alleen nog in
 * gebruik door de losse /woningzoeker-demoroute; zodra de echte
 * gevelbeelden er zijn worden hier nieuwe aanzichten overgetrokken.
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
    weergave: "passend",
    label: "Voorgevel",
    render: "/images/woningzoeker/taanschuur-voorgevel.jpg",
    renderAlt: "Voorgevel Zuidwest van Taanschuurkade met beschikbare woningen",
    renderWidth: 2560,
    renderHeight: 1672,
    woningen: voorgevelWoningen,
  },
  {
    key: "achtergevel",
    weergave: "passend",
    label: "Achtergevel",
    render: "/images/woningzoeker/taanschuur-achtergevel.jpg",
    renderAlt: "Achtergevel Noordoost van Taanschuurkade met beschikbare woningen",
    renderWidth: 2560,
    renderHeight: 1776,
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

/* Planning afgeleid van de interne kick-off-planning (feb 2026); de
 * bewoordingen zijn bewust voorzichtig ("verwacht") en de data lopen tot
 * de maand, niet tot de dag. TODO: laten bevestigen door Weverskade. */
const taanschuurkadePlanning: PlanningFase[] = [
  {
    periode: "Zomer 2026",
    titel: "Laatste voorbereidingen",
    omschrijving:
      "De bouw nadert de afronding. Achter de schermen worden de woningen, de gemeenschappelijke ruimtes en de verhuurdocumentatie gereedgemaakt.",
    verwachtingenTitel: "Dit mag je verwachten",
    verwachtingen: [
      "Eerste impressies en plattegronden",
      "Projectinformatie op deze pagina",
      "Aankondiging van de start verhuur",
    ],
    actief: true,
  },
  {
    periode: "Eind september 2026",
    titel: "Start verhuur",
    omschrijving:
      "De inschrijving opent via deze website. Na je inschrijving nemen we persoonlijk contact met je op over de beschikbare woningen en de vervolgstappen.",
    verwachtingenTitel: "Dit mag je verwachten",
    verwachtingen: [
      "Inschrijven via de website",
      "Huurprijzen en beschikbaarheid",
      "Persoonlijke terugkoppeling",
    ],
  },
  {
    periode: "Oktober 2026",
    titel: "Oplevering en toewijzing",
    omschrijving:
      "Het gebouw wordt naar verwachting opgeleverd en de woningen worden toegewezen. Kandidaten worden uitgenodigd voor een kijkdag en ondertekenen aansluitend de huurovereenkomst.",
    verwachtingenTitel: "Dit mag je verwachten",
    verwachtingen: [
      "Toewijzing van de woningen",
      "Kijkdag voor kandidaten",
      "Ondertekening huurovereenkomst",
    ],
  },
  {
    periode: "November - december 2026",
    titel: "Sleuteloverdracht",
    omschrijving:
      "De eerste bewoners ontvangen de sleutel van hun nieuwe woning. Ook na de overdracht kun je rekenen op betrokken service en een vast aanspreekpunt.",
    verwachtingenTitel: "Dit mag je verwachten",
    verwachtingen: [
      "Sleuteloverdracht",
      "Welkom in Taanschuurkade",
      "Service voor bewoners",
    ],
  },
];

export const demoWonenBijProjecten: WonenBijProject[] = [
  {
    slug: "taanschuurkade",
    // Het bestaande Sanity-gebouwdocument (nog zonder wonenbij-content)
    // stuurt door naar deze pagina, zodat de landing-kaart en oude links
    // altijd op de volledige woningzoeker uitkomen.
    aliasSlugs: ["taanschuur-appartementen-maasluis"],
    naam: "Taanschuurkade",
    plaats: "Maassluis",
    // Sfeerbeeld van de entree (Higgsfield). Het brede voorgevelbeeld toont
    // ook torens 1/2 (geen Taanschuurkade); Vivianne wil dat beeld ingezoomd
    // hebben - haar referentie-uitsnede is nog niet ontvangen. TODO.
    heroImage: "/images/wonenbij/taanschuurkade/exterieur-entree.jpg",
    intro:
      "Aan de Taanschuurkade verrijst Weverskade: drie karaktervolle woongebouwen met veertig vrije sector huurwoningen - studio's en appartementen - op een van de mooiste plekken van De Kade in Maassluis. De robuuste architectuur, geïnspireerd op de historische pakhuizen langs de haven, geeft het project een krachtig en tijdloos karakter. Met uitzicht op de Nieuwe Waterweg, duurzame technieken, hoogwaardige afwerking en een gemeenschappelijke co-workingruimte op de begane grond biedt Weverskade een eigentijdse woonomgeving waar comfort, ruimte en het leven aan het water vanzelfsprekend samenkomen.",
    // Bronnen: oppervlaktestaat splitsing (aantallen, m²) en kick-off feb
    // 2026 (energielabel, huurprijsindicatie). Prijzen zijn indicatief tot
    // Weverskade de definitieve huurprijzen aanlevert.
    feiten: [
      { icoon: "locatie", label: "Locatie", waarde: "Taanschuurkade, Maassluis" },
      { icoon: "woningen", label: "Aantal woningen", waarde: "38 appartementen\n2 studio's" },
      { icoon: "oppervlakte", label: "Oppervlakte", waarde: "ca. 38 tot 70 m²" },
      { icoon: "slaapkamers", label: "Aantal slaapkamers", waarde: "1 tot 2" },
      { icoon: "buitenruimte", label: "Buitenruimte", waarde: "Balkon bij de appartementen" },
      { icoon: "duurzaamheid", label: "Duurzaamheid", waarde: "Energielabel A+++" },
      { icoon: "huurprijs", label: "Huurprijs", waarde: "€1.100 - €1.400 (indicatie)" },
      { icoon: "beschikbaarheid", label: "Beschikbaarheid", waarde: "40 woningen" },
    ],
    hurenFotos: [
      "/images/wonenbij/taanschuurkade/interieur-woonkamer.jpg",
      "/images/wonenbij/taanschuurkade/interieur-keuken.jpg",
      "/images/wonenbij/taanschuurkade/interieur-slaapkamer.jpg",
    ],
    begeleiding: demoBegeleiding,
    welkomLabel: "Welkom bij",
    welkomTitel: "Taanschuurkade",
    welkomTekst:
      "Aan de Taanschuurkade verrijst Weverskade: drie karaktervolle woongebouwen met veertig vrije sector huurwoningen, op een van de mooiste plekken van De Kade in Maassluis.",
    welkomTekstRechts:
      "De robuuste architectuur, geïnspireerd op de historische pakhuizen langs de haven, geeft het project een krachtig en tijdloos karakter aan het water.",
    welkomFotos: [
      "/images/wonenbij/taanschuurkade/interieur-eethoek.jpg",
      "/images/wonenbij/taanschuurkade/interieur-woonkamer-2.jpg",
    ],
    carouselFotos: [
      "/images/wonenbij/taanschuurkade/exterieur-galerijzijde.jpg",
      "/images/wonenbij/taanschuurkade/coworking.jpg",
      "/images/wonenbij/taanschuurkade/exterieur-binnenhof.jpg",
      "/images/wonenbij/taanschuurkade/interieur-woonkamer-3.jpg",
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
          "Met metrostation Maassluis Centrum op loopafstand sta je binnen een half uur in Rotterdam. Ook met de auto ben je via de A20 snel op weg.",
      },
    ],
    // Statische kaart (Google Static Maps, grijze stijl) zo gecentreerd dat
    // de marker-overlay van de component (42% / 45.6%) op de projectlocatie
    // valt. Bij andere coördinaten dus ook de kaart opnieuw genereren.
    mapImage: "/images/wonenbij/taanschuurkade/map-maassluis.png",
    mapLat: 51.918,
    mapLng: 4.246,
    planning: taanschuurkadePlanning,
    // TODO: brochure, technische omschrijving en huurvoorwaarden zijn nog
    // niet aangeleverd (map "Project informatie" in de OneDrive is leeg).
    // Zonder items verbergt de downloadsectie zichzelf.
    downloads: [],
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
          "Weverskade verhuurt vrije sector huurappartementen en studio's, variërend in oppervlakte en aantal slaapkamers. Alle woningen worden compleet en duurzaam opgeleverd.",
      },
      {
        vraag: "Kan ik mij aanmelden voor meerdere projecten tegelijk?",
        antwoord:
          "Ja, dat kan. Schrijf je per project in via de betreffende projectpagina. Je inschrijvingen staan los van elkaar en zijn altijd vrijblijvend.",
      },
    ],
    woningTypes: taanschuurkadeWoningTypes,
    woningen: taanschuurkadeWoningen,
    aanzichten: taanschuurkadeAanzichten,
  },
];

export function getWonenBijProject(slug: string): WonenBijProject | undefined {
  return demoWonenBijProjecten.find((p) => p.slug === slug);
}

/** Project waarvan `slug` een alias is (bijv. de Sanity-gebouwslug). */
export function getWonenBijProjectByAlias(
  slug: string
): WonenBijProject | undefined {
  return demoWonenBijProjecten.find((p) => p.aliasSlugs?.includes(slug));
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
