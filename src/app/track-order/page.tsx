'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import { useOrderStore } from '@/store/order-store'
import { OrderTimeline } from '@/components/order/order-timeline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatMoney } from '@/lib/utils'
import type { Order, OrderStatus, OrderType } from '@/types/order'

type TrackOrder = {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus | 'cancelled'
  items: Order['items']
  total: number
  estimatedMinutes?: number
  scheduledFor?: string
  live?: boolean
  updatedAt?: string
}

function TrackContent() {
  const params = useSearchParams()
  const id = params.get('id')
  const getOrder = useOrderStore((s) => s.getOrder)
  const getByNumber = useOrderStore((s) => s.getOrderByNumber)
  const [query, setQuery] = useState('')
  const [lookup, setLookup] = useState(id || '')
  const [order, setOrder] = useState<TrackOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (key: string) => {
    if (!key.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(key.trim())}`, {
        cache: 'no-store'
      })
      if (res.ok) {
        const data = (await res.json()) as { order: TrackOrder }
        setOrder(data.order)
        return
      }

      // Fallback: same-device local order (just placed)
      const local = getOrder(key) || getByNumber(key.toUpperCase())
      if (local) {
        setOrder({
          id: local.id,
          orderNumber: local.orderNumber,
          type: local.type,
          status: local.status,
          items: local.items,
          total: local.total,
          estimatedMinutes: local.estimatedMinutes,
          scheduledFor: local.scheduledFor,
          live: false
        })
        return
      }

      setOrder(null)
      setError(res.status === 404 ? 'Order not found' : 'Could not load order')
    } catch {
      setOrder(null)
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }, [getOrder, getByNumber])

  useEffect(() => {
    if (!lookup) return
    void load(lookup)
  }, [lookup, load])

  useEffect(() => {
    if (!lookup || !order?.live) return
    const id = window.setInterval(() => void load(lookup), 12000)
    return () => window.clearInterval(id)
  }, [lookup, order?.live, load])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold">Track Order</h1>
      <p className="mt-2 text-ink/60">
        Enter your order number — status updates live from the kitchen &amp; rider.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. BL-10241"
          aria-label="Order number"
          onKeyDown={(e) => {
            if (e.key === 'Enter') setLookup(query.trim())
          }}
        />
        <Button
          onClick={() => setLookup(query.trim())}
          disabled={loading || query.trim().length < 3}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Track'}
        </Button>
      </div>

      {loading && !order ? (
        <p className="mt-8 text-center text-sm text-ink/50">Loading order…</p>
      ) : null}

      {order ? (
        <div className="mt-8 grid gap-6 rounded-[2rem] border border-ink/5 bg-white p-6 shadow-sm lg:grid-cols-2">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-ink/50">Order</div>
                <div className="font-display text-2xl font-bold">{order.orderNumber}</div>
                <div className="mt-1 text-sm capitalize text-ink/60">
                  {order.type} · {formatMoney(order.total)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void load(lookup)}
                className="rounded-full p-2 text-ink/40 hover:bg-muted hover:text-ink"
                aria-label="Refresh status"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {order.status === 'cancelled' ? (
              <p className="mt-6 rounded-2xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-dark">
                This order was cancelled or rejected.
              </p>
            ) : (
              <div className="mt-6">
                <OrderTimeline status={order.status} type={order.type} />
              </div>
            )}

            {order.scheduledFor ? (
              <p className="mt-4 text-xs font-medium text-ink/55">
                Scheduled for{' '}
                {new Date(order.scheduledFor).toLocaleString('en-PK', {
                  timeZone: 'Asia/Karachi',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            ) : null}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Items</h3>
            <div className="mt-3 space-y-2 text-sm">
              {order.items.map((item, i) => (
                <div key={i} className="rounded-2xl bg-muted px-4 py-3">
                  {item.quantity}× {item.name}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink/45">
              {order.live
                ? 'Live status — refreshes automatically every few seconds.'
                : 'Showing saved order on this device. Open with your order number for live kitchen updates.'}
            </p>
          </div>
        </div>
      ) : (
        lookup &&
        !loading && (
          <p className="mt-8 rounded-3xl border border-dashed border-ink/15 p-8 text-center text-ink/55">
            {error || `No order found for “${lookup}”.`} Check the number from your confirmation
            email / SMS.
          </p>
        )
      )}
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <TrackContent />
    </Suspense>
  )
}
