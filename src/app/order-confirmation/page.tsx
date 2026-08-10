'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useOrderStore } from '@/store/order-store'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/utils'

function ConfirmationContent() {
  const params = useSearchParams()
  const id = params.get('id')
  const order = useOrderStore((s) => (id ? s.getOrder(id) : s.orders[0]))

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">No order found</h1>
        <Button asChild className="mt-6">
          <Link href="/menu">Continue shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-[2rem] border border-ink/5 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Success</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold text-ink">Order Confirmed!</h1>
        <p className="mt-2 text-ink/60">
          Order <span className="font-bold text-ink">{order.orderNumber}</span>
        </p>
        <p className="mt-1 text-sm text-ink/50">
          Estimated {order.type === 'delivery' ? 'delivery' : 'pickup'}: ~{order.estimatedMinutes} mins
        </p>

        <div className="mt-8 space-y-2 text-left text-sm">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between rounded-2xl bg-muted px-4 py-3">
              <span>
                {item.quantity}× {item.name}
              </span>
              <span className="font-semibold">{formatMoney(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-1 text-left text-sm text-ink/70">
          <Row label="Subtotal" value={formatMoney(order.subtotal)} />
          <Row label="Delivery fee" value={formatMoney(order.deliveryFee)} />
          <Row label="Tax" value={formatMoney(order.tax)} />
          <div className="flex justify-between pt-2 font-display text-xl font-bold text-ink">
            <span>Total</span>
            <span className="text-brand">{formatMoney(order.total)}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link href={`/track-order?id=${order.id}`}>Track Order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/menu">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
