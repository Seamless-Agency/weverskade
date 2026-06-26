import { createClient } from '@sanity/client'
import { createReadStream } from 'fs'
import path from 'path'

const projectId = 'trx6ryh3'
const dataset = 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN environment variable')
  console.error('Usage: SANITY_WRITE_TOKEN=sk... node scripts/seed-sanity.mjs')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })
const imgDir = path.resolve('public/images')

// ─── Image upload helper ───
const imageCache = {}
async function uploadImage(filename) {
  if (imageCache[filename]) return imageCache[filename]
  if (filename.endsWith('.svg')) {
    console.log(`  Skipping SVG: ${filename}`)
    return null
  }
  const filePath = path.join(imgDir, filename)
  try {
    console.log(`  Uploading: ${filename}`)
    const asset = await client.assets.upload('image', createReadStream(filePath), { filename })
    const ref = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
    imageCache[filename] = ref
    return ref
  } catch (e) {
    console.error(`  Failed to upload ${filename}:`, e.message)
    return null
  }
}

// ─── Create or replace a document ───
async function createDoc(doc) {
  try {
    const result = await client.createOrReplace(doc)
    console.log(`✓ ${doc._type}: ${doc._id || result._id}`)
    return result
  } catch (e) {
    console.error(`✗ ${doc._type} (${doc._id}):`, e.message)
  }
}

// ═══════════════════════════════════════════
// SEED ALL DATA
// ═══════════════════════════════════════════
async function seed() {
  console.log('\n=== Uploading images ===\n')

  // Pre-upload all needed images
  const img = {}
  const imageFiles = [
    'hero-bg.png', 'small-plant.jpg',
    'portfolio-1.png', 'portfolio-2.png', 'portfolio-3.png',
    'portfolio-card-1.jpg', 'portfolio-card-2.jpg', 'portfolio-card-3.jpg',
    'portfolio-hero.jpg', 'nature.jpg',
    'about-ds1.jpg', 'about-story.jpg', 'about-aerial.png', 'about-nature.jpg',
    'about-beleggen.jpg', 'about-ontwikkelen.jpg',
    'about-team-1.jpg', 'about-team-2.jpg', 'about-team-3.jpg', 'about-team-4.jpg',
    'about-team-5.jpg', 'about-team-6.jpg', 'about-team-7.jpg', 'about-team-8.jpg', 'about-team-9.jpg',
    'contact-team.jpg', 'news-placeholder.png',
    'sociaal-hero.jpg', 'sociaal-co2.jpg', 'sociaal-mensen.jpg', 'sociaal-verduurzamen.jpg',
  ]
  for (const f of imageFiles) {
    img[f] = await uploadImage(f)
  }

  // ─── SITE SETTINGS ───
  console.log('\n=== Creating singletons ===\n')

  await createDoc({
    _id: 'siteSettings',
    _type: 'siteSettings',
    companyName: 'Weverskade B.V.',
    tagline: 'Aandacht voor ruimte',
    address: 'Cornelis van der Lelylaan 4',
    postalCode: '3147 PB Maassluis',
    country: 'Netherlands',
    phone: '+31 (0)10 599 6300',
    email: 'info@weverskade.com',
    linkedIn: 'https://www.linkedin.com/company/weverskade',
  })

  // ─── FOOTER ───
  await createDoc({
    _id: 'footer',
    _type: 'footer',
    companyName: 'Weverskade B.V.',
    links: [
      { _key: 'a1', label: 'Home', url: '/' },
      { _key: 'a2', label: 'Over ons', url: '/over-ons' },
      { _key: 'a3', label: 'Portefeuille', url: '/portefeuille' },
      { _key: 'a4', label: 'Nieuws', url: '/nieuws' },
      { _key: 'a5', label: 'Wonen bij', url: '/wonen-bij' },
      { _key: 'a6', label: 'Maatschappelijk', url: '/maatschappelijk' },
      { _key: 'a7', label: 'Werken bij', url: '/werken-bij' },
      { _key: 'a8', label: 'Contact', url: '/contact' },
      { _key: 'a9', label: 'LinkedIn', url: 'https://www.linkedin.com/company/weverskade' },
    ],
    address: 'Cornelis van der Lelylaan 4',
    postalCode: '3147 PB Maassluis',
    country: 'Netherlands',
    phone: '+31(0)10 599 6300',
    email: 'info@weverskade.com',
  })

  // ─── HOME PAGE ───
  await createDoc({
    _id: 'homePage',
    _type: 'homePage',
    heroTitle: 'Aandacht voor ruimte',
    heroSubtitle: '',
    heroImage: img['hero-bg.png'],
    introHeading: 'Weverskade is een ontwikkelende belegger in woningen en commercieel vastgoed. Door zelf te ontwikkelen en te beheren, maken we keuzes die verder kijken dan de vraag van nu.',
    introText: 'Sinds 2010 werken we met een betrokken team aan de groei van onze duurzame vastgoedportefeuille. Door zelf te ontwikkelen én te beheren blijven we dicht bij onze gebouwen en hun omgeving. Zo creëren we met aandacht voor ruimte plekken die vandaag werken en morgen nog steeds kloppen.',
    introLinkText: 'Meer over ons',
    introLinkUrl: '/over-ons',
    introImage: img['small-plant.jpg'],
    portfolioLabel: 'Portefeuille',
    portfolioHeading: 'Onze projecten',
    portfolioLinkText: 'Bekijk gehele portefeuille',
    portfolioLinkUrl: '/portefeuille',
    impactLabel: 'Maatschappelijk en sociaal betrokken',
    impactHeading: 'Aandacht voor',
    impactWords: ['natuur', 'mens', 'ruimte'],
    impactDescription: 'We maken keuzes die bijdragen aan een gezonde en toekomstbestendige leefomgeving.',
    impactLinkText: 'Onze maatschappelijke betrokkenheid',
    impactLinkUrl: '/maatschappelijk',
    impactImages: [img['portfolio-3.png'], img['portfolio-2.png'], img['nature.jpg']].filter(Boolean),
    newsLabel: 'Nieuws',
    newsHeading: 'Van Weverskade',
  })

  // ─── OVER ONS PAGE ───
  await createDoc({
    _id: 'overOnsPage',
    _type: 'overOnsPage',
    heroTitle: 'Over ons',
    heroImage: img['about-ds1.jpg'],
    storyHeading: 'Weverskade ontwikkelt en beheert vastgoed met aandacht voor ruimte. We kijken verder dan de vraag van het moment en investeren in plekken die blijven werken, vandaag en op lange termijn.',
    storyText: 'Weverskade werkt met een gedreven team aan een portefeuille van woningen en commercieel vastgoed. Vanuit die basis bouwen we stap voor stap aan plekken die blijven werken en met de tijd beter worden.\n\nWe kijken met aandacht naar de ruimte in en om onze gebouwen en nemen verantwoordelijkheid voor hoe deze functioneren, vandaag en op lange termijn. Naast ontwikkeling en beheer verzorgen we ook de services die nodig zijn om gebouwen goed te laten draaien en hun kwaliteit te behouden.',
    storyImage: img['about-story.jpg'],
    mvLabel: 'Missie & Visie',
    mvHeading: 'Bij Weverskade geloven we in het goed doen. Ook als niemand daarom vraagt.',
    missionText: 'Met vastgoed willen we bijdragen aan een omgeving die goed is voor mens en natuur. We creëren plekken waar wonen en werken vanzelf goed voelt en waar kwaliteit en gezondheid vanzelfsprekend zijn. Vanuit die verantwoordelijkheid investeren we ook in maatschappelijke en duurzame initiatieven.',
    visionText: 'We bouwen aan een portefeuille die financieel sterk is én bijdraagt aan de samenleving en het milieu. Onze lange termijn richt zich op CO₂-neutraliteit in 2050 en op investeringen die waarde toevoegen voor gebruikers, omgeving en toekomst.',
    wwdLabel: 'Wat we doen',
    wwdHeading: 'Wat we doen',
    wwdItems: [
      { _key: 'w1', title: 'Beleggen', description: 'We bouwen aan een portefeuille die blijft werken en met de tijd beter wordt. Door betrokken te blijven bij onze gebouwen en hun omgeving investeren we in duurzame waarde op lange termijn.' },
      { _key: 'w2', title: 'Ontwikkelen', description: 'We ontwikkelen woningen en commercieel vastgoed met oog voor de plek en de lange termijn. Van eerste idee tot realisatie maken we keuzes die bijdragen aan kwaliteit en toekomstwaarde.' },
      { _key: 'w3', title: 'Hospitality & Services', description: 'We zorgen voor het dagelijks functioneren van onze gebouwen en de ruimte eromheen. Met aandacht voor onderhoud, techniek en gebruikers houden we plekken gezond, prettig en toekomstbestendig.' },
    ],
    teamLabel: 'Het team',
    teamHeading: 'Het team',
    factsLabel: 'Feiten en cijfers',
    factsHeading: 'Feiten en cijfers',
    stats: [
      { _key: 's1', value: '150.000 m²', label: 'Vierkante meters vastgoed ontwikkeld sinds 2010' },
      { _key: 's2', value: '00.000 m²', label: 'Vierkante meters vastgoed in beheer voor diverse gebruikers' },
      { _key: 's3', value: '88,32%', label: 'Hoogste BREEAM score voor de Lely Campus in Maassluis.' },
      { _key: 's4', value: '25', label: 'Een team van 25 gedreven professionals.' },
      { _key: 's5', value: '4 landen', label: 'Weverskade is actief in Nederland, België, Groot-Brittannië en de VS.' },
      { _key: 's6', value: 'x', label: 'Hier ruimte voor nog een feit' },
    ],
    impactHeading: 'Aandacht voor',
    impactText: 'We maken keuzes die bijdragen aan een gezonde en toekomstbestendige leefomgeving.',
    impactImages: [img['about-nature.jpg'], img['about-aerial.png'], img['about-story.jpg']].filter(Boolean),
    cta: {
      label: 'Werken bij',
      heading: 'Weverskade is altijd op zoek naar mensen die met aandacht willen werken aan vastgoed en onderdeel willen zijn van een betrokken team.',
      linkText: 'Naar het vacature overzicht',
      linkUrl: '/werken-bij',
    },
  })

  // ─── PORTEFEUILLE PAGE ───
  await createDoc({
    _id: 'portefeuillePage',
    _type: 'portefeuillePage',
    heroLabel: 'Portefeuille',
    heroTitle: 'Portefeuille',
    heroImages: [img['portfolio-hero.jpg'], img['portfolio-card-1.jpg'], img['portfolio-card-2.jpg'], img['portfolio-card-3.jpg'], img['portfolio-1.png'], img['portfolio-2.png'], img['portfolio-3.png']].filter(Boolean),
    ctaLabel: 'Neem contact op',
    ctaHeading: 'Heeft u een vraag over een specifiek project of wilt u meer informatie over onze werkzaamheden?',
    ctaLinkText: 'Naar de contactpagina',
    ctaLinkUrl: '/contact',
  })

  // ─── WONEN BIJ PAGE ───
  await createDoc({
    _id: 'wonenBijPage',
    _type: 'wonenBijPage',
    heroLabel: 'Wonen bij',
    heroTitle: 'Onze woningprojecten zijn plekken waar mensen zich thuis kunnen voelen. Hier vindt u een overzicht van woningen in ontwikkeling en in eigendom, met aandacht voor kwaliteit, comfort en de omgeving waarin ze staan.',
    ctaLabel: 'Neem contact op',
    ctaHeading: 'Heeft u een vraag over een specifiek project?',
    ctaLinkText: 'Naar de contactpagina',
    ctaLinkUrl: '/contact',
    autoReplyEnabled: true,
    autoReplySubject: 'Bedankt voor je interesse in Wonen bij Weverskade',
    autoReplyBody:
      'Beste lezer,\n\nHartelijk dank voor je inschrijving en interesse in een van onze huurwoningen. Wij hebben je bericht in goede orde ontvangen.\n\nNaar verwachting volgt er aan het einde van de zomer meer informatie. Zodra dit bekend is, nemen wij contact met je op.\n\nHartelijke groet,\nTeam Weverskade',
  })

  // ─── MAATSCHAPPELIJK PAGE ───
  await createDoc({
    _id: 'maatschappelijkPage',
    _type: 'maatschappelijkPage',
    heroTitle: 'Maatschappelijk',
    heroSubtitle: 'en sociaal betrokken',
    heroImage: img['sociaal-hero.jpg'],
    statementHeading: 'Bij Weverskade geloven we dat vastgoed alleen waarde heeft als het bijdraagt aan een leefomgeving die klopt. Met aandacht voor ruimte kijken we verder dan het gebouw en nemen we verantwoordelijkheid voor de omgeving eromheen.',
    statementParagraphs: [],
    approachLabel: 'Onze aanpak',
    approachHeading: 'Onze aanpak',
    approachItems: [
      { _key: 'ap1', number: '01', title: 'Aandacht voor mens', description: 'We werken aan plekken waar mensen prettig kunnen wonen en werken, met aandacht voor kwaliteit, comfort en gebruik op de lange termijn. Vastgoed moet niet alleen functioneren, maar ook goed aanvoelen en bijdragen aan een omgeving waar mensen zich thuis voelen.' },
      { _key: 'ap2', number: '02', title: 'Aandacht voor natuur', description: 'We maken keuzes die bijdragen aan een gezonde en toekomstbestendige leefomgeving. Dat betekent investeren in duurzame oplossingen en een portefeuille die op lange termijn waarde houdt voor zowel gebruikers als omgeving.' },
      { _key: 'ap3', number: '03', title: 'Aandacht voor ruimte', description: 'We gaan zorgvuldig om met de plek en de context waarin we werken. Door zelf te ontwikkelen én te beheren blijven we betrokken bij hoe gebouwen functioneren en hoe de ruimte eromheen wordt gebruikt. Zo bouwen we stap voor stap aan omgevingen die blijven werken en met de tijd beter worden.' },
    ],
    circleText: 'Aandacht voor ruimte',
    impactBlocks: [
      { _key: 'ib1', title: 'Samen naar een CO₂-neutrale wereld', description: 'We werken stap voor stap aan een portefeuille die op lange termijn CO₂-neutraal kan opereren. Door gebouwen te verbeteren, te verduurzamen en toekomstbestendig te maken, nemen we verantwoordelijkheid voor de impact van ons vastgoed. Niet als losse ambitie, maar als vanzelfsprekend onderdeel van hoe we ontwikkelen en beheren. Voor nu en de generaties na ons.', image: img['sociaal-co2.jpg'] },
      { _key: 'ib2', title: 'Kwalitatieve huisvesting wanneer het nodig is', description: 'We bieden huisvesting voor een breed publiek. Ook wanneer snelheid gevraagd wordt, doen we geen concessies aan kwaliteit. Bij de woningen voor Oekraïense ontheemden vonden we het belangrijk dat deze niet als opvang zouden voelen, maar als volwaardige woonomgeving. Met aandacht voor privacy, leefbaarheid en comfort realiseerden we plekken waar mensen zich thuis kunnen voelen, juist in een periode van onzekerheid.', image: img['sociaal-mensen.jpg'] },
      { _key: 'ib3', title: 'Verduurzamen van wat er al is', description: 'We geloven dat goed vastgoed niet altijd nieuw hoeft te zijn. Door bestaande gebouwen zorgvuldig te verbeteren en te verduurzamen, verlengen we hun levensduur en versterken we hun waarde voor gebruikers, locatie en cultureel erfgoed. Zo verbinden we duurzame keuzes aan de identiteit van een plek.', image: img['sociaal-verduurzamen.jpg'] },
    ],
    cta: {
      label: 'Neem contact op',
      heading: 'Wilt u meer weten over onze maatschappelijke en sociale betrokkenheid? Neem gerust contact met ons op.',
      linkText: 'Naar de contactpagina',
      linkUrl: '/contact',
    },
  })

  // ─── CONTACT PAGE ───
  await createDoc({
    _id: 'contactPage',
    _type: 'contactPage',
    heroTitle: 'Contact',
    heroImage: img['contact-team.jpg'],
    contactItems: [
      { _key: 'c1', label: 'Bezoek ons', value: 'Cornelis van der Lelylaan 4\n3147 PB Maassluis\nNetherlands' },
      { _key: 'c2', label: 'Neem contact op', value: '+31 (0)10 599 6300\ninfo@weverskade.com\nOnze LinkedIn pagina' },
      { _key: 'c3', label: 'Werken bij', value: 'werkenbij@weverskade.com' },
    ],
    formHeading: 'Neem contact op',
  })

  // ─── NIEUWS PAGE SETTINGS ───
  await createDoc({
    _id: 'nieuwsPageSettings',
    _type: 'nieuwsPageSettings',
    heroLabel: 'Nieuws',
    heroTitle: 'Nieuws',
  })

  // ─── WERKEN BIJ PAGE ───
  await createDoc({
    _id: 'werkenBijPage',
    _type: 'werkenBijPage',
    heroLabel: 'Werken bij',
    heroTitle: 'Werken bij Weverkade',
    heroDescription: 'Bekijk onze openstaande vacatures en bouw mee aan de toekomst van vastgoedontwikkeling.',
    contactEmail: 'werkenbij@weverskade.com',
  })

  // ─── PROJECTS ───
  console.log('\n=== Creating projects ===\n')

  const projects = [
    { slug: 'de-nieuwe-markt-rotterdam', name: 'De Nieuwe Markt Rotterdam', tagline: 'In het hart van de stad', type: 'Kantoor', status: 'Opgeleverd', category: 'Eigendom', location: 'Rotterdam', image: 'portfolio-card-1.jpg', showInPortfolio: true, showInWonen: false, hasDetailPage: false, order: 1 },
    { slug: 'weverstede', name: 'Weverstede', tagline: 'Wonen aan het water', type: 'Woning', status: 'Opgeleverd', category: 'Eigendom', location: 'Nieuwegein', image: 'portfolio-card-2.jpg', showInPortfolio: true, showInWonen: true, hasDetailPage: true, wonenBeschikbaar: true, order: 2,
      address: 'Weverstede 1-100, 3438 AB Nieuwegein', size: '12.500 m²', year: '2025', breeam: 'Excellent', epc: 'A+',
      descriptionLeft: 'Weverstede is een woonproject aan het water in Nieuwegein. Het project combineert modern wonen met een groene, waterrijke omgeving. De woningen zijn ontworpen met aandacht voor duurzaamheid en leefbaarheid.',
      descriptionRight: 'Het project omvat een mix van appartementen en eengezinswoningen, elk met ruime buitenruimtes en uitzicht op het water. De architectuur sluit aan bij het landschap en creëert een prettige woonomgeving.',
      quote: 'Weverstede laat zien hoe wonen aan het water kan samengaan met duurzaamheid en gemeenschapsgevoel.',
      quoteAuthor: 'Marcel Knoester',
      mapLat: 52.0285, mapLng: 5.0867,
      heroImg: 'portfolio-card-2.jpg', fullWidthImg: 'portfolio-2.png', smallImgs: ['portfolio-card-1.jpg', 'portfolio-card-3.jpg'] },
    { slug: 'de-drie-lelies', name: 'De Drie Lelies', tagline: 'Historie in het Maaslands erfgoed', type: 'Kantoor', status: 'In ontwikkeling', category: 'Eigendom', location: 'Maassluis', image: 'portfolio-card-3.jpg', showInPortfolio: true, showInWonen: true, hasDetailPage: true, wonenBeschikbaar: false, order: 3,
      address: 'Hoogstraat 2, 3142 EA Maassluis', size: '8.200 m²', year: '2026',
      descriptionLeft: 'De Drie Lelies is een herontwikkeling in het historische hart van Maassluis. Het project combineert het behoud van cultureel erfgoed met moderne functionaliteit en duurzaamheid.',
      descriptionRight: 'Het gebouw wordt getransformeerd tot een gemengd complex met ruimte voor kantoren, horeca en publieke functies. De architectuur respecteert het Maaslandse erfgoed en voegt daar een eigentijdse laag aan toe.',
      quote: 'De Drie Lelies is een voorbeeld van hoe je geschiedenis en toekomst kunt verbinden in één gebouw.',
      quoteAuthor: 'Marcel Knoester',
      mapLat: 51.9236, mapLng: 4.2500,
      heroImg: 'portfolio-card-3.jpg', fullWidthImg: 'portfolio-3.png', smallImgs: ['portfolio-card-1.jpg', 'portfolio-card-2.jpg'] },
    { slug: 'the-new-citizen', name: 'The New Citizen', tagline: 'Dichtbij alles', type: 'Kantoor', status: 'Opgeleverd', category: 'In ontwikkeling', location: 'Heereveen', image: 'portfolio-card-3.jpg', showInPortfolio: true, showInWonen: true, hasDetailPage: true, wonenBeschikbaar: true, order: 4,
      address: 'Stationsplein 1, 3431 KV Nieuwegein', size: '15.000 m²', year: '2025', breeam: 'Outstanding', epc: 'A+++', partners: 'BAM',
      descriptionLeft: 'The New Citizen is een gemengd gebruik gebouw op een prominente locatie nabij het station. Het project biedt ruimte voor kantoren, winkels en woningen in een duurzaam en toekomstbestendig ontwerp.',
      descriptionRight: 'Met een focus op bereikbaarheid en gemeenschapsvorming brengt The New Citizen verschillende functies samen op één plek. Het gebouw is ontworpen volgens de hoogste duurzaamheidsnormen.',
      quote: 'The New Citizen bewijst dat een gebouw meer kan zijn dan de som der delen — het kan een gemeenschap creëren.',
      quoteAuthor: 'Marcel Knoester',
      mapLat: 52.0300, mapLng: 5.0900,
      heroImg: 'portfolio-card-3.jpg', fullWidthImg: 'portfolio-1.png', smallImgs: ['portfolio-card-2.jpg', 'portfolio-card-1.jpg'] },
    { slug: 'lely-campus', name: 'Lely Campus', tagline: 'Werken met uitzicht', type: 'Kantoor', status: 'Opgeleverd', category: 'Eigendom', location: 'Maassluis', image: 'portfolio-1.png', showInPortfolio: true, showInWonen: false, hasDetailPage: false, order: 5 },
    { slug: 'harbour-view', name: 'Harbour View', tagline: 'Aan de Scheveningse haven', type: 'Kantoor', status: 'Opgeleverd', category: 'Eigendom', location: 'Amsterdam', image: 'portfolio-card-1.jpg', showInPortfolio: true, showInWonen: false, hasDetailPage: false, order: 6 },
    { slug: 'het-weversplein', name: 'Het Weversplein', tagline: 'Ontmoeten in Delft', type: 'Kantoor', status: 'Opgeleverd', category: 'Eigendom', location: 'Delft', image: 'portfolio-card-2.jpg', showInPortfolio: true, showInWonen: false, hasDetailPage: false, order: 7 },
    { slug: 'parkzicht', name: 'Parkzicht', tagline: 'Wonen in het groen', type: 'Woning', status: 'In ontwikkeling', category: 'In ontwikkeling', location: 'Heereveen', image: 'portfolio-2.png', showInPortfolio: true, showInWonen: true, hasDetailPage: false, wonenBeschikbaar: false, order: 8 },
    { slug: 'maaspoort', name: 'Maaspoort', tagline: 'Nieuwbouw aan de Maas', type: 'Woning', status: 'In ontwikkeling', category: 'In ontwikkeling', location: 'Maassluis', image: 'portfolio-card-1.jpg', showInPortfolio: true, showInWonen: true, hasDetailPage: false, wonenBeschikbaar: false, order: 9 },
    { slug: 'stadskwartier', name: 'Stadskwartier', tagline: 'Leven in het centrum', type: 'Gemengd', status: 'In beheer', category: 'Facility Management', location: 'Heereveen', image: 'portfolio-3.png', showInPortfolio: true, showInWonen: false, hasDetailPage: false, order: 10 },
    { slug: 'de-horizon', name: 'De Horizon', tagline: 'Vergezichten over Friesland', type: 'Kantoor', status: 'In beheer', category: 'Facility Management', location: 'Heereveen', image: 'portfolio-card-3.jpg', showInPortfolio: true, showInWonen: false, hasDetailPage: false, order: 11 },
    { slug: 'pella-business-park', name: 'Pella Business Park', tagline: 'Dutch heritage in Iowa', type: 'Kantoor', status: 'In beheer', category: 'Facility Management', location: 'Pella (US)', image: 'portfolio-card-2.jpg', showInPortfolio: true, showInWonen: false, hasDetailPage: false, order: 12 },
    { slug: 'nieuwegein-centrum', name: 'Nieuwegein Centrum', tagline: 'Hart van de stad', type: 'Gemengd', status: 'In beheer', category: 'Facility Management', location: 'Nieuwegein', image: 'portfolio-card-1.jpg', showInPortfolio: true, showInWonen: false, hasDetailPage: false, order: 13 },
    // Wonen-only projects not in portfolio
    { slug: 'nieuwemarkt-rotterdam', name: 'Nieuwemarkt Rotterdam', tagline: 'In het hart van de stad', type: 'Woning', status: 'Opgeleverd', category: 'Eigendom', location: 'Rotterdam', image: 'portfolio-card-1.jpg', showInPortfolio: false, showInWonen: true, hasDetailPage: false, wonenBeschikbaar: true, order: 14 },
  ]

  for (const p of projects) {
    const doc = {
      _id: `project-${p.slug}`,
      _type: 'project',
      name: p.name,
      slug: { _type: 'slug', current: p.slug },
      tagline: p.tagline,
      type: p.type,
      status: p.status,
      category: p.category,
      location: p.location,
      showInPortfolio: p.showInPortfolio,
      showInWonen: p.showInWonen ?? false,
      hasDetailPage: p.hasDetailPage,
      wonenBeschikbaar: p.wonenBeschikbaar ?? false,
      order: p.order,
      autoReplyEnabled: true,
      autoReplySubject: `Bedankt voor je interesse in ${p.name}`,
      autoReplyBody: `Beste lezer,\n\nHartelijk dank voor je inschrijving en interesse in ${p.name}. Wij hebben je bericht in goede orde ontvangen.\n\nNaar verwachting volgt er voor dit project aan het einde van de zomer meer informatie. Zodra dit bekend is, nemen wij contact met je op.\n\nHartelijke groet,\nTeam Weverskade`,
      portfolioImage: img[p.image],
      ...(p.address && { address: p.address }),
      ...(p.size && { size: p.size }),
      ...(p.year && { year: p.year }),
      ...(p.breeam && { breeam: p.breeam }),
      ...(p.epc && { epc: p.epc }),
      ...(p.partners && { partners: p.partners }),
      ...(p.descriptionLeft && { descriptionLeft: p.descriptionLeft }),
      ...(p.descriptionRight && { descriptionRight: p.descriptionRight }),
      ...(p.quote && { quote: p.quote }),
      ...(p.quoteAuthor && { quoteAuthor: p.quoteAuthor }),
      ...(p.mapLat && { mapLat: p.mapLat }),
      ...(p.mapLng && { mapLng: p.mapLng }),
      ...(p.heroImg && { heroImage: img[p.heroImg] }),
      ...(p.fullWidthImg && { fullWidthImage: img[p.fullWidthImg] }),
      ...(p.smallImgs && { smallImages: p.smallImgs.map(i => img[i]).filter(Boolean) }),
    }
    await createDoc(doc)
  }

  // Set featured projects on home page (references)
  console.log('\n=== Setting featured projects on home page ===\n')
  await client.patch('homePage').set({
    featuredProjects: [
      { _type: 'reference', _ref: 'project-de-nieuwe-markt-rotterdam', _key: 'fp1' },
      { _type: 'reference', _ref: 'project-the-new-citizen', _key: 'fp2' },
      { _type: 'reference', _ref: 'project-de-drie-lelies', _key: 'fp3' },
    ],
  }).commit()
  console.log('✓ Featured projects set')

  // ─── NEWS ARTICLES ───
  console.log('\n=== Creating news articles ===\n')

  const newsBody = [
    'Weverskade is geselecteerd als ontwikkelaar voor de herontwikkeling van stadion De Kuip en de directe omgeving. Na een langlopend tendertraject is gekozen voor een plan waarin behoud, vernieuwing en de toekomst van het gebied zorgvuldig samenkomen.',
    'De herontwikkeling richt zich op het versterken van de plek in de stad, met ruimte voor wonen, werken en voorzieningen, terwijl het karakter van het stadion en zijn omgeving behouden blijft.',
    'Voor Weverskade betekent de selectie een bijzondere stap. De Kuip is een plek met een sterke betekenis voor de stad en haar bewoners.',
    '\u201CDe Kuip is meer dan een gebouw. Het is een plek die diep in de stad verankerd is. We voelen ons verantwoordelijk om hier met aandacht en respect aan te werken, en tegelijkertijd ruimte te maken voor een nieuwe toekomst,\u201D zegt het team van Weverskade.',
    'De komende periode wordt het plan verder uitgewerkt in nauwe samenwerking met gemeente, partners en gebruikers van het gebied.',
  ]

  function makePortableText(paragraphs) {
    return paragraphs.map((text, i) => ({
      _type: 'block',
      _key: `b${i}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `s${i}`, text, marks: [] }],
    }))
  }

  for (let i = 1; i <= 9; i++) {
    await createDoc({
      _id: `nieuws-${i}`,
      _type: 'nieuwsArtikel',
      title: i === 1
        ? 'Weverskade geselecteerd als ontwikkelaar van De Kuip.'
        : 'En dan de titel van het nieuwsbericht',
      slug: { _type: 'slug', current: i === 1 ? 'weverskade-geselecteerd-als-ontwikkelaar-van-de-kuip' : `titel-van-het-nieuwsbericht-${i}` },
      date: '2026-01-30',
      category: 'Nieuws',
      excerpt: 'Weverskade is geselecteerd als ontwikkelaar voor de herontwikkeling van stadion De Kuip.',
      heroImage: img['news-placeholder.png'],
      body: makePortableText(newsBody),
    })
  }

  // ─── VACATURES ───
  console.log('\n=== Creating vacatures ===\n')

  const vacatureBody = [
    { style: 'h2', text: 'Over de functie' },
    { style: 'normal', text: 'Als Development Manager ben je verantwoordelijk voor de aansturing van vastgoedontwikkelingsprojecten, van initiatieffase tot oplevering. Je werkt nauw samen met interne en externe stakeholders en draagt bij aan de strategische groei van onze portefeuille.' },
    { style: 'h2', text: 'Wat ga je doen' },
    { style: 'normal', text: 'Je stuurt complexe ontwikkeltrajecten aan en bent het eerste aanspreekpunt voor projectpartners, gemeenten en adviseurs. Je bewaakt planning, budget en kwaliteit en zorgt dat projecten aansluiten bij onze visie op duurzaam en toekomstbestendig vastgoed.' },
    { style: 'h2', text: 'Wat vragen wij' },
    { style: 'normal', text: 'Je hebt minimaal 5 jaar ervaring in vastgoedontwikkeling, een relevant HBO/WO-diploma en sterke communicatieve vaardigheden. Je bent ondernemend, analytisch en voelt je thuis in een betrokken team.' },
    { style: 'h2', text: 'Over Weverskade' },
    { style: 'normal', text: 'Weverskade is een ontwikkelende belegger in woningen en commercieel vastgoed. Met een team van 25 professionals werken we vanuit Maassluis aan een groeiende, duurzame portefeuille.' },
    { style: 'h2', text: 'Interesse?' },
    { style: 'normal', text: 'Stuur je CV en motivatie naar werkenbij@weverskade.com. Voor vragen kun je bellen met +31 (0)10 599 6300.' },
  ]

  const vacaturePortableText = vacatureBody.map((block, i) => ({
    _type: 'block',
    _key: `vb${i}`,
    style: block.style,
    markDefs: [],
    children: [{ _type: 'span', _key: `vs${i}`, text: block.text, marks: [] }],
  }))

  for (const v of [
    { slug: 'development-manager', title: 'Development Manager', desc: 'Stuur complexe vastgoedontwikkelingsprojecten aan, van initiatieffase tot oplevering, en draag bij aan de groei van een duurzame portefeuille.' },
    { slug: 'development-manager-2', title: 'Development Manager', desc: 'Stuur complexe vastgoedontwikkelingsprojecten aan, van initiatieffase tot oplevering, en draag bij aan de groei van een duurzame portefeuille.' },
    { slug: 'development-manager-3', title: 'Development Manager', desc: 'Stuur complexe vastgoedontwikkelingsprojecten aan, van initiatieffase tot oplevering, en draag bij aan de groei van een duurzame portefeuille.' },
  ]) {
    await createDoc({
      _id: `vacature-${v.slug}`,
      _type: 'vacature',
      title: v.title,
      slug: { _type: 'slug', current: v.slug },
      shortDescription: v.desc,
      body: vacaturePortableText,
      isActive: true,
    })
  }

  // ─── TEAM MEMBERS ───
  console.log('\n=== Creating team members ===\n')

  const teamNames = [
    'Marcel Knoester', 'Sophie van der Berg', 'Jan Willem de Vries',
    'Lisa Bakker', 'Thomas Jansen', 'Anna de Groot',
    'Pieter Hendriks', 'Maria van Dijk', 'Robert Smit',
  ]

  for (let i = 0; i < 9; i++) {
    const teamImg = await uploadImage(`about-team-${i + 1}.jpg`)
    await createDoc({
      _id: `team-${i + 1}`,
      _type: 'teamLid',
      name: teamNames[i],
      function: 'Managing Director',
      image: teamImg,
      order: i + 1,
    })
  }

  console.log('\n=== SEED COMPLETE ===\n')
  console.log('All content has been seeded to Sanity!')
  console.log('Visit http://localhost:3000/studio to see the content.')
  console.log('Visit http://localhost:3000 to see the website with CMS data.\n')
}

seed().catch(console.error)
