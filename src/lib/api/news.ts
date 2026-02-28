import { getPayload } from '@/lib/payload'

const DEFAULT_LOCALE = 'pl'

export async function getNewsPageSettings(locale: string = DEFAULT_LOCALE) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'news' } },
    locale: locale as 'pl' | 'en' | 'de',
    limit: 1,
    depth: 0,
  })
  return result.docs[0] ?? null
}

export async function getNavigation(locale: string = DEFAULT_LOCALE) {
  const payload = await getPayload()
  const global = await payload.findGlobal({
    slug: 'navigation',
    locale: locale as 'pl' | 'en' | 'de',
  })
  return global
}

export async function getFooter(locale: string = DEFAULT_LOCALE) {
  const payload = await getPayload()
  const global = await payload.findGlobal({
    slug: 'footer',
    locale: locale as 'pl' | 'en' | 'de',
  })
  return global
}

export async function getCategories(locale: string = DEFAULT_LOCALE) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'categories',
    locale: locale as 'pl' | 'en' | 'de',
    limit: 100,
    sort: 'name',
  })
  return result.docs
}

export type PostsListParams = {
  locale?: string
  page?: number
  limit?: number
  category?: string
}

export async function getPostsList({
  locale = DEFAULT_LOCALE,
  page = 1,
  limit = 12,
  category,
}: PostsListParams = {}) {
  const payload = await getPayload()
  const where = category ? { categories: { contains: category } } : undefined
  const result = await payload.find({
    collection: 'posts',
    locale: locale as 'pl' | 'en' | 'de',
    page,
    limit,
    where,
    sort: '-publishedAt',
    depth: 1,
  })
  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  }
}

export async function getPostBySlug(slug: string, locale: string = DEFAULT_LOCALE) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    locale: locale as 'pl' | 'en' | 'de',
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export async function getReadMorePosts(
  excludeSlug: string,
  limit: number = 6,
  locale: string = DEFAULT_LOCALE
) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'posts',
    where: { slug: { not_equals: excludeSlug } },
    locale: locale as 'pl' | 'en' | 'de',
    limit,
    sort: '-publishedAt',
    depth: 1,
  })
  return result.docs
}
