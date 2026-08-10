'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { CheckCircle2, X } from 'lucide-react'
import type { Order } from '@/types/order'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/utils'

export function OrderSuccessPopup({
  order,
  open,
  onOpenChange
}: {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[min(440px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" />

          <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:px-6 sm:pt-6">
            <div className="min-w-0">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <Dialog.Title className="font-display text-3xl tracking-[0.03em] text-ink">
                Order placed!
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink/60">
                Here’s what you ordered — #{order.orderNumber}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-ink/45 transition hover:bg-ink/5 hover:text-ink"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 flex-1 overflow-auto overscroll-contain px-5 pb-2 sm:px-6">
            <ul className="space-y-2">
              {order.items.map((item, i) => (
                <li
                  key={`${item.name}-${i}`}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-muted px-3.5 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {item.quantity}× {item.name}
                    </p>
                    {item.modifiers.length > 0 && (
                      <p className="mt-0.5 text-xs text-ink/50">{item.modifiers.join(', ')}</p>
                    )}
                    {item.note && (
                      <p className="mt-0.5 text-xs italic text-ink/45">Note: {item.note}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold text-ink">
                    {formatMoney(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1.5 border-t border-ink/8 pt-3 text-sm text-ink/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{formatMoney(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatMoney(order.tax)}</span>
              </div>
              <div className="flex justify-between pt-1 font-display text-xl font-bold text-ink">
                <span>Total</span>
                <span className="text-brand">{formatMoney(order.total)}</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-ink/50">
              Estimated {order.type === 'delivery' ? 'delivery' : 'pickup'}: ~
              {order.estimatedMinutes} mins
            </p>
          </div>

          <div className="grid gap-2 border-t border-ink/8 px-5 py-4 sm:grid-cols-2 sm:px-6">
            <Button asChild>
              <Link href={`/track-order?id=${order.id}`} onClick={() => onOpenChange(false)}>
                Track order
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Dialog.Close>Got it</Dialog.Close>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
