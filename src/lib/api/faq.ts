import { getPayload } from '@/lib/payload'

const DEFAULT_LOCALE = 'pl'

export async function getFaqPageSettings(locale: string = DEFAULT_LOCALE) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'pages',
    where: { pageType: { equals: 'faq' } },
    locale: locale as 'pl' | 'en' | 'de',
    limit: 1,
    depth: 0,
  })
  return result.docs[0] ?? null
}

export async function getFaqCategories(locale: string = DEFAULT_LOCALE) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'faq-categories',
    locale: locale as 'pl' | 'en' | 'de',
    limit: 100,
    sort: 'sortOrder',
    depth: 0,
  })
  return result.docs
}
