'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useOrderStore } from '@/store/order-store'
import { OrderTimeline } from '@/components/order/order-timeline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatMoney } from '@/lib/utils'

function TrackContent() {
  const params = useSearchParams()
  const id = params.get('id')
  const getOrder = useOrderStore((s) => s.getOrder)
  const getByNumber = useOrderStore((s) => s.getOrderByNumber)
  const [query, setQuery] = useState('')
  const [lookup, setLookup] = useState(id || '')

  const order = useMemo(() => {
    if (!lookup) return undefined
    return getOrder(lookup) || getByNumber(lookup.toUpperCase())
  }, [lookup, getOrder, getByNumber])

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold">Track Order</h1>
      <p className="mt-2 text-ink/60">Enter your order number to see live status.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. BL-10241"
          aria-label="Order number"
        />
        <Button onClick={() => setLookup(query.trim())}>Track</Button>
      </div>

      {order ? (
        <div className="mt-8 grid gap-6 rounded-[2rem] border border-ink/5 bg-white p-6 shadow-sm lg:grid-cols-2">
          <div>
            <div className="text-sm text-ink/50">Order</div>
            <div className="font-display text-2xl font-bold">{order.orderNumber}</div>
            <div className="mt-1 text-sm capitalize text-ink/60">
              {order.type} · {formatMoney(order.total)}
            </div>
            <div className="mt-6">
              <OrderTimeline status={order.status} type={order.type} />
            </div>
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
              Demo status is stored locally and can later be replaced with a live API.
            </p>
          </div>
        </div>
      ) : (
        lookup && (
          <p className="mt-8 rounded-3xl border border-dashed border-ink/15 p-8 text-center text-ink/55">
            No order found for “{lookup}”. Try BL-10241 for a demo order.
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
