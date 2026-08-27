import { defineField, defineType } from 'sanity'

export const formSubmission = defineType({
  name: 'formSubmission',
  title: 'Formulier inzending',
  type: 'document',
  fields: [
    defineField({
      name: 'submittedAt',
      title: 'Ingezonden op',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'new',
      options: {
        list: [
          { title: 'Nieuw', value: 'new' },
          { title: 'Opgevolgd', value: 'contacted' },
          { title: 'Afgerond', value: 'closed' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'formType',
      title: 'Formulier',
      type: 'string',
      options: {
        list: [
          { title: 'Contactpagina', value: 'contact' },
          { title: 'Wonen bij', value: 'wonen_bij' },
          { title: 'Gebouw wonen', value: 'gebouw_wonen' },
          { title: 'Woningzoeker', value: 'woningzoeker' },
          { title: 'Wonen bij — inschrijving', value: 'wonenbij_inschrijving' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceLabel',
      title: 'Bron',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Naam',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Emailadres',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Telefoonnummer',
      type: 'string',
    }),
    defineField({
      name: 'interestedProject',
      title: 'Interesse in project',
      type: 'string',
    }),
    defineField({
      name: 'projectName',
      title: 'Projectnaam',
      type: 'string',
    }),
    defineField({
      name: 'projectSlug',
      title: 'Project slug',
      type: 'string',
    }),
    defineField({
      name: 'age',
      title: 'Leeftijd',
      type: 'string',
    }),
    defineField({
      name: 'occupation',
      title: 'Werkgever / beroep',
      type: 'string',
    }),
    defineField({
      name: 'householdIncome',
      title: 'Bruto huishoudinkomen',
      type: 'string',
    }),
    defineField({
      name: 'householdComposition',
      title: 'Gezinssamenstelling',
      type: 'string',
    }),
    defineField({
      name: 'message',
      title: 'Vraag of opmerking',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'agreed',
      title: 'Akkoord met voorwaarden/privacybeleid',
      type: 'boolean',
    }),
    defineField({
      name: 'pageUrl',
      title: 'Pagina URL',
      type: 'url',
    }),
    defineField({
      name: 'resendEmailId',
      title: 'Resend email ID',
      type: 'string',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Nieuwste eerst',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      email: 'email',
      formType: 'formType',
      submittedAt: 'submittedAt',
    },
    prepare({ title, email, formType, submittedAt }) {
      const date = submittedAt
        ? new Intl.DateTimeFormat('nl-NL', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(submittedAt))
        : 'Geen datum'

      return {
        title: title ?? 'Formulier inzending',
        subtitle: [formType, email, date].filter(Boolean).join(' · '),
      }
    },
  },
})
