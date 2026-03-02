import { getPayload } from '@/lib/payload'
import { normalizeLocale } from '@/lib/i18n/config'
import type { Page } from '../../../payload-types'

type DefinitionFieldShape = { key?: string; type?: string; fields?: DefinitionFieldShape[]; nestedFields?: DefinitionFieldShape[]; level3Fields?: DefinitionFieldShape[] }

/**
 * Rekurencyjnie wzbogaca pola typu image w data – zamienia id (number) na { id, url }.
 */
async function enrichImageFieldsInData(
  data: Record<string, unknown>,
  definitionFields: DefinitionFieldShape[] | undefined,
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Record<string, unknown>> {
  if (!definitionFields?.length) return data
  const result = { ...data }
  for (const f of definitionFields) {
    const key = f.key
    if (!key || !(key in result)) continue
    const val = result[key]
    if (f.type === 'image' && typeof val === 'number') {
      try {
        const media = await payload.findByID({ collection: 'media', id: val, depth: 0 })
        const url = (media as { url?: string })?.url
        if (url) result[key] = { id: val, url }
      } catch {
        result[key] = { id: val, url: null }
      }
      continue
    }
    if (f.type === 'group' && val != null && typeof val === 'object' && !Array.isArray(val) && (Array.isArray(f.fields) || Array.isArray(f.nestedFields) || Array.isArray(f.level3Fields))) {
      result[key] = await enrichImageFieldsInData(val as Record<string, unknown>, f.fields ?? f.nestedFields ?? f.level3Fields ?? [], payload)
    }
  }
  return result
}

/** Dane z kolekcji dołączane do strony – klucz to slug strony lub 'entries'. */
export type PageCollectionData = Record<string, unknown[]>

export type PageWithData = {
  page: Page
  data?: PageCollectionData
}

type DataSourceBlock =
  | { blockType: 'customDataset'; key: string; entry: number | { id: number } }
  | { blockType: 'posts'; key: string; limit?: number | null }
  | { blockType: 'integrations'; key: string; limit?: number | null }
  | { blockType: 'faqCategories'; key: string; limit?: number | null }

/**
 * Pobiera stronę z kolekcji Pages po slug.
 * Źródła danych są konfigurowane w polu dataSources (wiele sekcji). Jeśli puste, fallback do legacy dataEntry.
 */
export async function getPageBySlug(
  slug: string,
  locale: string = 'pl',
): Promise<PageWithData | null> {
  const normalizedSlug = slug.toLowerCase()
  const payload = await getPayload()
  const localeFilter = normalizeLocale(locale) as 'pl' | 'en' | 'de'

  const bySlug = await payload.find({
    collection: 'pages',
    where: { slug: { equals: normalizedSlug } },
    locale: localeFilter,
    limit: 1,
    depth: 1,
  })
  const page = bySlug.docs[0] ?? null
  if (!page) return null

  const result: PageWithData = { page }

  const sourcesRaw = (page as unknown as { dataSources?: unknown }).dataSources
  const sources = Array.isArray(sourcesRaw) ? (sourcesRaw as DataSourceBlock[]) : []
  if (sources.length > 0) {
    const data: PageCollectionData = {}

    for (const src of sources) {
      const key = typeof src?.key === 'string' && src.key.length > 0 ? src.key : undefined
      if (!key) continue

      if (src.blockType === 'customDataset') {
        const entryId =
          src.entry != null && typeof src.entry === 'object' && 'id' in src.entry
            ? (src.entry as { id: number }).id
            : typeof src.entry === 'number'
              ? src.entry
              : null
        if (entryId == null) continue

        const entryDoc = await payload.findByID({
          collection: 'custom-collection-entries',
          id: entryId,
          locale: localeFilter,
          depth: 1,
        })
        const definition =
          entryDoc?.customCollection && typeof entryDoc.customCollection === 'object'
            ? entryDoc.customCollection
            : null
        const useAsTitle =
          definition && typeof definition === 'object' && 'useAsTitle' in definition
            ? (definition as { useAsTitle?: string }).useAsTitle
            : undefined
        const definitionFields =
          definition && typeof definition === 'object' && 'fields' in definition
            ? (definition as { fields?: DefinitionFieldShape[] }).fields
            : undefined
        const rawData = (entryDoc as { data?: Record<string, unknown> | Record<string, unknown>[] }).data
        const rows = Array.isArray(rawData)
          ? rawData.filter((r): r is Record<string, unknown> => r != null && typeof r === 'object' && !Array.isArray(r))
          : rawData != null && typeof rawData === 'object'
            ? [rawData as Record<string, unknown>]
            : []
        const enrichedEntries = await Promise.all(
          rows.map(async (row) => ({
            ...entryDoc,
            data: await enrichImageFieldsInData(row, definitionFields, payload),
            _useAsTitle: useAsTitle,
            _definitionFields: definitionFields,
          })),
        )

        data[key] = enrichedEntries
        continue
      }

      if (src.blockType === 'posts') {
        const limit = typeof src.limit === 'number' && src.limit > 0 ? src.limit : 12
        const posts = await payload.find({
          collection: 'posts',
          locale: localeFilter,
          limit,
          sort: '-publishedAt',
          depth: 1,
        })
        data[key] = posts.docs as unknown[]
        continue
      }

      if (src.blockType === 'integrations') {
        const limit = typeof src.limit === 'number' && src.limit > 0 ? src.limit : 200
        const integrations = await payload.find({
          collection: 'integrations',
          locale: localeFilter,
          limit,
          sort: 'sortOrder',
          depth: 1,
        })
        data[key] = integrations.docs as unknown[]
        continue
      }

      if (src.blockType === 'faqCategories') {
        const limit = typeof src.limit === 'number' && src.limit > 0 ? src.limit : 100
        const categories = await payload.find({
          collection: 'faq-categories',
          locale: localeFilter,
          limit,
          sort: 'sortOrder',
          depth: 1,
        })
        data[key] = categories.docs as unknown[]
        continue
      }
    }

    if (Object.keys(data).length > 0) result.data = data
    return result
  }

  const dataEntryId =
    page.dataEntry != null && typeof page.dataEntry === 'object' && 'id' in page.dataEntry
      ? (page.dataEntry as { id: number }).id
      : typeof page.dataEntry === 'number'
        ? page.dataEntry
        : null

  if (dataEntryId == null) return result

  const entryDoc = await payload.findByID({
    collection: 'custom-collection-entries',
    id: dataEntryId,
    locale: localeFilter,
    depth: 1,
  })
  const definition =
    entryDoc?.customCollection && typeof entryDoc.customCollection === 'object'
      ? entryDoc.customCollection
      : null
  const useAsTitle =
    definition && typeof definition === 'object' && 'useAsTitle' in definition
      ? (definition as { useAsTitle?: string }).useAsTitle
      : undefined
  const definitionFields =
    definition && typeof definition === 'object' && 'fields' in definition
      ? (definition as { fields?: DefinitionFieldShape[] }).fields
      : undefined
  const rawData = (entryDoc as { data?: Record<string, unknown> | Record<string, unknown>[] }).data
  const rows = Array.isArray(rawData)
    ? rawData.filter((r): r is Record<string, unknown> => r != null && typeof r === 'object' && !Array.isArray(r))
    : rawData != null && typeof rawData === 'object'
      ? [rawData as Record<string, unknown>]
      : []
  const enrichedEntries = await Promise.all(
    rows.map(async (row) => ({
      ...entryDoc,
      data: await enrichImageFieldsInData(row, definitionFields, payload),
      _useAsTitle: useAsTitle,
      _definitionFields: definitionFields,
    })),
  )
  const dataKey = page.slug ?? 'entries'
  result.data = { [dataKey]: enrichedEntries }

  return result
}

/**
 * Pobiera wszystkie slugi stron z kolekcji Pages (dla generateStaticParams).
 * Zwraca tylko dokumenty z ustawionym slugiem.
 */
export async function getAllPageSlugs(): Promise<string[]> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'pages',
    limit: 500,
    depth: 0,
    select: { slug: true },
    locale: 'pl',
  })
  return result.docs
    .map((doc) => doc.slug)
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
}
