import { getPayload } from '@/lib/payload'

const DEFAULT_LOCALE = 'pl'

export async function getIntegrationsPageSettings(locale: string = DEFAULT_LOCALE) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'pages',
    where: { pageType: { equals: 'integrations' } },
    locale: locale as 'pl' | 'en' | 'de',
    limit: 1,
    depth: 0,
  })
  return result.docs[0] ?? null
}

export type IntegrationsListParams = {
  locale?: string
  search?: string
}

export async function getIntegrations({ locale = DEFAULT_LOCALE, search }: IntegrationsListParams = {}) {
  const payload = await getPayload()
  const where = search
    ? {
        or: [
          { name: { contains: search } },
          { shortDescription: { contains: search } },
        ],
      }
    : undefined
  const result = await payload.find({
    collection: 'integrations',
    locale: locale as 'pl' | 'en' | 'de',
    limit: 200,
    sort: 'sortOrder',
    where,
    depth: 1,
  })
  return result.docs
}
