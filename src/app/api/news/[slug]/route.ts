import type { NextRequest } from 'next/server'
import { getPostBySlug } from '@/lib/api/news'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    if (!slug) {
      return Response.json(
        { error: 'Missing slug', code: 'BAD_REQUEST' },
        { status: 400 }
      )
    }
    const locale = _request.nextUrl.searchParams.get('locale') ?? 'pl'
    const post = await getPostBySlug(slug, locale)
    if (!post) {
      return Response.json(
        { error: 'Post not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    return Response.json(post, { status: 200 })
  } catch (e) {
    console.error(e)
    return Response.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
