import { defineField, defineType } from 'sanity'

/**
 * Woningtype binnen een wonen-bij project (bijv. "Type B — doorzonappartement").
 * Elk type krijgt een eigen woningpagina met foto's, plattegrond en
 * inschrijfformulier. De individuele woningen op de render (woningzoeker)
 * verwijzen via hun "Woningtype"-veld naar de naam van dit type.
 */
export const woningType = defineType({
  name: 'woningType',
  title: 'Woningtype',
  type: 'object',
  fields: [
    defineField({
      name: 'naam',
      title: 'Naam',
      description: 'Bijv. "Type B — doorzonappartement". Moet exact overeenkomen met het woningtype van de woningen op de render.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Bepaalt de URL van de woningpagina, bijv. "type-b".',
      type: 'slug',
      options: { source: 'naam' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'inschrijven',
      options: {
        list: [
          { title: 'Inschrijven mogelijk', value: 'inschrijven' },
          { title: 'Direct beschikbaar', value: 'beschikbaar' },
          { title: 'In optie', value: 'in-optie' },
          { title: 'Verhuurd', value: 'bezet' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'prijsVan',
      title: 'Huurprijs vanaf (per maand)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'prijsTot',
      title: 'Huurprijs tot (per maand)',
      type: 'number',
    }),
    defineField({
      name: 'oppervlakte',
      title: 'Oppervlakte (m²)',
      type: 'number',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'slaapkamers',
      title: 'Aantal slaapkamers',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'energielabel',
      title: 'Energielabel',
      description: 'Bijv. "A+++".',
      type: 'string',
    }),
    defineField({
      name: 'buitenruimte',
      title: 'Buitenruimte',
      description: 'Bijv. "15 m² buitenruimte" of "22 m² dakterras".',
      type: 'string',
    }),
    defineField({
      name: 'fotos',
      title: "Foto's",
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'plattegronden',
      title: 'Plattegronden',
      type: 'array',
      of: [{ type: 'image' }],
    }),
    defineField({
      name: 'plattegrondLabel',
      title: 'Plattegrond label',
      description: 'Bijv. "Plattegrond eerste verdieping".',
      type: 'string',
    }),
    defineField({
      name: 'omschrijving',
      title: 'Omschrijving',
      description: 'Blokken met een kopje en tekst, bijv. "Over dit appartement", "Duurzaam wonen".',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'omschrijvingBlok',
          title: 'Blok',
          fields: [
            defineField({ name: 'kop', title: 'Kop', type: 'string' }),
            defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 4 }),
          ],
          preview: { select: { title: 'kop' } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'naam', subtitle: 'status', media: 'fotos.0' },
  },
})
