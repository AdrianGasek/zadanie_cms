import type { NextRequest } from 'next/server'
import { getFaqPageSettings } from '@/lib/api/faq'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale') ?? 'pl'
    const settings = await getFaqPageSettings(locale)
    return Response.json(settings, { status: 200 })
  } catch (e) {
    console.error(e)
    return Response.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
