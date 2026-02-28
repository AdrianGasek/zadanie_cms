import type { NextRequest } from 'next/server'
import { getPostsList } from '@/lib/api/news'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number(searchParams.get('page')) || 1
    const limit = Math.min(Number(searchParams.get('limit')) || 12, 50)
    const category = searchParams.get('category') ?? undefined
    const locale = searchParams.get('locale') ?? 'pl'

    const result = await getPostsList({ locale, page, limit, category })
    return Response.json(result, { status: 200 })
  } catch (e) {
    console.error(e)
    return Response.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
