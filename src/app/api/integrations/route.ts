import type { NextRequest } from 'next/server'
import { getIntegrations } from '@/lib/api/integrations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale') ?? 'pl'
    const search = request.nextUrl.searchParams.get('search') ?? undefined
    const integrations = await getIntegrations({ locale, search })
    return Response.json(integrations, { status: 200 })
  } catch (e) {
    console.error(e)
    return Response.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
