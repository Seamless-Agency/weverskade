import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Algemene Instellingen',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Bedrijfsnaam',
      type: 'string',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Adres',
      type: 'string',
    }),
    defineField({
      name: 'postalCode',
      title: 'Postcode en plaats',
      type: 'string',
    }),
    defineField({
      name: 'country',
      title: 'Land',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Telefoonnummer',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'E-mail',
      type: 'string',
    }),
    defineField({
      name: 'linkedIn',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      description: 'Wordt getoond bij "Nieuws en updates" op de wonen-bij projectpagina\'s. Leeg laten = niet tonen.',
      type: 'url',
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook URL',
      description: 'Wordt getoond bij "Nieuws en updates" op de wonen-bij projectpagina\'s. Leeg laten = niet tonen.',
      type: 'url',
    }),
    defineField({
      name: 'metaTitle',
      title: 'Browser titel (SEO)',
      description: 'De titel die in de browser tab en Google zoekresultaten verschijnt. Bijv. "Weverskade | Aandacht voor ruimte"',
      type: 'string',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Beschrijving (SEO)',
      description: 'Korte beschrijving voor Google en social media. Max 160 tekens.',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'privacyPolicyUrl',
      title: 'Privacy Policy URL',
      description: 'Link naar de privacy verklaring (bijv. /privacy of externe URL).',
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Algemene Instellingen' }
    },
  },
})
