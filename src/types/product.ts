export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
}

export interface Modifier {
  id: string
  name: string
  price: number
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  /** Current selling price (Rs.) */
  price: number
  /** Original price before deal, if any */
  compareAtPrice?: number
  categoryId: string
  image: string
  bestSeller?: boolean
  modifiers?: string[]
}
