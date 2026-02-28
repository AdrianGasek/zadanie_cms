import type { NextRequest } from 'next/server'
import { getPageTypeCollectionConfig } from '@/lib/api/pages'

export const dynamic = 'force-dynamic'

/**
 * GET /api/page-types
 * Zwraca listę typów stron z globala Page Type Collections (do pola "Typ strony" w Stronach).
 * Zawsze zwraca { entries: [...] }, nawet gdy global nie był jeszcze zapisany.
 */
export async function GET(request: NextRequest) {
  try {
    const entries = await getPageTypeCollectionConfig()
    return Response.json({ entries }, { status: 200 })
  } catch (e) {
    console.error('[page-types]', e)
    return Response.json(
      { entries: [], error: 'Failed to load page types' },
      { status: 200 },
    )
  }
}
