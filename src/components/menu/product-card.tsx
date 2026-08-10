'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Product } from '@/types/product'
import { FoodImage } from '@/components/ui/food-image'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { toast } from 'sonner'
import { useState } from 'react'
import { ProductModal } from './product-modal'

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [open, setOpen] = useState(false)
  const hasMods = (product.modifiers?.length || 0) > 0

  const quickAdd = () => {
    if (hasMods) {
      setOpen(true)
      return
    }
    addItem({ product })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_0_rgba(20,20,20,0.04),0_10px_28px_rgba(20,20,20,0.06)] ring-1 ring-ink/5 sm:rounded-2xl"
      >
        <Link
          href={`/menu/${product.slug}`}
          className="relative block aspect-[4/3] overflow-hidden bg-muted"
        >
          <FoodImage src={product.image} alt={product.name} className="h-full w-full" />
          {product.bestSeller && (
            <span className="absolute left-2 top-2 bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.18em]">
              Best
            </span>
          )}
        </Link>
        <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
          <div className="min-w-0">
            <Link
              href={`/menu/${product.slug}`}
              className="font-display text-lg leading-tight tracking-[0.03em] text-ink transition hover:text-brand sm:text-2xl"
            >
              {product.name}
            </Link>
            <p className="mt-1 line-clamp-2 hidden text-sm leading-relaxed text-ink/55 sm:block">
              {product.description}
            </p>
          </div>
          <div className="mt-auto flex items-end justify-between gap-2 border-t border-ink/5 pt-2 sm:gap-3 sm:pt-3">
            <div className="min-w-0">
              <span className="font-display text-lg tracking-[0.02em] text-brand sm:text-2xl">
                {formatMoney(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="ml-1.5 text-[10px] font-medium text-ink/35 line-through sm:ml-2 sm:text-xs">
                  {formatMoney(product.compareAtPrice)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={quickAdd}
              aria-label={`Add ${product.name}`}
              className="h-8 shrink-0 px-2.5 text-xs sm:h-9 sm:px-4"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Add
            </Button>
          </div>
        </div>
      </motion.article>
      <ProductModal product={product} open={open} onOpenChange={setOpen} />
    </>
  )
}
