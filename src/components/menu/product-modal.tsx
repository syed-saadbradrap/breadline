'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Product } from '@/types/product'
import { getModifiersByIds } from '@/data/modifiers'
import { FoodImage } from '@/components/ui/food-image'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { Textarea } from '@/components/ui/textarea'
import { formatMoney } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'sonner'

export function ProductModal({
  product,
  open,
  onOpenChange
}: {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mods = useMemo(() => getModifiersByIds(product.modifiers), [product.modifiers])
  const [selected, setSelected] = useState<string[]>([])
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const addItem = useCartStore((s) => s.addItem)

  const extras = mods.filter((m) => selected.includes(m.id)).reduce((s, m) => s + m.price, 0)
  const total = (product.price + extras) * qty

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const add = () => {
    addItem({
      product,
      quantity: qty,
      modifiers: mods.filter((m) => selected.includes(m.id)),
      note: note.trim() || undefined
    })
    toast.success(`${product.name} added to cart`)
    onOpenChange(false)
    setSelected([])
    setQty(1)
    setNote('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[90vh] sm:w-[min(560px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" />
          <div className="flex-1 overflow-auto overscroll-contain p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <Dialog.Title className="font-display text-2xl tracking-[0.03em] sm:text-3xl">
                {product.name}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-xl p-2 hover:bg-muted" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <FoodImage
              src={product.image}
              alt={product.name}
              className="mb-4 aspect-[16/10] rounded-2xl"
            />
            <p className="text-sm text-ink/60">{product.description}</p>
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-bold">Customize</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {mods.map((m) => {
                  const active = selected.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${
                        active
                          ? 'border-brand bg-brand/5 text-brand'
                          : 'border-ink/10 hover:border-ink/25'
                      }`}
                    >
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-xs opacity-70">
                        {m.price > 0 ? `+ ${formatMoney(m.price)}` : 'Free'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/55">
                Special instructions
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="No onions, extra spicy..."
              />
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-ink/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5">
            <QuantitySelector value={qty} onChange={setQty} />
            <Button onClick={add} className="min-w-0 flex-1">
              <span className="truncate">Add · {formatMoney(total)}</span>
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
