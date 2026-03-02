import { getPayload } from '@/lib/payload'

const DEFAULT_LOCALE = 'pl'

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
