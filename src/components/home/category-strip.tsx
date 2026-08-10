'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/types/product'
import { Reveal } from '@/components/ui/reveal'

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <>
      {/* Mobile: horizontal snap strip */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/menu?category=${category.slug}`}
            className="group relative w-[78vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl bg-ink"
          >
            <div className="relative aspect-[5/3]">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="80vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-2xl tracking-[0.04em] text-white">{category.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-white/65">{category.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tablet / desktop grid */}
      <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, i) => (
          <Reveal key={category.id} delay={i * 0.05}>
            <Link
              href={`/menu?category=${category.slug}`}
              className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-ink"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="font-display text-3xl tracking-[0.04em] text-white sm:text-4xl">
                  {category.name}
                </p>
                <p className="mt-1 text-sm text-white/65">{category.description}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  )
}
