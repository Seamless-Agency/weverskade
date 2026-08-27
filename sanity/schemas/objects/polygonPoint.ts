import { defineType, defineField } from 'sanity'

/**
 * Eén hoekpunt van een woningpolygoon, genormaliseerd tussen 0 en 1.
 * 0 = linker-/bovenrand van de render, 1 = rechter-/onderrand.
 *
 * Wordt in de praktijk nooit met de hand ingevuld: de PolygonTracer schrijft
 * deze waarden weg. De velden staan er wel, zodat een punt desnoods handmatig
 * bijgesteld of geïnspecteerd kan worden.
 */
export const polygonPoint = defineType({
  name: 'polygonPoint',
  title: 'Punt',
  type: 'object',
  fields: [
    defineField({
      name: 'x',
      title: 'X',
      type: 'number',
      validation: (rule) => rule.required().min(0).max(1),
    }),
    defineField({
      name: 'y',
      title: 'Y',
      type: 'number',
      validation: (rule) => rule.required().min(0).max(1),
    }),
  ],
  preview: {
    select: { x: 'x', y: 'y' },
    prepare({ x, y }) {
      return { title: `${Math.round((x ?? 0) * 100)}% / ${Math.round((y ?? 0) * 100)}%` }
    },
  },
})
