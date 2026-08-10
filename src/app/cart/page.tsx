'use client'

import Link from 'next/link'
import { useCartStore, cartLineTotal } from '@/store/cart-store'
import { FoodImage } from '@/components/ui/food-image'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { CartSummary } from '@/components/cart/cart-summary'
import { EmptyState } from '@/components/ui/empty-state'
import { formatMoney } from '@/lib/utils'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven’t added anything yet. Explore the Breadline menu and build your feast."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
      <div className="min-w-0">
        <h1 className="font-display text-[clamp(2.25rem,6vw,3.5rem)] tracking-[0.03em]">
          Your Cart
        </h1>
        <div className="mt-5 space-y-3 sm:mt-6">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex gap-3 rounded-2xl border border-ink/5 bg-white p-3 sm:gap-4 sm:rounded-3xl sm:p-4"
            >
              <FoodImage
                src={item.image}
                alt={item.name}
                className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24 sm:rounded-2xl"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/menu/${item.slug}`}
                      className="font-display text-lg tracking-[0.02em] hover:text-brand sm:text-xl"
                    >
                      {item.name}
                    </Link>
                    {item.modifiers.length > 0 && (
                      <p className="line-clamp-1 text-xs text-ink/50 sm:text-sm">
                        {item.modifiers.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    {item.note && (
                      <p className="line-clamp-1 text-xs text-ink/45">Note: {item.note}</p>
                    )}
                  </div>
                  <button
                    className="shrink-0 text-xs font-semibold text-brand sm:text-sm"
                    onClick={() => removeItem(item.key)}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <QuantitySelector
                    value={item.quantity}
                    min={0}
                    onChange={(v) => setQuantity(item.key, v)}
                  />
                  <div className="text-right">
                    <div className="text-[11px] text-ink/45 sm:text-xs">
                      {formatMoney(item.unitPrice)} each
                    </div>
                    <div className="font-bold text-brand">{formatMoney(cartLineTotal(item))}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pb-4 lg:sticky lg:top-28 lg:self-start lg:space-y-4">
        <CartSummary />
        <Button asChild className="w-full" size="lg">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/menu">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}
