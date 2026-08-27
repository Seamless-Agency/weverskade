// ============================================
// SINGLETON QUERIES
// ============================================

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]`

export const FOOTER_QUERY = `*[_type == "footer"][0]`

export const HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  ...,
  featuredProjects[]->{
    _id,
    name,
    slug,
    tagline,
    type,
    location,
    portfolioImage
  }
}`

export const OVER_ONS_PAGE_QUERY = `*[_type == "overOnsPage"][0]`

export const MAATSCHAPPELIJK_PAGE_QUERY = `*[_type == "maatschappelijkPage"][0]`

export const CONTACT_PAGE_QUERY = `*[_type == "contactPage"][0]`

export const PORTEFEUILLE_PAGE_QUERY = `*[_type == "portefeuillePage"][0]`

export const WONEN_BIJ_PAGE_QUERY = `*[_type == "wonenBijPage"][0]`

export const NIEUWS_PAGE_SETTINGS_QUERY = `*[_type == "nieuwsPageSettings"][0]`

export const WERKEN_BIJ_PAGE_QUERY = `*[_type == "werkenBijPage"][0]`

// ============================================
// DOCUMENT QUERIES
// ============================================

export const ALL_PROJECTS_QUERY = `*[_type == "project"] | order(orderRank asc) {
  _id,
  name,
  slug,
  tagline,
  type,
  status,
  category,
  location,
  hasDetailPage,
  portfolioImage
}`

export const WONEN_PROJECTS_QUERY = `*[_type == "project" && showInWonen == true] | order(orderRank asc) {
  _id,
  name,
  slug,
  tagline,
  type,
  status,
  location,
  wonenBeschikbaar,
  hasDetailPage,
  portfolioImage
}`

export const PROJECT_BY_SLUG_QUERY = `*[_type == "project" && slug.current == $slug][0]`

// Woningzoeker — haalt naast de woningen ook de natuurlijke afmetingen van de
// render op, zodat de viewer exact dezelfde beeldverhouding aanhoudt als het
// beeld waarop is overgetrokken.
export const WONINGZOEKER_BY_SLUG_QUERY = `*[_type == "project" && slug.current == $slug && woningzoekerEnabled == true][0]{
  name,
  "slug": slug.current,
  tagline,
  projectFase,
  woningzoekerIntro,
  "render": woningzoekerRender.asset->url,
  "renderDimensions": woningzoekerRender.asset->metadata.dimensions,
  woningen[]{
    _key,
    nummer,
    woningType,
    status,
    verdieping,
    oppervlakte,
    slaapkamers,
    huurprijs,
    orientatie,
    buitenruimte,
    "plattegrond": plattegrond.asset->url,
    polygon[]{ x, y }
  }
}`

export const WONINGZOEKER_SLUGS_QUERY = `*[_type == "project" && woningzoekerEnabled == true].slug.current`

// ============================================
// WONEN BIJ (wonenbij.weverskade.com)
// ============================================

// Projectpagina op de wonen-bij omgeving: alle secties + woningtypes +
// de render met overgetrokken woningen voor de woningzoeker.
// Transitie: zolang de redactie "Wonen bij projectpagina tonen"
// (wonenBijEnabled) nog niet invult, telt "Tonen op wonen-bij pagina"
// (showInWonen) ook — dat is de bestaande set projecten met woningaanbod.
export const WONENBIJ_PROJECT_BY_SLUG_QUERY = `*[_type == "project" && slug.current == $slug && (wonenBijEnabled == true || showInWonen == true)][0]{
  name,
  "slug": slug.current,
  location,
  heroImage,
  wonenBijIntro,
  feiten[]{ icoon, label, waarde },
  hurenFotos,
  welkomTekst,
  welkomTekstRechts,
  welkomFotos,
  carouselFotos,
  locatieTitel,
  locatieIntro,
  locatieItems[]{ titel, tekst },
  mapLat,
  mapLng,
  planning[]{ periode, titel, omschrijving, verwachtingen, actief },
  downloads[]{ titel, "url": bestand.asset->url },
  faq[]{ vraag, antwoord },
  woningTypes[]{
    naam,
    "slug": slug.current,
    status,
    prijsVan,
    prijsTot,
    oppervlakte,
    slaapkamers,
    energielabel,
    buitenruimte,
    "fotos": fotos[].asset->url,
    "plattegronden": plattegronden[].asset->url,
    plattegrondLabel,
    omschrijving[]{ kop, tekst }
  },
  "render": woningzoekerRender.asset->url,
  "renderDimensions": woningzoekerRender.asset->metadata.dimensions,
  woningen[]{
    _key,
    nummer,
    woningType,
    status,
    verdieping,
    oppervlakte,
    slaapkamers,
    huurprijs,
    orientatie,
    buitenruimte,
    "plattegrond": plattegrond.asset->url,
    polygon[]{ x, y }
  },
  aanzichten[]{
    key,
    label,
    weergave,
    "render": render.asset->url,
    "renderDimensions": render.asset->metadata.dimensions,
    woningen[]{
      _key,
      nummer,
      woningType,
      status,
      verdieping,
      oppervlakte,
      slaapkamers,
      huurprijs,
      orientatie,
      buitenruimte,
      "plattegrond": plattegrond.asset->url,
      polygon[]{ x, y }
    },
    zones[]{ label, doelKey, polygon[]{ x, y } }
  }
}`

export const WONENBIJ_PROJECT_SLUGS_QUERY = `*[_type == "project" && (wonenBijEnabled == true || showInWonen == true)].slug.current`

// One-pager: projectkaarten + het geaggregeerde aanbod (alle woningtypes
// van alle wonen-bij projecten).
export const WONENBIJ_LANDING_PROJECTS_QUERY = `*[_type == "project" && showInWonen == true] | order(orderRank asc) {
  name,
  "slug": slug.current,
  location,
  wonenBijEnabled,
  showInWonen,
  portfolioImage,
  woningTypes[]{
    naam,
    "slug": slug.current,
    status,
    prijsVan,
    oppervlakte,
    slaapkamers,
    "foto": fotos[0].asset->url
  }
}`

export const ALL_PROJECT_SLUGS_QUERY = `*[_type == "project" && hasDetailPage == true].slug.current`

export const ALL_NIEUWS_QUERY = `*[_type == "nieuwsArtikel"] | order(date desc) {
  _id,
  title,
  slug,
  date,
  category,
  excerpt,
  heroImage
}`

export const NIEUWS_BY_SLUG_QUERY = `*[_type == "nieuwsArtikel" && slug.current == $slug][0]`

export const ALL_NIEUWS_SLUGS_QUERY = `*[_type == "nieuwsArtikel"].slug.current`

export const ALL_VACATURES_QUERY = `*[_type == "vacature" && isActive == true] | order(_createdAt desc) {
  _id,
  title,
  slug,
  shortDescription
}`

export const VACATURE_BY_SLUG_QUERY = `*[_type == "vacature" && slug.current == $slug][0]`

export const ALL_VACATURE_SLUGS_QUERY = `*[_type == "vacature"].slug.current`

export const ALL_TEAM_QUERY = `*[_type == "teamLid"] | order(orderRank asc) {
  _id,
  name,
  "function": function,
  image
}`
