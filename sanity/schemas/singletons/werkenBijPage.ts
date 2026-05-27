import { defineType, defineField } from 'sanity'

export const werkenBijPage = defineType({
  name: 'werkenBijPage',
  title: 'Werken Bij',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'statement', title: 'Statement' },
    { name: 'about', title: 'Over sectie' },
    { name: 'cta', title: 'CTA' },
  ],
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero titel',
      type: 'string',
      description: 'Standaard: "Werken bij"',
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero afbeelding',
      type: 'image',
      description: 'Kleine afbeelding rechts naast de titel',
      options: { hotspot: true },
      group: 'hero',
    }),
    defineField({
      name: 'statementText',
      title: 'Statement tekst',
      type: 'text',
      rows: 4,
      description: 'Grote tekst onder de hero',
      group: 'statement',
    }),
    defineField({
      name: 'aboutImage',
      title: 'Afbeelding',
      type: 'image',
      description: 'Grote teamfoto links',
      options: { hotspot: true },
      group: 'about',
    }),
    defineField({
      name: 'aboutLabel',
      title: 'Label',
      type: 'string',
      description: 'Standaard: "Werken bij Weverskade"',
      group: 'about',
    }),
    defineField({
      name: 'aboutText',
      title: 'Tekst',
      type: 'text',
      rows: 8,
      description: 'Gebruik een lege regel voor een nieuwe alinea',
      group: 'about',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Label',
      type: 'string',
      description: 'Standaard: "Neem contact op"',
      group: 'cta',
    }),
    defineField({
      name: 'ctaHeading',
      title: 'Heading',
      type: 'text',
      rows: 4,
      description: 'Grote tekst in de blauwe sectie. Laat leeg voor standaard tekst met e-mail link.',
      group: 'cta',
    }),
    defineField({
      name: 'ctaLinkText',
      title: 'Link tekst',
      type: 'string',
      description: 'Standaard: "Naar de contactpagina"',
      group: 'cta',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact e-mail',
      type: 'string',
      description: 'E-mailadres in de CTA sectie. Standaard: "info@weverskade.com"',
      group: 'cta',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Werken Bij Pagina' }
    },
  },
})
