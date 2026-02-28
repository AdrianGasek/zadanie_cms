import type { NextRequest } from 'next/server'
import { getFaqCategories } from '@/lib/api/faq'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale') ?? 'pl'
    const categories = await getFaqCategories(locale)
    return Response.json(categories, { status: 200 })
  } catch (e) {
    console.error(e)
    return Response.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
