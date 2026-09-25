import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * De landingspagina van de nieuwe wonen-bij omgeving (wonenbij.weverskade.com,
 * route /wonenbij). Los van het singleton "wonenBijPage", dat de bestaande
 * /wonen-bij pagina op weverskade.com voedt.
 *
 * Elk veld is optioneel: een leeg veld valt in de code terug op de standaard-
 * tekst (data/wonenbij.ts → landingDefaults). Projecten en het woningaanbod
 * komen niet uit dit document maar uit de projectdocumenten.
 */
export const wonenBijLanding = defineType({
  name: 'wonenBijLanding',
  title: 'Wonen bij - landingspagina',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'intro', title: 'Intro' },
    { name: 'over', title: 'Over Weverskade' },
    { name: 'waarom', title: 'Waarom wonen bij' },
    { name: 'overzichten', title: 'Aanbod en projecten' },
    { name: 'contact', title: 'Contact' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    /* Hero */
    defineField({
      name: 'heroVideoUrl',
      title: 'Hero video (Vimeo-link)',
      type: 'url',
      group: 'hero',
      description:
        'Bijvoorbeeld https://vimeo.com/1184821093. Leeg laten om alleen de hero afbeelding te tonen.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero afbeelding',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      description:
        'Wordt getoond tot de video speelt, en als er geen video is ingesteld.',
    }),
    defineField({
      name: 'heroKnop',
      title: 'Knop rechtsboven',
      type: 'string',
      group: 'hero',
      description: 'De knop verwijst naar het woningaanbod op deze pagina.',
    }),

    /* Intro */
    defineField({
      name: 'introStatement',
      title: 'Statement',
      type: 'text',
      rows: 4,
      group: 'intro',
    }),
    defineField({
      name: 'introCtas',
      title: 'Routes onder het statement',
      type: 'array',
      group: 'intro',
      description:
        'Twee blokken met een korte tekst en een knop: naar de woonprojecten en direct naar het aanbod.',
      validation: (Rule) => Rule.max(2),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'introCta',
          fields: [
            defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 2 }),
            defineField({ name: 'knop', title: 'Knoptekst', type: 'string' }),
            defineField({
              name: 'doel',
              title: 'Knop verwijst naar',
              type: 'string',
              options: {
                list: [
                  { title: 'Onze woonprojecten', value: '#projecten' },
                  { title: 'Beschikbare woningen (aanbod)', value: '#aanbod' },
                  { title: 'Over Weverskade', value: '#over' },
                  { title: 'Contact', value: '#contact' },
                ],
              },
            }),
          ],
          preview: {
            select: { title: 'knop', subtitle: 'tekst' },
          },
        }),
      ],
    }),

    /* Over */
    defineField({
      name: 'overTitel',
      title: 'Titel',
      type: 'text',
      rows: 2,
      group: 'over',
      description: 'Een regelovergang in dit veld wordt ook op de site een nieuwe regel.',
    }),
    defineField({
      name: 'overFoto',
      title: 'Foto 1 (rechts naast de titel)',
      type: 'image',
      group: 'over',
      options: { hotspot: true },
    }),
    defineField({
      name: 'overTekst',
      title: 'Tekst bij foto 1',
      type: 'text',
      rows: 8,
      group: 'over',
      description: 'Gebruik een lege regel voor een nieuwe alinea.',
    }),
    defineField({
      name: 'overFoto2',
      title: 'Foto 2 (links)',
      type: 'image',
      group: 'over',
      options: { hotspot: true },
    }),
    defineField({
      name: 'overTekstRechts',
      title: 'Tekst bij foto 2',
      type: 'text',
      rows: 5,
      group: 'over',
    }),
    defineField({
      name: 'overKnop',
      title: 'Knop onder de tekst bij foto 2',
      type: 'string',
      group: 'over',
      description: 'Verwijst naar het woningaanbod op deze pagina.',
    }),

    /* Waarom wonen bij (groene band) */
    defineField({
      name: 'kwaliteitTitel',
      title: 'Titel',
      type: 'string',
      group: 'waarom',
    }),
    defineField({
      name: 'kwaliteitIntro',
      title: 'Introtekst',
      type: 'text',
      rows: 3,
      group: 'waarom',
    }),
    defineField({
      name: 'kwaliteitItems',
      title: 'Punten',
      type: 'array',
      group: 'waarom',
      description: 'Drie punten naast elkaar, elk met een kopje en een korte toelichting.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'kwaliteitItem',
          fields: [
            defineField({ name: 'label', title: 'Kopje', type: 'string' }),
            defineField({ name: 'waarde', title: 'Toelichting', type: 'text', rows: 4 }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'waarde' },
          },
        }),
      ],
    }),

    /* Aanbod en projecten */
    defineField({
      name: 'aanbodTitel',
      title: 'Titel woningaanbod',
      type: 'string',
      group: 'overzichten',
      description:
        'De kaarten eronder komen automatisch uit de projecten met een ingevulde "Wonen bij pagina".',
    }),
    defineField({
      name: 'aanbodIntro',
      title: 'Introtekst woningaanbod',
      type: 'text',
      rows: 4,
      group: 'overzichten',
      description:
        'Tekstblok onder de titel, bijvoorbeeld "Nu in de verhuur: ..." of later een algemene aanbodtekst. Gebruik een lege regel voor een nieuwe alinea.',
    }),
    defineField({
      name: 'projectenTitel',
      title: 'Titel projectoverzicht',
      type: 'string',
      group: 'overzichten',
    }),
    defineField({
      name: 'projectenIntro',
      title: 'Introtekst projectoverzicht',
      type: 'text',
      rows: 5,
      group: 'overzichten',
      description: 'Gebruik een lege regel voor een nieuwe alinea.',
    }),

    /* Contact */
    defineField({
      name: 'contactLabel',
      title: 'Label boven het formulier',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactTitel',
      title: 'Kop boven het formulier',
      type: 'string',
      group: 'contact',
      description: 'Kort houden, bijvoorbeeld "Heb je een algemene vraag?".',
    }),
    defineField({
      name: 'contactTekst',
      title: 'Tekst onder de kop',
      type: 'text',
      rows: 3,
      group: 'contact',
    }),

    /* SEO */
    defineField({
      name: 'seoDescription',
      title: 'Omschrijving voor Google',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Maximaal ongeveer 160 tekens. Leeg? Dan wordt het statement gebruikt.',
      validation: (Rule) => Rule.max(200),
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Wonen bij - landingspagina' }
    },
  },
})
