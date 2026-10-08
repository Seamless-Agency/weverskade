import { urlFor } from './image'

export function sanityImageUrl(image: any, fallback: string): string {
  if (!image?.asset) return fallback
  return urlFor(image).format('webp').quality(90).url()
}

export function sanityImageUrlSized(image: any, fallback: string, width: number): string {
  if (!image?.asset) return fallback
  return urlFor(image).width(width).format('webp').quality(90).url()
}

/**
 * Build a responsive `src` + `srcSet` pair for an `<img>` tag. Generates
 * multiple widths so the browser can pick the smallest image that fits the
 * actual rendered size — critical for thumbnails (e.g. team grid cards), where
 * the source asset is often 5000+px wide but the display size is < 400px.
 */
export function sanityImageSrcSet(
  image: any,
  fallback: string,
  widths: number[] = [320, 480, 640, 800],
  quality = 75
): { src: string; srcSet?: string } {
  if (!image?.asset) return { src: fallback }
  const largest = widths[widths.length - 1]
  const src = urlFor(image).width(largest).format('webp').quality(quality).url()
  const srcSet = widths
    .map((w) => `${urlFor(image).width(w).format('webp').quality(quality).url()} ${w}w`)
    .join(', ')
  return { src, srcSet }
}

export function formatSanityDate(dateStr: string | undefined, fallback: string): string {
  if (!dateStr) return fallback
  const date = new Date(dateStr)
  const months = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december',
  ]
  // Nederlandse datumnotatie heeft geen komma voor het jaartal ("1 september
  // 2026", niet "1 september, 2026" — dat is de Engelse conventie).
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}
