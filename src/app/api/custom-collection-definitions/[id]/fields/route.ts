import type { NextRequest } from 'next/server'
import { getPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * Zwraca pełną definicję (z tablicą fields) po ID.
 * Używane przez pole "Dane" w Custom Collection Entries, gdy relacja zwraca tylko { id, name }.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const idNum = parseInt(id, 10)
    if (Number.isNaN(idNum) || idNum < 1) {
      return Response.json({ errors: [{ message: 'Invalid id' }] }, { status: 400 })
    }
    const payload = await getPayload()
    const doc = await payload.findByID({
      collection: 'custom-collection-definitions',
      id: idNum,
      depth: 2,
    })
    if (!doc) {
      return Response.json({ errors: [{ message: 'Not found' }] }, { status: 404 })
    }
    return Response.json(doc, { status: 200 })
  } catch (e) {
    console.error('[definition-fields]', e)
    return Response.json(
      { errors: [{ message: 'Internal server error' }] },
      { status: 500 }
    )
  }
}
