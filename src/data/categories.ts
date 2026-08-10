import type { Category } from '@/types/product'

export const categories: Category[] = [
  {
    id: 'burgers',
    name: 'Burgers',
    slug: 'burgers',
    description: '4 crispy classics from the grill',
    image: '/images/products/zinger-burger.png'
  },
  {
    id: 'premium',
    name: 'Premium Menu',
    slug: 'premium-menu',
    description: '7 signature Breadline favorites',
    image: '/images/products/special-zinger.png'
  },
  {
    id: 'sandwiches',
    name: 'Sandwiches',
    slug: 'sandwiches',
    description: '3 toasted & packed with flavor',
    image: '/images/products/club-sandwich.png'
  },
  {
    id: 'wraps',
    name: 'Wraps',
    slug: 'wraps',
    description: '3 rolled, spicy, satisfying',
    image: '/images/products/zinger-wrap.png'
  },
  {
    id: 'fries',
    name: 'Fries',
    slug: 'fries',
    description: '4 crispy sides you’ll crave',
    image: '/images/products/loaded-fries.png'
  },
  {
    id: 'addons',
    name: 'Add Ons',
    slug: 'add-ons',
    description: 'Wings & chicken strips',
    image: '/images/products/wings.png'
  }
]

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug)
}
