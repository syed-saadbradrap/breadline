'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useCartStore, cartLineTotal } from '@/store/cart-store'
import { FoodImage } from '@/components/ui/food-image'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { formatMoney } from '@/lib/utils'
import { calcDeliveryFee, calcTax } from '@/lib/pricing'

export function CartDrawer({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotal = useCartStore((s) => s.subtotal())
  const delivery = calcDeliveryFee(subtotal, 'delivery')
  const tax = calcTax(subtotal)
  const total = subtotal + delivery + tax

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl focus:outline-none sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[min(420px,100vw)] sm:rounded-none">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" />
          <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 sm:px-5 sm:py-4">
            <Dialog.Title className="font-display text-xl tracking-[0.03em] sm:text-2xl">
              Your Cart
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-xl p-2 hover:bg-muted" aria-label="Close cart">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 space-y-3 overflow-auto overscroll-contain p-3 sm:p-4">
            {!items.length && (
              <div className="rounded-2xl border border-dashed border-ink/15 p-8 text-center">
                <p className="font-semibold">Your cart is empty</p>
                <p className="mt-1 text-sm text-ink/55">Add something crispy from the menu.</p>
                <Dialog.Close asChild>
                  <Button asChild className="mt-4">
                    <Link href="/menu">Explore Menu</Link>
                  </Button>
                </Dialog.Close>
              </div>
            )}
            {items.map((item) => (
              <div key={item.key} className="flex gap-3 rounded-2xl border border-ink/5 p-3">
                <FoodImage src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{item.name}</div>
                      {item.modifiers.length > 0 && (
                        <div className="line-clamp-1 text-xs text-ink/50">
                          {item.modifiers.map((m) => m.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <button
                      className="shrink-0 text-xs font-semibold text-brand"
                      onClick={() => removeItem(item.key)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(v) => setQuantity(item.key, v)}
                      min={0}
                    />
                    <span className="shrink-0 font-bold text-brand">
                      {formatMoney(cartLineTotal(item))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="border-t border-ink/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5">
              <div className="space-y-1 text-sm">
                <Row label="Subtotal" value={formatMoney(subtotal)} />
                <Row label="Delivery" value={formatMoney(delivery)} />
                <Row label="Tax" value={formatMoney(tax)} />
                <div className="flex justify-between pt-2 font-display text-lg tracking-[0.02em]">
                  <span>Total</span>
                  <span className="text-brand">{formatMoney(total)}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <Dialog.Close asChild>
                  <Button asChild>
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button asChild variant="outline">
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </Dialog.Close>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink/70">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
