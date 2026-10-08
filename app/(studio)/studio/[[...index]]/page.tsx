'use client'

import { useSyncExternalStore } from 'react'
import { NextStudio } from 'next-sanity/studio'
import { createConfig } from '@/sanity.config'
import { isWonenBijStudio } from '@/sanity/wonenBijStudio'

const volledig = createConfig({ wonenBij: false })
const wonenBij = createConfig({ wonenBij: true })

const geenAbonnement = () => () => {}

export default function StudioPage() {
  // De modus hangt aan de host, dus pas in de browser bekend.
  const hostname = useSyncExternalStore(
    geenAbonnement,
    () => window.location.hostname,
    () => null
  )
  if (hostname === null) return null
  return <NextStudio config={isWonenBijStudio(hostname) ? wonenBij : volledig} />
}
