import { getPayload } from '@/lib/payload'
import type { Page } from '../../../payload-types'

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

/** Dane z kolekcji dołączane do strony – klucz to slug strony lub 'entries'. */
export type PageCollectionData = Record<string, unknown[]>

export type PageWithData = {
  page: Page
  data?: PageCollectionData
}

/**
 * Pobiera stronę z kolekcji Pages po slug.
 * Gdy strona ma ustawiony Wpis danych (dataEntry), dołącza dane z tego wpisu do result.data.
 * Pages powiązujemy tylko z kolekcjami danych (Custom Collection Entries).
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
  const page = bySlug.docs[0] ?? null
  if (!page) return null

  const result: PageWithData = { page }

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
