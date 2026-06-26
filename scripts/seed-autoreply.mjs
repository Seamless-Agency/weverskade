// Vult de auto-reply (bevestigingsmail) velden op het bestaande wonenBijPage
// document. Non-destructief: setIfMissing overschrijft geen bestaande tekst.
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

const defaults = {
  autoReplyEnabled: true,
  autoReplySubject: 'Bedankt voor je interesse in Wonen bij Weverskade',
  autoReplyBody:
    'Beste lezer,\n\nHartelijk dank voor je inschrijving en interesse in een van onze huurwoningen. Wij hebben je bericht in goede orde ontvangen.\n\nNaar verwachting volgt er aan het einde van de zomer meer informatie. Zodra dit bekend is, nemen wij contact met je op.\n\nHartelijke groet,\nTeam Weverskade',
}

await client.createIfNotExists({ _id: 'wonenBijPage', _type: 'wonenBijPage' })
const result = await client.patch('wonenBijPage').setIfMissing(defaults).commit()

console.log('✓ wonenBijPage auto-reply velden gevuld:', result._id)
