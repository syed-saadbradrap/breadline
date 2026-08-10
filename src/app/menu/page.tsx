import type { Metadata } from 'next'
import { categories } from '@/data/categories'
import { products, getProductsByCategory } from '@/data/products'
import { CategoryTabs } from '@/components/menu/category-tabs'
import { ProductGrid } from '@/components/menu/product-grid'

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Browse the full Breadline menu — burgers, premium plates, sandwiches, wraps, fries and add ons.',
  alternates: { canonical: '/menu' }
}

export default async function MenuPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const active = params.category
  const category = categories.find((c) => c.slug === active)
  const list = category ? getProductsByCategory(category.id) : products

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mb-5 max-w-2xl sm:mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand">Order online</p>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,8vw,4.5rem)] leading-[0.95] tracking-[0.03em] text-ink">
          {category ? category.name.toUpperCase() : 'THE MENU'}
        </h1>
        <p className="mt-2 text-sm text-ink/60 sm:mt-3 sm:text-base">
          {category
            ? category.description
            : 'Burgers, premium plates, sandwiches, wraps, fries and add-ons — all made fresh.'}
        </p>
      </div>
      <CategoryTabs categories={categories} active={active} />
      <div className="mt-5 sm:mt-8">
        <ProductGrid products={list} />
      </div>
    </div>
  )
}
