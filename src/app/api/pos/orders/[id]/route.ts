import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  assertPosKey,
  updateKitchenProgress,
  updateOnlineOrder,
  updateRiderStatus
} from '@/lib/online-orders/store'

export const runtime = 'nodejs'

const patchSchema = z
  .object({
    status: z.enum(['pending', 'accepted', 'rejected', 'cancelled']).optional(),
    riderStatus: z.enum(['ready', 'out_for_delivery', 'delivered']).optional(),
    kitchenStatus: z.enum(['NEW', 'PREPARING', 'READY', 'COMPLETED']).optional(),
    posOrderNumber: z.string().max(40).optional(),
    posOrderId: z.number().int().optional()
  })
  .refine((d) => Boolean(d.status || d.riderStatus || d.kitchenStatus), {
    message: 'status, riderStatus, or kitchenStatus required'
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

    let order = null

    if (parsed.data.status) {
      order = await updateOnlineOrder(id, {
        status: parsed.data.status,
        posOrderNumber: parsed.data.posOrderNumber,
        posOrderId: parsed.data.posOrderId
      })
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
    }

    if (parsed.data.kitchenStatus) {
      order = await updateKitchenProgress(id, parsed.data.kitchenStatus)
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
    }

    if (parsed.data.riderStatus) {
      order = await updateRiderStatus(id, parsed.data.riderStatus)
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    const status = (error as Error & { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status })
  }
}
