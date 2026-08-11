import { NextResponse } from 'next/server'
import { assertRiderPin, listRiderOrders } from '@/lib/online-orders/store'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    assertRiderPin(request)
    const orders = await listRiderOrders({ includeDelivered: true })
    return NextResponse.json({ orders })
  } catch (error) {
    const status = (error as Error & { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status })
  }
}
