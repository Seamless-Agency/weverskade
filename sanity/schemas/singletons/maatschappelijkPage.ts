import { defineType, defineField } from 'sanity'

export const maatschappelijkPage = defineType({
  name: 'maatschappelijkPage',
  title: 'Maatschappelijk',
  type: 'document',
  fieldsets: [
    { name: 'hero', title: 'Hero Sectie' },
    { name: 'statement', title: 'Statement Sectie' },
    { name: 'approach', title: 'Onze Aanpak' },
    { name: 'circle', title: 'Cirkel Sectie' },
    { name: 'impactBlocks', title: 'Impact Blokken' },
    { name: 'team', title: 'Team Sectie' },
    { name: 'cta', title: 'Call to Action' },
  ],
  fields: [
    // Hero
    defineField({
      name: 'heroTitle',
      title: 'Titel',
      type: 'string',
      fieldset: 'hero',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Ondertitel',
      type: 'string',
      fieldset: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Achtergrond afbeelding',
      type: 'image',
      options: { hotspot: true },
      fieldset: 'hero',
    }),
    // Statement
    defineField({
      name: 'statementHeading',
      title: 'Heading',
      type: 'text',
      rows: 3,
      fieldset: 'statement',
    }),
    defineField({
      name: 'statementParagraphs',
      title: 'Paragrafen',
      type: 'array',
      of: [{ type: 'text' }],
      fieldset: 'statement',
    }),
    // Approach
    defineField({
      name: 'approachLabel',
      title: 'Label',
      type: 'string',
      fieldset: 'approach',
    }),
    defineField({
      name: 'approachHeading',
      title: 'Heading',
      type: 'string',
      fieldset: 'approach',
    }),
    defineField({
      name: 'approachItems',
      title: 'Aanpak items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Nummer', type: 'string' }),
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title', subtitle: 'number' } },
        },
      ],
      fieldset: 'approach',
    }),
    // Circle
    defineField({
      name: 'circleText',
      title: 'Cirkel tekst (herhalend)',
      type: 'string',
      fieldset: 'circle',
    }),
    // Impact blocks
    defineField({
      name: 'impactBlocks',
      title: 'Impact blokken',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titel', type: 'string' }),
            defineField({ name: 'description', title: 'Beschrijving', type: 'text', rows: 4 }),
            defineField({ name: 'image', title: 'Afbeelding', type: 'image', options: { hotspot: true } }),
          ],
          preview: { select: { title: 'title', media: 'image' } },
        },
      ],
      fieldset: 'impactBlocks',
    }),
    // Team
    defineField({
      name: 'teamImage',
      title: 'Team afbeelding',
      type: 'image',
      options: { hotspot: true },
      fieldset: 'team',
      description: 'Groepsfoto van het team, getoond onderaan de pagina',
    }),
    // CTA
    defineField({
      name: 'cta',
      title: 'CTA',
      type: 'sectionCta',
      fieldset: 'cta',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Maatschappelijk Pagina' }
    },
  },
})
