// Vult de auto-reply (bevestigingsmail) velden voor op de Wonen bij-pagina en
// op elke projectpagina. Non-destructief: setIfMissing overschrijft geen
// bestaande tekst, dus dit kan veilig opnieuw worden gedraaid.
//
// Run: node --env-file=.env.local scripts/seed-autoreply.mjs
import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'trx6ryh3'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN

if (!token) {
  console.error('Ontbrekend: SANITY_API_WRITE_TOKEN (of SANITY_WRITE_TOKEN).')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ─── Algemene Wonen bij-pagina (en fallback voor projecten) ───
const wonenBijDefaults = {
  autoReplyEnabled: true,
  autoReplySubject: 'Bedankt voor je interesse in Wonen bij Weverskade',
  autoReplyBody:
    'Beste lezer,\n\nHartelijk dank voor je inschrijving en interesse in een van onze huurwoningen. Wij hebben je bericht in goede orde ontvangen.\n\nNaar verwachting volgt er aan het einde van de zomer meer informatie. Zodra dit bekend is, nemen wij contact met je op.\n\nHartelijke groet,\nTeam Weverskade',
}

await client.createIfNotExists({ _id: 'wonenBijPage', _type: 'wonenBijPage' })
await client.patch('wonenBijPage').setIfMissing(wonenBijDefaults).commit()
console.log('✓ wonenBijPage auto-reply velden gevuld')

// ─── Per project een eigen, voorgevulde tekst (met projectnaam) ───
const projects = await client.fetch(`*[_type == "project"]{ _id, name }`)

for (const project of projects) {
  const name = project.name || 'dit project'
  const defaults = {
    autoReplyEnabled: true,
    autoReplySubject: `Bedankt voor je interesse in ${name}`,
    autoReplyBody: `Beste lezer,\n\nHartelijk dank voor je inschrijving en interesse in ${name}. Wij hebben je bericht in goede orde ontvangen.\n\nNaar verwachting volgt er voor dit project aan het einde van de zomer meer informatie. Zodra dit bekend is, nemen wij contact met je op.\n\nHartelijke groet,\nTeam Weverskade`,
  }
  await client.patch(project._id).setIfMissing(defaults).commit()
  console.log(`✓ ${name}`)
}

console.log(`Klaar: ${projects.length} project(en) voorgevuld.`)
