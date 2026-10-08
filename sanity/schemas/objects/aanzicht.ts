import { defineType, defineField } from 'sanity'

/**
 * Eén aanzicht in de woningzoeker: een render (luchtfoto of gevel) met
 * daarop overgetrokken woningen, en/of klikzones die naar een ander aanzicht
 * doorlinken. Zo bepaalt de redactie per project zelf hoeveel aanzichten er
 * zijn en welke woningen eronder hangen.
 */
export const aanzicht = defineType({
  name: 'aanzicht',
  title: 'Aanzicht',
  type: 'object',
  fields: [
    defineField({
      name: 'key',
      title: 'Sleutel',
      description:
        'Korte unieke naam, bijv. "luchtfoto", "voorgevel" of "achtergevel". Klikzones op andere aanzichten verwijzen hiernaar.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Knoptekst',
      description: 'Tekst op de keuzeknop onder de render, bijv. "Voorgevel".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'render',
      title: 'Render / foto',
      description:
        'Het beeld van dit aanzicht. Vervang je het later door een andere uitsnede, dan moeten de vlakken opnieuw worden nagelopen.',
      type: 'image',
      options: { hotspot: false },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'weergave',
      title: 'Weergave in het paneel',
      description:
        "Foto's kunnen het paneel vullen (randen vallen weg); technische geveltekeningen passen beter volledig in beeld op een witte achtergrond.",
      type: 'string',
      initialValue: 'vullend',
      options: {
        list: [
          { title: 'Vullend (foto)', value: 'vullend' },
          { title: 'Passend (tekening)', value: 'passend' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'woningen',
      title: 'Woningen op dit aanzicht',
      description:
        'Eén item per woning die op dít beeld zichtbaar is. Dezelfde woning mag op meerdere aanzichten voorkomen (voor- én achtergevel); houd het bouwnummer dan gelijk.',
      type: 'array',
      of: [{ type: 'woning' }],
    }),
    defineField({
      name: 'zones',
      title: 'Klikzones naar andere aanzichten',
      description:
        'Alleen voor overzichtsbeelden (zoals de luchtfoto): klikbare gebieden die een gevel-aanzicht openen.',
      type: 'array',
      of: [{ type: 'overzichtZone' }],
    }),
  ],
  preview: {
    select: {
      label: 'label',
      key: 'key',
      media: 'render',
      woningen: 'woningen',
      zones: 'zones',
    },
    prepare({ label, key, media, woningen, zones }) {
      const nWoningen = Array.isArray(woningen) ? woningen.length : 0
      const nZones = Array.isArray(zones) ? zones.length : 0
      return {
        title: label ?? key ?? 'Aanzicht',
        subtitle: [
          key,
          nWoningen ? `${nWoningen} woningen` : null,
          nZones ? `${nZones} klikzones` : null,
        ]
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
