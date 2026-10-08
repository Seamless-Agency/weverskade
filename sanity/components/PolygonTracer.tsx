import { useCallback, useMemo, useRef, useState } from 'react'
import { set, unset, useFormValue, type ArrayOfObjectsInputProps } from 'sanity'
import { urlFor } from '../lib/image'

/**
 * PolygonTracer — het overtrekgereedschap voor de woningzoeker.
 *
 * De redactie ziet de render van het gebouw en klikt de omtrek van één woning
 * aan. De punten worden genormaliseerd (0–1) opgeslagen, dus onafhankelijk van
 * de afmetingen van de render: dezelfde polygoon werkt op mobiel, desktop en
 * bij een vervangen (maar identiek uitgesneden) render.
 *
 * Dit is de kern van het kostenmodel: overtrekken is éénmalig werk per woning,
 * daarna hoeft alleen de status nog te wisselen.
 */

const STATUS_KLEUR: Record<string, string> = {
  beschikbaar: '#848F71',
  'in-optie': '#9A755D',
  bezet: '#717F8B',
  zone: '#F7F5F0',
}

interface PuntWaarde {
  _key: string
  _type?: string
  x?: number
  y?: number
}

function nieuweKey(): string {
  return Math.random().toString(36).slice(2, 12)
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function afronden(value: number): number {
  return Math.round(value * 10000) / 10000
}

/* Studio-neutrale opmaak — bewust zonder @sanity/ui, zodat dit onderdeel
   geen extra dependency nodig heeft. */
const NOTITIE_STIJL: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 4,
  border: '1px solid rgba(29,31,26,0.15)',
  background: 'rgba(132,143,113,0.08)',
  font: '13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: '#1D1F1A',
}

function KnopStijl(disabled: boolean, kritiek = false): React.CSSProperties {
  return {
    padding: '7px 12px',
    borderRadius: 4,
    border: '1px solid rgba(29,31,26,0.2)',
    background: 'transparent',
    color: kritiek ? '#9A2B2B' : '#1D1F1A',
    font: '13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
  }
}

export default function PolygonTracer(props: ArrayOfObjectsInputProps) {
  const { value, onChange, path, readOnly } = props

  const punten = useMemo(
    () =>
      ((value ?? []) as PuntWaarde[]).filter(
        (p) => typeof p?.x === 'number' && typeof p?.y === 'number'
      ),
    [value]
  )

  // De polygoon kan op twee plekken leven: direct onder het project
  // (woningen[] op de losse render) of genest in een aanzicht
  // (aanzichten[]. woningen[] / zones[]). De render en de context-vlakken
  // komen dan van dat aanzicht in plaats van het project.
  const projectRender = useFormValue(['woningzoekerRender']) as
    | { asset?: { _ref?: string } }
    | undefined
  const projectWoningen = useFormValue(['woningen']) as
    | Array<{ _key: string; nummer?: string; status?: string; polygon?: PuntWaarde[] }>
    | undefined
  const alleAanzichten = useFormValue(['aanzichten']) as
    | Array<{
        _key: string
        render?: { asset?: { _ref?: string } }
        woningen?: Array<{ _key: string; nummer?: string; status?: string; polygon?: PuntWaarde[] }>
        zones?: Array<{ _key: string; label?: string; polygon?: PuntWaarde[] }>
      }>
    | undefined

  const aanzichtKey = useMemo(() => {
    if (path[0] !== 'aanzichten') return null
    const segment = path[1]
    return typeof segment === 'object' && segment !== null && '_key' in segment
      ? (segment as { _key: string })._key
      : null
  }, [path])

  const aanzicht = aanzichtKey
    ? alleAanzichten?.find((a) => a._key === aanzichtKey)
    : undefined

  const render = aanzicht ? aanzicht.render : projectRender

  // Eigen _key = de diepste _key in het pad (bij een aanzicht is de eerste
  // _key die van het aanzicht zelf, niet van deze woning/zone).
  const eigenKey = useMemo(() => {
    const segment = [...path]
      .reverse()
      .find(
        (p): p is { _key: string } =>
          typeof p === 'object' && p !== null && '_key' in p
      )
    return segment?._key
  }, [path])

  const contextWoningen = aanzicht ? aanzicht.woningen : projectWoningen
  const contextZones = aanzicht?.zones

  const buren = useMemo(() => {
    const heeftVlak = (p?: PuntWaarde[]) =>
      Array.isArray(p) && p.filter((pt) => typeof pt?.x === 'number').length >= 3
    return [
      ...(contextWoningen ?? []).filter(
        (w) => w._key !== eigenKey && heeftVlak(w.polygon)
      ),
      ...(contextZones ?? [])
        .filter((z) => z._key !== eigenKey && heeftVlak(z.polygon))
        .map((z) => ({ _key: z._key, status: 'zone', polygon: z.polygon })),
    ]
  }, [contextWoningen, contextZones, eigenKey])

  const containerRef = useRef<HTMLDivElement>(null)
  const [sleeptIndex, setSleeptIndex] = useState<number | null>(null)

  const renderUrl = render?.asset?._ref ? urlFor(render).width(1600).url() : null

  const naarGenormaliseerd = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return null
    return {
      x: afronden(clamp01((clientX - rect.left) / rect.width)),
      y: afronden(clamp01((clientY - rect.top) / rect.height)),
    }
  }, [])

  const schrijf = useCallback(
    (volgende: PuntWaarde[]) => {
      onChange(volgende.length === 0 ? unset() : set(volgende))
    },
    [onChange]
  )

  const voegPuntToe = useCallback(
    (event: React.MouseEvent) => {
      if (readOnly) return
      const punt = naarGenormaliseerd(event.clientX, event.clientY)
      if (!punt) return
      schrijf([
        ...punten,
        { _key: nieuweKey(), _type: 'polygonPoint', x: punt.x, y: punt.y },
      ])
    },
    [naarGenormaliseerd, punten, readOnly, schrijf]
  )

  const verplaatsPunt = useCallback(
    (index: number, clientX: number, clientY: number) => {
      const punt = naarGenormaliseerd(clientX, clientY)
      if (!punt) return
      const volgende = punten.map((p, i) =>
        i === index ? { ...p, x: punt.x, y: punt.y } : p
      )
      schrijf(volgende)
    },
    [naarGenormaliseerd, punten, schrijf]
  )

  const verwijderPunt = useCallback(
    (index: number) => {
      schrijf(punten.filter((_, i) => i !== index))
    },
    [punten, schrijf]
  )

  const puntenAttr = punten.map((p) => `${p.x! * 100},${p.y! * 100}`).join(' ')
  const isGesloten = punten.length >= 3

  if (!renderUrl) {
    return (
      <div style={{ ...NOTITIE_STIJL, background: 'rgba(154,117,93,0.12)' }}>
        Upload eerst een render — bij een aanzicht het veld{' '}
        <strong>Render / foto</strong> van dat aanzicht, anders{' '}
        <strong>Woningzoeker → Render van het gebouw</strong>. Daarna kun je hier
        de omtrek overtrekken.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={NOTITIE_STIJL}>
        {punten.length === 0
          ? 'Klik op de render om de hoekpunten van deze woning aan te klikken. Vanaf 3 punten ontstaat een vlak.'
          : `${punten.length} ${punten.length === 1 ? 'punt' : 'punten'} — sleep een punt om bij te stellen, dubbelklik erop om het te verwijderen.`}
      </div>

      <div
        style={{
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(29,31,26,0.2)',
        }}
      >
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            userSelect: 'none',
            touchAction: 'none',
            cursor: readOnly ? 'default' : 'crosshair',
            background: '#1D1F1A',
          }}
          onMouseMove={(event) => {
            if (sleeptIndex === null) return
            verplaatsPunt(sleeptIndex, event.clientX, event.clientY)
          }}
          onMouseUp={() => setSleeptIndex(null)}
          onMouseLeave={() => setSleeptIndex(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={renderUrl}
            alt="Render van het gebouw"
            style={{ display: 'block', width: '100%', height: 'auto' }}
            draggable={false}
          />

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
            onClick={voegPuntToe}
          >
            {/* Al getekende buren — context, niet aanklikbaar. */}
            {buren.map((buur) => (
              <polygon
                key={buur._key}
                points={buur
                  .polygon!.filter((p) => typeof p?.x === 'number')
                  .map((p) => `${p.x! * 100},${p.y! * 100}`)
                  .join(' ')}
                fill={STATUS_KLEUR[buur.status ?? 'beschikbaar'] ?? '#848F71'}
                fillOpacity={0.18}
                stroke="#F7F5F0"
                strokeOpacity={0.35}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                style={{ pointerEvents: 'none' }}
              />
            ))}

            {/* Deze woning. */}
            {punten.length >= 2 ? (
              isGesloten ? (
                <polygon
                  points={puntenAttr}
                  fill="#F7F5F0"
                  fillOpacity={0.32}
                  stroke="#F7F5F0"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <polyline
                  points={puntenAttr}
                  fill="none"
                  stroke="#F7F5F0"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                  style={{ pointerEvents: 'none' }}
                />
              )
            ) : null}
          </svg>

          {/* Sleeppunten als HTML, zodat ze rond blijven ongeacht de
              beeldverhouding van de render. */}
          {punten.map((punt, index) => (
            <div
              key={punt._key}
              role="button"
              tabIndex={readOnly ? -1 : 0}
              aria-label={`Punt ${index + 1}`}
              onMouseDown={(event) => {
                if (readOnly) return
                event.stopPropagation()
                event.preventDefault()
                setSleeptIndex(index)
              }}
              onDoubleClick={(event) => {
                if (readOnly) return
                event.stopPropagation()
                verwijderPunt(index)
              }}
              style={{
                position: 'absolute',
                left: `${punt.x! * 100}%`,
                top: `${punt.y! * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: sleeptIndex === index ? '#848F71' : '#F7F5F0',
                border: '2px solid #1D1F1A',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                cursor: readOnly ? 'default' : 'grab',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={readOnly || punten.length === 0}
          style={KnopStijl(Boolean(readOnly) || punten.length === 0)}
          onClick={() => schrijf(punten.slice(0, -1))}
        >
          Laatste punt terug
        </button>
        <button
          type="button"
          disabled={readOnly || punten.length === 0}
          style={KnopStijl(Boolean(readOnly) || punten.length === 0, true)}
          onClick={() => schrijf([])}
        >
          Alles wissen
        </button>
        <span
          style={{
            marginLeft: 'auto',
            font: '13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            color: 'rgba(29,31,26,0.55)',
          }}
        >
          {isGesloten
            ? 'Vlak compleet'
            : `Nog ${3 - punten.length} ${3 - punten.length === 1 ? 'punt' : 'punten'} nodig`}
        </span>
      </div>
    </div>
  )
}
