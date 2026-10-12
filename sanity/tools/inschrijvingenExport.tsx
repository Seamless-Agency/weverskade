import { useEffect, useMemo, useState } from 'react'
import { definePlugin, useClient } from 'sanity'
import { DownloadIcon } from '@sanity/icons'
import { Box, Button, Card, Container, Flex, Heading, Select, Stack, Text, TextInput } from '@sanity/ui'

/* Studio-tool "Inschrijvingen exporteren" (wens Vivianne, 12-10-2026):
   alle formulierinzendingen staan als formSubmission in Sanity. Deze tool
   filtert op formulier, project en periode en downloadt een Excel-bestand
   (.xlsx) met kopregel die blijft staan, filters op elke kolom en echte
   datums. Kolommen die voor de selectie overal leeg zijn, vallen weg.
   De data komt via de ingelogde Studio-gebruiker; er is geen API-route of
   token voor nodig. ExcelJS laadt pas bij de klik op downloaden. */

const API_VERSION = '2024-01-01'

const FORMULIEREN = [
  { value: 'wonenbij_inschrijving', title: 'Inschrijving op een woning (wonen bij)' },
  { value: 'wonen_bij', title: 'Contactformulier startpagina wonen bij' },
  { value: 'gebouw_wonen', title: 'Woningen beschikbaar (gebouwpagina weverskade.com)' },
  { value: 'contact', title: 'Contactpagina weverskade.com' },
  { value: 'woningzoeker', title: 'Woningzoeker (oud)' },
  { value: 'alle', title: 'Alle formulieren' },
]

const STATUS: Record<string, string> = { new: 'Nieuw', contacted: 'Opgevolgd', closed: 'Afgerond' }

type Inzending = Record<string, unknown> & { submittedAt?: string; _createdAt: string }

const KOLOMMEN: { key: string; titel: string; breedte: number }[] = [
  { key: 'submittedAt', titel: 'Ingezonden op', breedte: 18 },
  { key: 'name', titel: 'Naam', breedte: 24 },
  { key: 'email', titel: 'E-mail', breedte: 30 },
  { key: 'phone', titel: 'Telefoon', breedte: 15 },
  { key: 'projectName', titel: 'Project', breedte: 18 },
  { key: 'interestedProject', titel: '1e voorkeur', breedte: 30 },
  { key: 'secondChoice', titel: '2e voorkeur', breedte: 30 },
  { key: 'age', titel: 'Leeftijd', breedte: 9 },
  { key: 'occupation', titel: 'Werkgever / beroep', breedte: 28 },
  { key: 'householdIncome', titel: 'Bruto huishoudinkomen', breedte: 22 },
  { key: 'householdComposition', titel: 'Gezinssamenstelling', breedte: 22 },
  { key: 'message', titel: 'Vraag / opmerking', breedte: 45 },
  { key: 'agreed', titel: 'Akkoord voorwaarden', breedte: 12 },
  { key: 'status', titel: 'Status', breedte: 11 },
  { key: 'sourceLabel', titel: 'Formulier', breedte: 30 },
  { key: 'pageUrl', titel: 'Pagina', breedte: 40 },
]

function waarde(rij: Inzending, key: string): string | number | Date | null {
  const v = rij[key]
  if (key === 'submittedAt') {
    // Excel kent geen tijdzones: schrijf de Nederlandse kloktijd weg.
    const d = new Date(String(v ?? rij._createdAt))
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  }
  if (key === 'agreed') return v ? 'Ja' : 'Nee'
  if (key === 'status') return STATUS[String(v)] ?? (v ? String(v) : null)
  if (key === 'age') {
    const n = Number(v)
    return v !== undefined && v !== '' && Number.isFinite(n) ? n : v ? String(v) : null
  }
  if (v === undefined || v === null || v === '') return null
  return String(v)
}

function vandaag() {
  return new Date().toISOString().slice(0, 10)
}

function InschrijvingenExport() {
  const client = useClient({ apiVersion: API_VERSION })
  const [formulier, setFormulier] = useState('wonenbij_inschrijving')
  const [project, setProject] = useState('')
  const [van, setVan] = useState('')
  const [tot, setTot] = useState('')
  const [projecten, setProjecten] = useState<string[]>([])
  const [aantal, setAantal] = useState<number | null>(null)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')

  const filter = useMemo(() => {
    const delen = ['_type == "formSubmission"']
    if (formulier !== 'alle') delen.push('formType == $formulier')
    if (project) delen.push('projectName == $project')
    if (van) delen.push('coalesce(submittedAt, _createdAt) >= $van')
    if (tot) delen.push('coalesce(submittedAt, _createdAt) < $tot')
    return delen.join(' && ')
  }, [formulier, project, van, tot])

  const params = useMemo(() => {
    // Datums zijn Nederlandse kalenderdagen; "tot en met" telt de hele dag mee.
    const p: Record<string, string> = { formulier, project }
    if (van) p.van = new Date(`${van}T00:00:00`).toISOString()
    if (tot) {
      const eind = new Date(`${tot}T00:00:00`)
      eind.setDate(eind.getDate() + 1)
      p.tot = eind.toISOString()
    }
    return p
  }, [formulier, project, van, tot])

  useEffect(() => {
    let weg = false
    client
      .fetch<string[]>(
        `array::unique(*[_type == "formSubmission" && ($formulier == "alle" || formType == $formulier) && defined(projectName) && projectName != ""].projectName)`,
        { formulier }
      )
      .then((lijst) => {
        if (!weg) setProjecten([...lijst].sort((a, b) => a.localeCompare(b, 'nl')))
      })
      .catch(() => {})
    return () => {
      weg = true
    }
  }, [client, formulier])

  useEffect(() => {
    let weg = false
    setAantal(null)
    client
      .fetch<number>(`count(*[${filter}])`, params)
      .then((n) => {
        if (!weg) setAantal(n)
      })
      .catch(() => {})
    return () => {
      weg = true
    }
  }, [client, filter, params])

  async function download() {
    setBezig(true)
    setFout('')
    try {
      const rijen = await client.fetch<Inzending[]>(
        `*[${filter}] | order(coalesce(submittedAt, _createdAt) asc)`,
        params
      )
      const ExcelJS = (await import('exceljs')).default
      const boek = new ExcelJS.Workbook()
      boek.creator = 'Weverskade Studio'
      const blad = boek.addWorksheet('Inschrijvingen', {
        views: [{ state: 'frozen', ySplit: 1 }],
      })
      // Alleen kolommen met minstens één waarde in deze selectie.
      const kolommen = KOLOMMEN.filter(
        (k) => k.key === 'submittedAt' || k.key === 'name' || rijen.some((r) => waarde(r, k.key) !== null)
      )
      blad.columns = kolommen.map((k) => ({ header: k.titel, key: k.key, width: k.breedte }))
      for (const r of rijen) {
        blad.addRow(Object.fromEntries(kolommen.map((k) => [k.key, waarde(r, k.key)])))
      }
      blad.getColumn('submittedAt').numFmt = 'dd-mm-yyyy hh:mm'
      const kop = blad.getRow(1)
      kop.font = { bold: true }
      kop.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEBE4' } }
      blad.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: kolommen.length } }
      blad.eachRow((rij) => {
        rij.alignment = { vertical: 'top', wrapText: true }
      })

      const buffer = await boek.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const naamDelen = ['inschrijvingen', project || (formulier === 'alle' ? 'alle-formulieren' : formulier), vandaag()]
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${naamDelen.join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '-')}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(a.href), 5000)
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'Downloaden mislukt')
    } finally {
      setBezig(false)
    }
  }

  return (
    <Container width={1} padding={4} paddingTop={5}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={3}>Inschrijvingen exporteren</Heading>
          <Text muted size={2}>
            Download de formulierinzendingen als Excel-bestand om te filteren en te selecteren.
          </Text>
        </Stack>

        <Card padding={4} radius={3} border>
          <Stack space={4}>
            <Stack space={2}>
              <Text size={1} weight="semibold">Formulier</Text>
              <Select value={formulier} onChange={(e) => { setFormulier(e.currentTarget.value); setProject('') }}>
                {FORMULIEREN.map((f) => (
                  <option key={f.value} value={f.value}>{f.title}</option>
                ))}
              </Select>
            </Stack>
            {projecten.length ? (
              <Stack space={2}>
                <Text size={1} weight="semibold">Project</Text>
                <Select value={project} onChange={(e) => setProject(e.currentTarget.value)}>
                  <option value="">Alle projecten</option>
                  {projecten.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </Stack>
            ) : null}
            <Flex gap={3}>
              <Box flex={1}>
                <Stack space={2}>
                  <Text size={1} weight="semibold">Vanaf (optioneel)</Text>
                  <TextInput type="date" value={van} onChange={(e) => setVan(e.currentTarget.value)} />
                </Stack>
              </Box>
              <Box flex={1}>
                <Stack space={2}>
                  <Text size={1} weight="semibold">Tot en met (optioneel)</Text>
                  <TextInput type="date" value={tot} onChange={(e) => setTot(e.currentTarget.value)} />
                </Stack>
              </Box>
            </Flex>
          </Stack>
        </Card>

        <Flex align="center" justify="space-between" gap={3}>
          <Text size={2}>
            {aantal === null ? 'Tellen…' : `${aantal} ${aantal === 1 ? 'inzending' : 'inzendingen'}`}
          </Text>
          <Button
            icon={DownloadIcon}
            text={bezig ? 'Bezig…' : 'Download Excel'}
            tone="primary"
            disabled={bezig || !aantal}
            onClick={download}
          />
        </Flex>
        {fout ? (
          <Card padding={3} radius={2} tone="critical">
            <Text size={1}>{fout}</Text>
          </Card>
        ) : null}

        <Text muted size={1}>
          Let op: het bestand bevat persoonsgegevens, waaronder inkomen. Bewaar het veilig en verwijder
          het na de selectie.
        </Text>
      </Stack>
    </Container>
  )
}

export const inschrijvingenExport = definePlugin({
  name: 'inschrijvingen-export',
  tools: [
    {
      name: 'inschrijvingen',
      title: 'Inschrijvingen',
      icon: DownloadIcon,
      component: InschrijvingenExport,
    },
  ],
})
