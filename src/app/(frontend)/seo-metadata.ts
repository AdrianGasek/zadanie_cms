import type { Metadata } from 'next'
import type { Page, Media } from '../../../payload-types'
import { DEFAULT_LOCALE } from '@/lib/i18n/config'

export const SITE_NAME = 'News CMS'
export { DEFAULT_LOCALE }

/** Zamienia ścieżkę lub względny URL na absolutny (używa NEXT_PUBLIC_SITE_URL). */
export function getAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return base ? `${base.replace(/\/$/, '')}${path}` : path
}

/** Zwraca absolutny URL obrazka OG z Page lub undefined, jeśli brak. */
export function getOgImageUrl(page: Page): string | undefined {
  const img = page.openGraphImage
  if (!img) return undefined
  const url = typeof img === 'object' && img !== null && 'url' in img ? (img as Media).url : null
  if (!url) return undefined
  return getAbsoluteUrl(url)
}

function getOgLocale(locale: string): string {
  switch (locale) {
    case 'pl': return 'pl_PL'
    case 'de': return 'de_DE'
    default: return 'en_US'
  }
}

export type BuildPageMetadataParams = {
  page: Page
  segment: string
  locale: string
}

/**
 * Buduje obiekt Metadata (Next.js) dla danej strony.
 * Używane przez generateMetadata w [[...slug]]/page.tsx.
 * Zawiera title, description, robots, canonical, Open Graph (Facebook/Instagram), Twitter Card.
 */
export function buildPageMetadata({ page, segment, locale }: BuildPageMetadataParams): Metadata {
  const title = page.metaTitle ?? page.title
  const description = page.metaDescription ?? page.shortDescription
  const ogImageUrl = getOgImageUrl(page)
  const canonical = page.canonicalUrl ? getAbsoluteUrl(page.canonicalUrl) : undefined
  const pageUrl = canonical ?? (
    typeof process.env.NEXT_PUBLIC_SITE_URL === 'string'
      ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/${segment}${locale !== DEFAULT_LOCALE ? `?locale=${locale}` : ''}`
      : undefined
  )
  const robots = page.noIndex ? { index: false, follow: true } : undefined

  return {
    title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
    description: description ?? undefined,
    robots,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: title ?? undefined,
      description: description ?? undefined,
      type: 'website',
      siteName: SITE_NAME,
      url: pageUrl,
      locale: getOgLocale(locale),
      ...(ogImageUrl && {
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title ?? '' }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? undefined,
      description: description ?? undefined,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  }
}
