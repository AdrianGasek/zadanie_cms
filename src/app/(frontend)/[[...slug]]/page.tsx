import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getPageBySlug, getAllPageSlugs } from '@/lib/api/pages'
import { PageContent } from '../components/PageContent'
import { normalizeLocale } from '@/lib/i18n/config'
import { pathWithLocale } from '@/lib/i18n/routes'
import {
  DEFAULT_LOCALE,
  SITE_NAME,
  buildPageMetadata,
} from '../seo-metadata'

type Props = {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{ locale?: string }>
}

export default async function DynamicPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { locale: localeParam } = await searchParams
  const locale = normalizeLocale(localeParam)

  const segment = slug?.[0]
  if (!segment) {
    redirect(pathWithLocale('/news', locale))
  }

  const result = await getPageBySlug(segment, locale)
  if (!result) notFound()

  const { page, data } = result

  return (
    <main data-view="dynamic-page">
      <PageContent page={page} data={data} locale={locale} />
    </main>
  )
}

/** Generuje ścieżki dla wszystkich stron z Pages (API Payload) przy buildzie (SSG). */
export async function generateStaticParams() {
  const slugs = await getAllPageSlugs()
  return slugs.map((slug) => ({ slug: [slug] }))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const { locale: localeParam } = await searchParams
  const locale = normalizeLocale(localeParam)
  const segment = slug?.[0]

  if (!segment) {
    return { title: SITE_NAME }
  }

  const result = await getPageBySlug(segment, locale)
  if (!result) {
    // Powinien być zaciągany domyślny tytuł strony z pliku constants.ts + przetłumaczony z pliku lang/x/translations.ts
    return { title: 'Nie znaleziono' }
  }

  return buildPageMetadata({ page: result.page, segment, locale })
}
