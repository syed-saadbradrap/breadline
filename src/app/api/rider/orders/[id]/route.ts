import { NextResponse } from 'next/server'
import { assertRiderPin, updateRiderStatus } from '@/lib/online-orders/store'
import type { RiderDeliveryStatus } from '@/lib/online-orders/types'

export const runtime = 'nodejs'

const ALLOWED: RiderDeliveryStatus[] = ['ready', 'out_for_delivery', 'delivered']

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    assertRiderPin(request)
    const { id } = await context.params
    const body = (await request.json()) as { riderStatus?: string }
    const riderStatus = body.riderStatus as RiderDeliveryStatus
    if (!ALLOWED.includes(riderStatus)) {
      return NextResponse.json({ error: 'Invalid riderStatus' }, { status: 400 })
    }
    const order = await updateRiderStatus(id, riderStatus)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ order })
  } catch (error) {
    const status = (error as Error & { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status })
  }
}
