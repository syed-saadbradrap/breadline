'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Category } from '@/types/product'
import { FoodImage } from '@/components/ui/food-image'

export function CategoryCard({ category }: { category: Category }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Link
        href={`/menu?category=${category.slug}`}
        className="group block overflow-hidden rounded-3xl border border-ink/5 bg-white shadow-sm"
      >
        <FoodImage src={category.image} alt={category.name} className="aspect-[5/4]" />
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand">
              {category.name}
            </h3>
            <p className="text-sm text-ink/55">{category.description}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
