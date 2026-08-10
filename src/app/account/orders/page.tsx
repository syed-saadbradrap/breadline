'use client'

import Link from 'next/link'
import { useOrderStore } from '@/store/order-store'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { getProductBySlug, products } from '@/data/products'
import { toast } from 'sonner'

export default function MyOrdersPage() {
  const orders = useOrderStore((s) => s.orders)
  const addItem = useCartStore((s) => s.addItem)

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold">My Orders</h1>
      <p className="mt-2 text-ink/60">Track, view and reorder your favorites.</p>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-3xl border border-ink/5 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold">{order.orderNumber}</h2>
                <p className="text-sm text-ink/50">
                  {new Date(order.createdAt).toLocaleString()} · {order.items.length} items
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-brand">{formatMoney(order.total)}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {order.status.replaceAll('_', ' ')}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink/60">
              {order.items.map((i) => `${i.quantity}× ${i.name}`).join(' · ')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/track-order?id=${order.id}`}>View Order</Link>
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  order.items.forEach((item) => {
                    const product =
                      products.find((p) => p.name === item.name) ||
                      getProductBySlug(item.name.toLowerCase().replace(/\s+/g, '-'))
                    if (product) addItem({ product, quantity: item.quantity })
                  })
                  toast.success('Items added to cart')
                }}
              >
                Reorder
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
