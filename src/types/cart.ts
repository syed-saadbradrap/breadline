export interface CartModifier {
  id: string
  name: string
  price: number
}

export interface CartItem {
  key: string
  productId: string
  slug: string
  name: string
  image: string
  unitPrice: number
  quantity: number
  modifiers: CartModifier[]
  note?: string
}
