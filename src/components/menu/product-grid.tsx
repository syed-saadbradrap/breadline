import type { Product } from '@/types/product'
import { ProductCard } from './product-card'

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-sm text-ink/55 sm:rounded-3xl sm:p-10">
        No products found.
      </p>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
