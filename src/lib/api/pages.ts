import { getPayload } from '@/lib/payload'
import type {
  Page,
  PageTypeCollection,
} from '../../../payload-types'

const DEFAULT_LOCALE = 'pl'

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

/**
 * Rozwija doc.data gdy to tablica: jeden dokument z data = [row1, row2, ...]
 * zwraca wiele pozycji (po jednej karcie na froncie na każdy row).
 * definitionFields może zawierać type i fields (zagnieżdżenie) do wzbogacania obrazów.
 */
async function expandCustomEntryDocs(
  docs: { data?: Record<string, unknown> | Record<string, unknown>[] }[],
  useAsTitle: string | undefined,
  definitionFields: Array<{ key?: string; label?: string; type?: string; fields?: DefinitionFieldShape[]; nestedFields?: DefinitionFieldShape[]; level3Fields?: DefinitionFieldShape[] }> | undefined,
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<unknown[]> {
  const result: unknown[] = []
  for (const doc of docs) {
    const d = doc.data
    const rows = Array.isArray(d)
      ? (d as Record<string, unknown>[]).filter((r) => r != null && typeof r === 'object' && !Array.isArray(r))
      : d != null && typeof d === 'object'
        ? [d as Record<string, unknown>]
        : []
    for (const row of rows) {
      const enrichedData = await enrichImageFieldsInData(row, definitionFields, payload)
      result.push({
        ...doc,
        data: enrichedData,
        _useAsTitle: useAsTitle,
        _definitionFields: definitionFields,
      })
    }
  }
  return result
}

/** Konfiguracja jednego wpisu z globala Page Type Collections. */
export type PageTypeCollectionEntry = NonNullable<PageTypeCollection['entries']>[number]

/** Dane kolekcji dołączane do strony – klucz = pageType z globala. */
export type PageCollectionData = Record<string, unknown[]>

export type PageWithData = {
  page: Page
  data?: PageCollectionData
}

/**
 * Pobiera konfigurację Page Type Collections z Payload (global).
 * Zwraca listę wpisów: pageType → collection, sort, limit, depth.
 */
export async function getPageTypeCollectionConfig(): Promise<PageTypeCollectionEntry[]> {
  const payload = await getPayload()
  const global = await payload.findGlobal({
    slug: 'page-type-collections',
    depth: 0,
  })
  const entries = (global as PageTypeCollection)?.entries ?? []
  return Array.isArray(entries) ? (entries as PageTypeCollectionEntry[]) : []
}

/**
 * Pobiera dane z kolekcji powiązanej z typem strony (pageType).
 * Konfiguracja (kolekcja, sort, limit, depth) pochodzi z globala Page Type Collections.
 * Dla kolekcji "custom-collection-entries" wymagane jest customCollectionDefinition w konfiguracji.
 */
export async function getDataFromCustomPage(
  pageType: string,
  locale: string = DEFAULT_LOCALE,
): Promise<PageCollectionData> {
  const configList = await getPageTypeCollectionConfig()
  const config = configList.find((e) => e.pageType === pageType)
  if (!config?.collection) return {}

  const payload = await getPayload()

  if (config.collection === 'custom-collection-entries') {
    const definitionId =
      typeof config.customCollectionDefinition === 'object' && config.customCollectionDefinition !== null
        ? (config.customCollectionDefinition as { id: number }).id
        : config.customCollectionDefinition
    if (definitionId == null) return {}

    const result = await payload.find({
      collection: 'custom-collection-entries',
      where: { customCollection: { equals: definitionId } },
      locale: locale as 'pl' | 'en' | 'de',
      limit: config.limit ?? 50,
      sort: config.sort ?? 'sortOrder',
      depth: 1,
    })

    const definition = result.docs[0]?.customCollection
    const useAsTitle =
      definition && typeof definition === 'object' && 'useAsTitle' in definition
        ? (definition as { useAsTitle?: string }).useAsTitle
        : undefined
    const definitionFields =
      definition && typeof definition === 'object' && 'fields' in definition
        ? (definition as { fields?: Array<{ key?: string; label?: string }> }).fields
        : undefined

    const docs = await expandCustomEntryDocs(
      result.docs as { data?: Record<string, unknown> | Record<string, unknown>[] }[],
      useAsTitle,
      definitionFields,
      payload,
    )
    return { [pageType]: docs }
  }

  if (config.collection?.startsWith('custom:')) {
    const definitionId = parseInt(config.collection.slice(7), 10)
    if (Number.isNaN(definitionId)) return {}

    const result = await payload.find({
      collection: 'custom-collection-entries',
      where: { customCollection: { equals: definitionId } },
      locale: locale as 'pl' | 'en' | 'de',
      limit: config.limit ?? 50,
      sort: config.sort ?? 'sortOrder',
      depth: 1,
    })

    const definition = result.docs[0]?.customCollection
    const useAsTitle =
      definition && typeof definition === 'object' && 'useAsTitle' in definition
        ? (definition as { useAsTitle?: string }).useAsTitle
        : undefined
    const definitionFields =
      definition && typeof definition === 'object' && 'fields' in definition
        ? (definition as { fields?: Array<{ key?: string; label?: string }> }).fields
        : undefined

    const docs = await expandCustomEntryDocs(
      result.docs as { data?: Record<string, unknown> | Record<string, unknown>[] }[],
      useAsTitle,
      definitionFields,
      payload,
    )
    return { [pageType]: docs }
  }

  const result = await payload.find({
    collection: config.collection as 'faq-categories' | 'integrations' | 'posts' | 'categories',
    locale: locale as 'pl' | 'en' | 'de',
    limit: config.limit ?? 50,
    sort: config.sort ?? 'sortOrder',
    depth: config.depth ?? 1,
  })

  const docs = result.docs as unknown[]
  return { [pageType]: docs }
}

/**
 * Zwraca listę wszystkich pageType z globala (do fallbacku po slug).
 */
export async function getValidPageTypes(): Promise<string[]> {
  const configList = await getPageTypeCollectionConfig()
  return configList.map((e) => e.pageType).filter(Boolean)
}

/**
 * Pobiera stronę z kolekcji Pages po pierwszym segmencie ścieżki (slug).
 * Dla stron z pageType zdefiniowanym w globalu Page Type Collections dołącza dane z powiązanej kolekcji w data.
 */
export async function getPageBySlug(
  slug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<PageWithData | null> {
  const normalizedSlug = slug.toLowerCase()
  const payload = await getPayload()
  const localeFilter = locale as 'pl' | 'en' | 'de'

  const bySlug = await payload.find({
    collection: 'pages',
    where: { slug: { equals: normalizedSlug } },
    locale: localeFilter,
    limit: 1,
    depth: 1,
  })
  let page = bySlug.docs[0] ?? null

  if (!page) {
    const validPageTypes = await getValidPageTypes()
    if (validPageTypes.includes(normalizedSlug)) {
      const byPageType = await payload.find({
        collection: 'pages',
        where: { pageType: { equals: normalizedSlug } },
        locale: localeFilter,
        limit: 1,
        depth: 1,
      })
      page = byPageType.docs[0] ?? null
    }
  }

  if (!page) return null

  const result: PageWithData = { page }
  const pageType = typeof page.pageType === 'string' ? page.pageType : String(page.pageType)

  const dataEntryId =
    page.dataEntry != null && typeof page.dataEntry === 'object' && 'id' in page.dataEntry
      ? (page.dataEntry as { id: number }).id
      : typeof page.dataEntry === 'number'
        ? page.dataEntry
        : null

  if (dataEntryId != null) {
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
      }))
    )
    result.data = { [pageType]: enrichedEntries }
  } else {
    const configList = await getPageTypeCollectionConfig()
    const hasConfig = configList.some((e) => e.pageType === pageType)
    if (hasConfig) {
      result.data = await getDataFromCustomPage(pageType, locale)
    }
  }

  return result
}
