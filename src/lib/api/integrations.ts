import { getPayload } from '@/lib/payload'

const DEFAULT_LOCALE = 'pl'

export type IntegrationsListParams = {
  locale?: string
  search?: string
}

export async function getIntegrations({ locale = DEFAULT_LOCALE, search }: IntegrationsListParams = {}) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'integrations',
    locale: locale as 'pl' | 'en' | 'de',
    limit: 200,
    sort: 'sortOrder',
    ...(search && {
      where: {
        or: [
          { name: { contains: search } },
          { shortDescription: { contains: search } },
        ],
      },
    }),
    depth: 1,
  })
  return result.docs
}
