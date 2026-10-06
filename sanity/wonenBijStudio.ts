import type { StructureResolver } from 'sanity/structure'
import { project } from './schemas/documents/project'
import { apiVersion } from './env'

/* Beperkte Studio voor de wonen-bij preview (branch wonenbij-v2).
   Zolang wonen bij nog niet live staat, werkt de redactie in de Studio van de
   preview, maar die deelt de dataset met weverskade.com. Deze weergave toont
   daarom alleen wat wonen bij gebruikt: de landingspagina en per woonproject
   het tabblad "Wonen bij pagina". Velden die óók op weverskade.com staan,
   staan apart en gemarkeerd. Na de merge naar main is de Studio vanzelf weer
   compleet, omdat de modus aan de preview-host hangt. */

const PREVIEW_BRANCH = 'wonenbij-v2'

export function isWonenBijStudio(hostname: string): boolean {
  if (process.env.NEXT_PUBLIC_STUDIO_MODE === 'wonenbij') return true
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === PREVIEW_BRANCH) return true
  // Branch-URL van Vercel: weverskade-git-wonenbij-v2-<team>.vercel.app
  return hostname.includes(`-git-${PREVIEW_BRANCH}-`)
}

// Velden die wonen bij gebruikt én die op weverskade.com staan.
const GEDEELD = new Set(['name', 'location', 'portfolioImage', 'showInWonen', 'mapLat', 'mapLng'])
const GEDEELD_MAIL = new Set(['autoReplyEnabled', 'autoReplySubject', 'autoReplyBody'])
const LET_OP = 'Let op: ook zichtbaar op weverskade.com.'

type Field = (typeof project.fields)[number] & {
  group?: string
  fieldset?: string
  description?: string
  hidden?: boolean
}

const fields = project.fields as Field[]
const wonenBijVelden = fields
  .filter((f) => f.group === 'wonenbij')
  .map((f) =>
    // De gewone uitleg verwijst naar het tabblad Media, dat hier verborgen is.
    f.name === 'wonenBijHero'
      ? { ...f, description: 'Het grote beeld bovenaan de projectpagina van wonen bij.' }
      : f
  )
const gedeeldeVelden = fields
  .filter((f) => GEDEELD.has(f.name))
  .map((f) => ({
    ...f,
    group: 'wonenbij',
    fieldset: 'gedeeld',
    description: f.description ? `${f.description} ${LET_OP}` : LET_OP,
  }))
const mailVelden = fields
  .filter((f) => GEDEELD_MAIL.has(f.name))
  .map((f) => ({ ...f, group: 'wonenbij' }))
// De rest blijft in het schema (anders meldt de Studio onbekende velden),
// maar onzichtbaar en zonder tab.
const verborgenVelden = fields
  .filter(
    (f) => f.group !== 'wonenbij' && !GEDEELD.has(f.name) && !GEDEELD_MAIL.has(f.name)
  )
  .map((f) => ({ ...f, group: undefined, fieldset: undefined, hidden: true }))

export const projectWonenBij = {
  ...project,
  groups: [{ name: 'wonenbij', title: 'Wonen bij pagina', default: true }],
  fieldsets: [
    {
      name: 'gedeeld',
      title: 'Gedeeld met weverskade.com',
      description:
        'Deze velden staan op beide websites. Een wijziging hier zie je ook direct op weverskade.com.',
      options: { collapsible: true, collapsed: true },
    },
    ...(project.fieldsets ?? []).map((fs) =>
      fs.name === 'autoReply'
        ? {
            ...fs,
            title: 'Automatische bevestigingsmail (ook voor weverskade.com)',
            description:
              'De e-mail die iemand automatisch ontvangt na een inschrijving. Dezelfde mail gaat ook uit vanaf weverskade.com.',
          }
        : fs
    ),
  ],
  fields: [...wonenBijVelden, ...mailVelden, ...gedeeldeVelden, ...verborgenVelden],
} as typeof project

// Projecten die op wonen bij staan; zelfde voorwaarde als de wonen-bij queries.
const WOONPROJECTEN_FILTER =
  '_type == "project" && (wonenBijEnabled == true || showInWonen == true)'

export const wonenBijStructure: StructureResolver = (S) =>
  S.list()
    .title('Wonen bij')
    .items([
      S.listItem()
        .title('Wonen bij - startpagina')
        .child(S.document().schemaType('wonenBijLanding').documentId('wonenBijLanding')),
      S.listItem()
        .title('Woonprojecten')
        .schemaType('project')
        .child(
          S.documentList()
            .title('Woonprojecten')
            .schemaType('project')
            .apiVersion(apiVersion)
            .filter(WOONPROJECTEN_FILTER)
            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
            // Geen nieuwe projecten vanuit hier: elk project verschijnt
            // ook in de portefeuille van weverskade.com.
            .initialValueTemplates([])
        ),
    ])
