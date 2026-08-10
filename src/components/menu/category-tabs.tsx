'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/product'

export function CategoryTabs({
  categories,
  active
}: {
  categories: Category[]
  active?: string
}) {
  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-ink/8 bg-[var(--background)]/95 px-4 py-3 backdrop-blur-md sm:top-16 sm:mx-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none lg:top-[76px]">
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href="/menu"
          className={cn(
            'shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition sm:px-4',
            !active
              ? 'bg-brand text-white shadow-sm'
              : 'bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink hover:ring-brand/30'
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/menu?category=${c.slug}`}
            className={cn(
              'shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition sm:px-4',
              active === c.slug
                ? 'bg-brand text-white shadow-sm'
                : 'bg-white text-ink/70 ring-1 ring-ink/10 hover:text-ink hover:ring-brand/30'
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
