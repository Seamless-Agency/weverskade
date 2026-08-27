import { defineType, defineField } from 'sanity'
import PolygonTracer from '../../components/PolygonTracer'

const STATUS_LABEL: Record<string, string> = {
  beschikbaar: 'Beschikbaar',
  'in-optie': 'In optie',
  bezet: 'Bezet',
}

/**
 * Eén woning binnen een project. De polygoon wordt éénmalig overgetrokken op
 * de render; daarna is `status` het enige veld dat tijdens de verhuur nog
 * wisselt (beschikbaar → in optie → bezet).
 */
export const woning = defineType({
  name: 'woning',
  title: 'Woning',
  type: 'object',
  fields: [
    defineField({
      name: 'nummer',
      title: 'Bouwnummer',
      description: 'Bijv. "A.101". Wordt getoond op de render en in de lijst.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      description:
        'Bepaalt de kleur op de render. Dit is het veld dat tijdens de verhuur wisselt.',
      type: 'string',
      initialValue: 'beschikbaar',
      options: {
        list: [
          { title: 'Beschikbaar', value: 'beschikbaar' },
          { title: 'In optie', value: 'in-optie' },
          { title: 'Bezet', value: 'bezet' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'woningType',
      title: 'Woningtype',
      description: 'Bijv. "Type B — doorzonwoning".',
      type: 'string',
    }),
    defineField({
      name: 'verdieping',
      title: 'Verdieping',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'oppervlakte',
      title: 'Oppervlakte (m²)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'slaapkamers',
      title: 'Slaapkamers',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'huurprijs',
      title: 'Huurprijs per maand (€)',
      description: 'Alleen het bedrag, zonder euroteken.',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'orientatie',
      title: 'Oriëntatie',
      description: 'Bijv. "Zuidwest".',
      type: 'string',
    }),
    defineField({
      name: 'buitenruimte',
      title: 'Buitenruimte',
      description: 'Bijv. "Balkon 8 m²".',
      type: 'string',
    }),
    defineField({
      name: 'plattegrond',
      title: 'Plattegrond',
      type: 'image',
      options: { hotspot: false },
    }),
    defineField({
      name: 'polygon',
      title: 'Omtrek op de render',
      description:
        'Trek de woning over op de render. Minimaal 3 punten; de coördinaten worden genormaliseerd opgeslagen en schalen dus mee met elk schermformaat.',
      type: 'array',
      of: [{ type: 'polygonPoint' }],
      components: { input: PolygonTracer },
      validation: (rule) =>
        rule.custom((value?: unknown[]) => {
          if (!value || value.length === 0) return true
          return value.length >= 3 || 'Een vlak heeft minimaal 3 punten nodig.'
        }),
    }),
  ],
  preview: {
    select: {
      nummer: 'nummer',
      woningType: 'woningType',
      status: 'status',
      oppervlakte: 'oppervlakte',
      media: 'plattegrond',
      polygon: 'polygon',
    },
    prepare({ nummer, woningType, status, oppervlakte, media, polygon }) {
      const overgetrokken = Array.isArray(polygon) && polygon.length >= 3
      const subtitle = [
        STATUS_LABEL[status] ?? status,
        woningType,
        oppervlakte ? `${oppervlakte} m²` : null,
        overgetrokken ? null : '⚠ nog niet overgetrokken',
      ]
        .filter(Boolean)
        .join(' · ')

      return { title: nummer ?? 'Woning', subtitle, media }
    },
  },
})
