import { NextResponse } from 'next/server'
import { assertPosKey, listOnlineOrders } from '@/lib/online-orders/store'
import type { OnlineOrderStatus } from '@/lib/online-orders/types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    assertPosKey(request)
    const { searchParams } = new URL(request.url)
    const status = (searchParams.get('status') || 'pending') as OnlineOrderStatus | 'all'
    const orders = await listOnlineOrders(status === 'all' ? undefined : status)
    return NextResponse.json({ orders })
  } catch (error) {
    const status = (error as Error & { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status })
  }
}
