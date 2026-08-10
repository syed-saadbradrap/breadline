'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Product } from '@/types/product'
import { getModifiersByIds } from '@/data/modifiers'
import { FoodImage } from '@/components/ui/food-image'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { Textarea } from '@/components/ui/textarea'
import { formatMoney } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'

export function ProductDetailClient({ product }: { product: Product }) {
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
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <div className="min-w-0">
        <FoodImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/3] rounded-2xl sm:rounded-[2rem]"
          priority
        />
        <div className="mt-5 sm:mt-6">
          <h1 className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-[0.95] tracking-[0.03em] text-ink">
            {product.name}
          </h1>
          <p className="mt-3 text-sm text-ink/60 sm:text-base">{product.description}</p>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <p className="font-display text-3xl tracking-[0.02em] text-brand">
              {formatMoney(product.price)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-base font-medium text-ink/40 line-through sm:text-lg">
                {formatMoney(product.compareAtPrice)}
              </p>
            )}
          </div>
        </div>

        {mods.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-xl tracking-[0.04em]">Optional add-ons</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {mods.map((m) => {
                const active = selected.includes(m.id)
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m.id)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active ? 'border-brand bg-brand/5 text-brand' : 'border-ink/10 bg-white'
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
        )}

        <div className="mt-6 pb-28 lg:pb-0">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/55">
            Special instructions
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any special requests?"
          />
        </div>
      </div>

      {/* Desktop sticky summary */}
      <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-sm">
          <h3 className="font-display text-2xl tracking-[0.03em]">Order summary</h3>
          <div className="mt-4 space-y-2 text-sm text-ink/70">
            <div className="flex justify-between gap-3">
              <span className="min-w-0 truncate">{product.name}</span>
              <span className="shrink-0">{formatMoney(product.price)}</span>
            </div>
            {mods
              .filter((m) => selected.includes(m.id))
              .map((m) => (
                <div key={m.id} className="flex justify-between">
                  <span>+ {m.name}</span>
                  <span>{formatMoney(m.price)}</span>
                </div>
              ))}
            <div className="flex justify-between">
              <span>Quantity</span>
              <span>× {qty}</span>
            </div>
          </div>
          <div className="mt-5">
            <QuantitySelector value={qty} onChange={setQty} />
          </div>
          <Button className="mt-5 w-full" size="lg" onClick={add}>
            Add to Cart · {formatMoney(total)}
          </Button>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link href="/menu">Back to menu</Link>
          </Button>
        </div>
      </aside>

      {/* Mobile sticky add bar */}
      <div className="fixed inset-x-0 bottom-[3.75rem] z-30 border-t border-ink/10 bg-white/95 px-4 py-3 backdrop-blur md:bottom-0 lg:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <QuantitySelector value={qty} onChange={setQty} />
          <Button className="min-w-0 flex-1" size="lg" onClick={add}>
            <span className="truncate">Add · {formatMoney(total)}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
