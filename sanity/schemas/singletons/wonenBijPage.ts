import { defineType, defineField } from 'sanity'

export const wonenBijPage = defineType({
  name: 'wonenBijPage',
  title: 'Wonen Bij',
  type: 'document',
  fieldsets: [
    {
      name: 'autoReply',
      title: 'Automatische bevestigingsmail',
      description:
        'De e-mail die iemand automatisch ontvangt nadat hij of zij zich via het inschrijfformulier op deze pagina aanmeldt.',
      options: { collapsible: true, collapsed: true },
    },
  ],
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
    defineField({
      name: 'autoReplyEnabled',
      title: 'Bevestigingsmail versturen',
      description:
        'Zet uit om tijdelijk geen automatische bevestiging naar de inzender te sturen.',
      type: 'boolean',
      initialValue: true,
      fieldset: 'autoReply',
    }),
    defineField({
      name: 'autoReplySubject',
      title: 'Onderwerp',
      type: 'string',
      initialValue: 'Bedankt voor je interesse in Wonen bij Weverskade',
      fieldset: 'autoReply',
    }),
    defineField({
      name: 'autoReplyBody',
      title: 'Bericht',
      description: 'Gebruik een lege regel voor een nieuwe alinea.',
      type: 'text',
      rows: 10,
      initialValue:
        'Beste lezer,\n\nHartelijk dank voor je inschrijving en interesse in een van onze huurwoningen. Wij hebben je bericht in goede orde ontvangen.\n\nNaar verwachting volgt er aan het einde van de zomer meer informatie. Zodra dit bekend is, nemen wij contact met je op.\n\nHartelijke groet,\nTeam Weverskade',
      fieldset: 'autoReply',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Wonen Bij Pagina' }
    },
  },
})
