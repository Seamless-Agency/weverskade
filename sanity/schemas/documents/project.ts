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
