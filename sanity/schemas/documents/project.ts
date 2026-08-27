import { defineType, defineField } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const project = defineType({
  name: 'project',
  title: 'Projecten',
  type: 'document',
  groups: [
    { name: 'general', title: 'Algemeen', default: true },
    { name: 'details', title: 'Project details' },
    { name: 'visibility', title: 'Zichtbaarheid' },
    { name: 'woningzoeker', title: 'Woningzoeker' },
    { name: 'wonenbij', title: 'Wonen bij pagina' },
    { name: 'media', title: 'Media' },
    { name: 'content', title: 'Tekst & Quote' },
    { name: 'location', title: 'Locatie & Kaart' },
  ],
  fieldsets: [
    {
      name: 'autoReply',
      title: 'Automatische bevestigingsmail',
      description:
        'De e-mail die iemand automatisch ontvangt na het invullen van het "Woningen beschikbaar"-formulier op deze projectpagina.',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Naam',
      type: 'string',
      group: 'general',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'general',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'general',
    }),

    // ─── Project details (visible op de detailpagina onder de tagline) ───
    defineField({
      name: 'type',
      title: 'Type (functie)',
      description: 'Wordt getoond als regel onder het adres. Laat leeg om niet te tonen.',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Kantoor', value: 'Kantoor' },
          { title: 'Woning', value: 'Woning' },
          { title: 'Retail', value: 'Retail' },
          { title: 'Gemengd', value: 'Gemengd' },
          { title: 'Overig', value: 'Overig' },
        ],
      },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      description: 'In ontwikkeling / Opgeleverd / In beheer. Laat leeg om niet te tonen.',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'In ontwikkeling', value: 'In ontwikkeling' },
          { title: 'Opgeleverd', value: 'Opgeleverd' },
          { title: 'In beheer', value: 'In beheer' },
        ],
      },
    }),
    defineField({
      name: 'category',
      title: 'Categorie (portefeuille filter)',
      description: 'Bepaalt onder welk filter het project verschijnt op de portefeuille pagina.',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Eigendom', value: 'Eigendom' },
          { title: 'In ontwikkeling', value: 'In ontwikkeling' },
          { title: 'Facility Management', value: 'Facility Management' },
        ],
      },
    }),
    defineField({
      name: 'location',
      title: 'Locatie (stad)',
      description: 'Bijv. "Maasland". Wordt onder andere gebruikt op de portefeuille pagina.',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'address',
      title: 'Adres',
      description: 'Volledig adres, bijv. "Molenweg 8A, 3155 AV Maasland". Wordt als eerste regel onder de tagline getoond.',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'size',
      title: 'Oppervlakte',
      description: 'Bijv. "8.500 m²" of "60 - 80 m²". Laat leeg om niet te tonen.',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'year',
      title: 'Jaar',
      description: 'Bijv. "2025" of "1767". Laat leeg om niet te tonen.',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'breeam',
      title: 'BREEAM score',
      description: 'Bijv. "BREEAM Good". Laat leeg om niet te tonen.',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'epc',
      title: 'EPC label',
      description: 'Bijv. "EPC A+++". Laat leeg om niet te tonen.',
      type: 'string',
      group: 'details',
    }),
    defineField({
      name: 'partners',
      title: 'Partners',
      description: 'Bijv. "Van der Linden & Co". Laat leeg om niet te tonen.',
      type: 'string',
      group: 'details',
    }),

    // ─── Zichtbaarheid ───
    defineField({
      name: 'wonenBeschikbaar',
      title: 'Woningen beschikbaar',
      description: 'Zet aan voor projecten waar woningen te huur/koop zijn. Toont een groene pill en een contactformulier.',
      type: 'boolean',
      group: 'visibility',
      initialValue: false,
    }),
    defineField({
      name: 'showInWonen',
      title: 'Tonen op wonen-bij pagina',
      type: 'boolean',
      group: 'visibility',
      initialValue: false,
    }),
    defineField({
      name: 'hasDetailPage',
      title: 'Heeft detailpagina',
      description: 'Schakel in om een eigen detailpagina te genereren voor dit project.',
      type: 'boolean',
      group: 'visibility',
      initialValue: false,
    }),
    defineField({
      name: 'autoReplyEnabled',
      title: 'Bevestigingsmail versturen',
      description:
        'Zet uit om voor dit project tijdelijk geen automatische bevestiging naar de inzender te sturen.',
      type: 'boolean',
      initialValue: true,
      group: 'visibility',
      fieldset: 'autoReply',
    }),
    defineField({
      name: 'autoReplySubject',
      title: 'Onderwerp',
      type: 'string',
      initialValue: 'Bedankt voor je interesse',
      group: 'visibility',
      fieldset: 'autoReply',
    }),
    defineField({
      name: 'autoReplyBody',
      title: 'Bericht',
      description: 'Gebruik een lege regel voor een nieuwe alinea.',
      type: 'text',
      rows: 10,
      initialValue:
        'Beste lezer,\n\nHartelijk dank voor je inschrijving en interesse in een van onze huurwoningen. Wij hebben je bericht in goede orde ontvangen.\n\nNaar verwachting volgt er voor dit project aan het einde van de zomer meer informatie. Zodra dit bekend is, nemen wij contact met je op.\n\nHartelijke groet,\nTeam Weverskade',
      group: 'visibility',
      fieldset: 'autoReply',
    }),

    // ─── Woningzoeker ───
    // Eén render per gebouw, met per woning een éénmalig overgetrokken vlak.
    // Daarna wisselt alleen de status van een woning nog.
    defineField({
      name: 'woningzoekerEnabled',
      title: 'Woningzoeker tonen',
      description:
        'Zet aan om de interactieve woningkiezer op de projectpagina te tonen. Vereist een render én minimaal één overgetrokken woning.',
      type: 'boolean',
      group: 'woningzoeker',
      initialValue: false,
    }),
    defineField({
      name: 'projectFase',
      title: 'Fase',
      description:
        'Bepaalt de pill op de woningzoeker en op de wonen-bij pagina.',
      type: 'string',
      group: 'woningzoeker',
      initialValue: 'binnenkort',
      options: {
        list: [
          { title: 'Binnenkort', value: 'binnenkort' },
          { title: 'Inschrijving open', value: 'inschrijving' },
          { title: 'In verhuur', value: 'in-verhuur' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'woningzoekerIntro',
      title: 'Introtekst',
      description: 'Korte uitleg naast de kop van de woningzoeker.',
      type: 'text',
      rows: 3,
      group: 'woningzoeker',
    }),
    defineField({
      name: 'woningzoekerRender',
      title: 'Render van het gebouw',
      description:
        'De afbeelding waarop de woningen worden overgetrokken. Vervang je deze later door een andere uitsnede, dan moeten de vlakken opnieuw worden nagelopen.',
      type: 'image',
      group: 'woningzoeker',
      options: { hotspot: false },
    }),
    defineField({
      name: 'woningen',
      title: 'Woningen',
      description:
        'Eén item per woning. Open een woning om de omtrek op de render over te trekken.',
      type: 'array',
      group: 'woningzoeker',
      of: [{ type: 'woning' }],
    }),
    defineField({
      name: 'aanzichten',
      title: 'Aanzichten',
      description:
        'Meerdere aanzichten (bijv. luchtfoto + voorgevel + achtergevel), elk met een eigen render en eigen overgetrokken woningen. Als hier aanzichten staan, winnen die van de losse render hierboven.',
      type: 'array',
      group: 'woningzoeker',
      of: [{ type: 'aanzicht' }],
    }),

    // ─── Wonen bij pagina (wonenbij.weverskade.com) ───
    defineField({
      name: 'wonenBijEnabled',
      title: 'Wonen bij projectpagina tonen',
      description:
        'Zet aan om voor dit project een eigen pagina op wonenbij.weverskade.com te genereren.',
      type: 'boolean',
      group: 'wonenbij',
      initialValue: false,
    }),
    defineField({
      name: 'wonenBijIntro',
      title: 'Introtekst ("Over het project")',
      type: 'text',
      rows: 6,
      group: 'wonenbij',
    }),
    defineField({
      name: 'feiten',
      title: 'Feiten en cijfers',
      description: 'De blokjes met icoon in de groene band.',
      type: 'array',
      group: 'wonenbij',
      of: [
        {
          type: 'object',
          name: 'feit',
          fields: [
            defineField({
              name: 'icoon',
              title: 'Icoon',
              type: 'string',
              options: {
                list: [
                  { title: 'Locatie (speld)', value: 'locatie' },
                  { title: 'Woningen (gebouw)', value: 'woningen' },
                  { title: 'Oppervlakte (m²)', value: 'oppervlakte' },
                  { title: 'Slaapkamers (bed)', value: 'slaapkamers' },
                  { title: 'Buitenruimte (balkon)', value: 'buitenruimte' },
                  { title: 'Duurzaamheid (blad)', value: 'duurzaamheid' },
                  { title: 'Huurprijs (sleutel)', value: 'huurprijs' },
                  { title: 'Beschikbaarheid (vinkje)', value: 'beschikbaarheid' },
                ],
              },
            }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({ name: 'waarde', title: 'Waarde', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'label', subtitle: 'waarde' } },
        },
      ],
    }),
    defineField({
      name: 'hurenFotos',
      title: 'Fotocarrousel "Huren in …"',
      type: 'array',
      group: 'wonenbij',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'welkomTekst',
      title: 'Welkom-sectie: tekst links',
      type: 'text',
      rows: 4,
      group: 'wonenbij',
    }),
    defineField({
      name: 'welkomTekstRechts',
      title: 'Welkom-sectie: tekst rechts',
      type: 'text',
      rows: 4,
      group: 'wonenbij',
    }),
    defineField({
      name: 'welkomFotos',
      title: "Welkom-sectie: foto's (2)",
      type: 'array',
      group: 'wonenbij',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'carouselFotos',
      title: 'Horizontale fotostrip',
      type: 'array',
      group: 'wonenbij',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'locatieTitel',
      title: 'Locatie: titel',
      description: 'Bijv. "Midden in Maassluis".',
      type: 'string',
      group: 'wonenbij',
    }),
    defineField({
      name: 'locatieIntro',
      title: 'Locatie: introtekst',
      type: 'text',
      rows: 4,
      group: 'wonenbij',
    }),
    defineField({
      name: 'locatieItems',
      title: 'Locatie: uitklapblokken',
      description: 'Bijv. "De stad", "De omgeving", "Bereikbaarheid".',
      type: 'array',
      group: 'wonenbij',
      of: [
        {
          type: 'object',
          name: 'locatieItem',
          fields: [
            defineField({ name: 'titel', title: 'Titel', type: 'string' }),
            defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 4 }),
          ],
          preview: { select: { title: 'titel' } },
        },
      ],
    }),
    defineField({
      name: 'planning',
      title: 'Projectplanning',
      type: 'array',
      group: 'wonenbij',
      of: [
        {
          type: 'object',
          name: 'planningFase',
          fields: [
            defineField({ name: 'periode', title: 'Periode', description: 'Bijv. "April 2026".', type: 'string' }),
            defineField({ name: 'titel', title: 'Fase', type: 'string' }),
            defineField({ name: 'omschrijving', title: 'Omschrijving', type: 'text', rows: 3 }),
            defineField({
              name: 'verwachtingen',
              title: 'Dit mag je verwachten',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'actief',
              title: 'Huidige fase',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: { select: { title: 'titel', subtitle: 'periode' } },
        },
      ],
    }),
    defineField({
      name: 'downloads',
      title: 'Downloads',
      type: 'array',
      group: 'wonenbij',
      of: [
        {
          type: 'object',
          name: 'downloadItem',
          fields: [
            defineField({ name: 'titel', title: 'Titel', type: 'string' }),
            defineField({ name: 'bestand', title: 'Bestand', type: 'file' }),
          ],
          preview: { select: { title: 'titel' } },
        },
      ],
    }),
    defineField({
      name: 'faq',
      title: 'Veelgestelde vragen',
      type: 'array',
      group: 'wonenbij',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({ name: 'vraag', title: 'Vraag', type: 'string' }),
            defineField({ name: 'antwoord', title: 'Antwoord', type: 'text', rows: 4 }),
          ],
          preview: { select: { title: 'vraag' } },
        },
      ],
    }),
    defineField({
      name: 'woningTypes',
      title: 'Woningtypes',
      description:
        'De woningtypes van dit project. Elk type krijgt een eigen woningpagina op wonenbij.weverskade.com.',
      type: 'array',
      group: 'wonenbij',
      of: [{ type: 'woningType' }],
    }),

    // ─── Media ───
    defineField({
      name: 'portfolioImage',
      title: 'Portfolio afbeelding (grid)',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero afbeelding',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      description: 'Wordt gebruikt als er geen Hero video URL is ingevuld.',
    }),
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero Vimeo video URL',
      type: 'url',
      group: 'media',
      description: 'Optioneel. Als ingevuld, wordt de video als achtergrond loop afgespeeld (zonder geluid) in plaats van de hero afbeelding. Bijv. https://vimeo.com/123456789',
    }),
    defineField({
      name: 'fullWidthImage',
      title: 'Volledige breedte afbeelding',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'smallImages',
      title: 'Kleine afbeeldingen (galerij)',
      description:
        'Voeg minimaal 2 afbeeldingen toe. Bij precies 2 worden ze naast elkaar getoond. Bij 3 of meer wordt het automatisch een horizontaal scrollbare galerij.',
      type: 'array',
      group: 'media',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (rule) => rule.min(2),
    }),

    // ─── Tekst & Quote ───
    defineField({
      name: 'descriptionLeft',
      title: 'Beschrijving links',
      type: 'text',
      group: 'content',
      rows: 6,
    }),
    defineField({
      name: 'descriptionRight',
      title: 'Beschrijving rechts',
      type: 'text',
      group: 'content',
      rows: 6,
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      group: 'content',
      rows: 3,
    }),
    defineField({
      name: 'quoteAuthor',
      title: 'Quote auteur',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'quoteAuthorImage',
      title: 'Quote auteur foto',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
    }),

    // ─── Locatie & Kaart ───
    defineField({
      name: 'mapLat',
      title: 'Breedte (latitude)',
      type: 'number',
      group: 'location',
    }),
    defineField({
      name: 'mapLng',
      title: 'Lengte (longitude)',
      type: 'number',
      group: 'location',
    }),

    orderRankField({ type: 'project' }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      title: 'name',
      subtitle: 'location',
      media: 'portfolioImage',
    },
  },
})
