import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes, singletonTypes } from './sanity/schemas'
import { structure } from './sanity/desk'
import { projectWonenBij, wonenBijStructure } from './sanity/wonenBijStudio'
import { apiVersion, dataset, projectId } from './sanity/env'

// In de wonen-bij Studio alleen opslaan, publiceren en terugdraaien: een
// project verwijderen of depubliceren zou ook weverskade.com raken.
const BEPERKTE_ACTIES = ['publish', 'discardChanges', 'restore']

export function createConfig({ wonenBij }: { wonenBij: boolean }) {
  return defineConfig({
    name: 'weverskade',
    title: wonenBij ? 'Weverskade - Wonen bij (preview)' : 'Weverskade',
    projectId,
    dataset,
    basePath: '/studio',
    plugins: wonenBij
      ? [structureTool({ structure: wonenBijStructure })]
      : [
          structureTool({ structure }),
          visionTool({ defaultApiVersion: apiVersion }),
        ],
    schema: {
      types: wonenBij
        ? schemaTypes.map((type) => (type.name === 'project' ? projectWonenBij : type))
        : schemaTypes,
      templates: (templates) =>
        templates.filter(
          ({ schemaType }) =>
            !singletonTypes.has(schemaType) && (!wonenBij || schemaType !== 'project')
        ),
    },
    document: {
      actions: (input, context) =>
        singletonTypes.has(context.schemaType) ||
        (wonenBij && context.schemaType === 'project')
          ? input.filter(({ action }) => action && BEPERKTE_ACTIES.includes(action))
          : input,
    },
  })
}

export default createConfig({ wonenBij: false })
