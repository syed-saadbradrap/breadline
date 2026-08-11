'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { searchProducts } from '@/data/products'
import { formatMoney } from '@/lib/utils'
import { FoodImage } from '@/components/ui/food-image'

export function SearchModal({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [q, setQ] = useState('')
  const results = useMemo(() => searchProducts(q).slice(0, 8), [q])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setQ('')
        onOpenChange(next)
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1200] bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[1200] flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white p-4 shadow-2xl focus:outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-[10%] sm:max-h-[min(70vh,640px)] sm:w-[min(640px,92vw)] sm:-translate-x-1/2 sm:rounded-3xl sm:p-5">
          <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" />
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg tracking-[0.03em] sm:text-xl">
              Search menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-xl p-2 hover:bg-muted" aria-label="Close search">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search zinger, fries, wrap..."
              className="h-12 w-full rounded-2xl border border-ink/10 bg-muted/40 pl-10 pr-4 text-sm outline-none ring-brand/30 focus:border-brand focus:ring-2"
            />
          </div>
          <div className="mt-4 max-h-[55vh] space-y-2 overflow-auto overscroll-contain pb-[env(safe-area-inset-bottom)] sm:max-h-none sm:flex-1">
            {!q && <p className="p-3 text-sm text-ink/50">Try “zinger”, “fries”, or “wrap”.</p>}
            {q && !results.length && (
              <p className="p-3 text-sm text-ink/50">No matches for “{q}”.</p>
            )}
            {results.map((p) => (
              <Dialog.Close key={p.id} asChild>
                <Link
                  href={`/menu/${p.slug}`}
                  className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-muted"
                >
                  <FoodImage src={p.image} alt={p.name} className="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-sm text-brand">{formatMoney(p.price)}</div>
                  </div>
                </Link>
              </Dialog.Close>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
