import { NextResponse } from 'next/server'
import {
  getOnlineOrderByLookup,
  toCustomerTrackStatus
} from '@/lib/online-orders/store'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || searchParams.get('id') || '').trim()
    if (q.length < 3) {
      return NextResponse.json({ error: 'Order number required' }, { status: 400 })
    }

    const order = await getOnlineOrderByLookup(q)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const trackStatus = toCustomerTrackStatus(order)

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        type: order.type,
        status: trackStatus,
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        estimatedMinutes: order.estimatedMinutes,
        scheduledFor: order.scheduledFor,
        kitchenStatus: order.kitchenStatus,
        riderStatus: order.riderStatus,
        updatedAt: order.updatedAt,
        live: true
      }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
