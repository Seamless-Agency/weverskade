import { defineType, defineField } from 'sanity'

export const wonenBijPage = defineType({
  name: 'wonenBijPage',
  title: 'Wonen Bij',
  type: 'document',
  fields: [
    defineField({
      name: 'heroLabel',
      title: 'Hero label',
      type: 'string',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero titel',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'introLabel',
      title: 'Intro label',
      type: 'string',
    }),
    defineField({
      name: 'introText',
      title: 'Intro tekst',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
    }),
    defineField({
      name: 'ctaHeading',
      title: 'CTA heading',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'ctaLinkText',
      title: 'CTA link tekst',
      type: 'string',
    }),
    defineField({
      name: 'ctaLinkUrl',
      title: 'CTA link URL',
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Wonen Bij Pagina' }
    },
  },
})
