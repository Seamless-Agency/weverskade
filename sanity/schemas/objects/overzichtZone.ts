import { defineType, defineField } from 'sanity'
import PolygonTracer from '../../components/PolygonTracer'

/**
 * Klikbaar gebied op een overzichtsbeeld (zoals de luchtfoto) dat een ander
 * aanzicht opent. De redactie trekt het gebouw over en verwijst met de
 * sleutel naar het aanzicht dat moet openen.
 */
export const overzichtZone = defineType({
  name: 'overzichtZone',
  title: 'Klikzone',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      description: 'Tekst op de zone, bijv. "Bekijk alle woningen per gevel".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'doelKey',
      title: 'Opent aanzicht (sleutel)',
      description:
        'De "Sleutel" van het aanzicht dat opent bij klik, bijv. "voorgevel". Moet exact overeenkomen met een ander aanzicht in de lijst.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'polygon',
      title: 'Omtrek op het overzichtsbeeld',
      description:
        'Trek het klikbare gebied over (bijv. het hele gebouw). Minimaal 3 punten.',
      type: 'array',
      of: [{ type: 'polygonPoint' }],
      components: { input: PolygonTracer },
      validation: (rule) =>
        rule.custom((value?: unknown[]) => {
          if (!value || value.length === 0) return true
          return value.length >= 3 || 'Een zone heeft minimaal 3 punten nodig.'
        }),
    }),
  ],
  preview: {
    select: { label: 'label', doelKey: 'doelKey', polygon: 'polygon' },
    prepare({ label, doelKey, polygon }) {
      const overgetrokken = Array.isArray(polygon) && polygon.length >= 3
      return {
        title: label ?? 'Klikzone',
        subtitle: [
          doelKey ? `→ ${doelKey}` : '⚠ geen doel-aanzicht',
          overgetrokken ? null : '⚠ nog niet overgetrokken',
        ]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
