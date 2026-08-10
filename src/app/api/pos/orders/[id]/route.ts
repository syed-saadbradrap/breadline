import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertPosKey, updateOnlineOrder } from '@/lib/online-orders/store'

export const runtime = 'nodejs'

const patchSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'cancelled']),
  posOrderNumber: z.string().max(40).optional(),
  posOrderId: z.number().int().optional()
})

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertPosKey(request)
    const { id } = await context.params
    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const updated = await updateOnlineOrder(id, parsed.data)
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ order: updated })
  } catch (error) {
    const status = (error as Error & { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status })
  }
}
