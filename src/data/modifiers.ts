import type { Modifier } from '@/types/product'

export const modifiers: Modifier[] = [
  { id: 'extra-cheese', name: 'Extra Cheese', price: 50 },
  { id: 'extra-patty', name: 'Extra Patty', price: 120 },
  { id: 'mayo', name: 'Mayo', price: 0 },
  { id: 'garlic-mayo', name: 'Garlic Mayo', price: 20 },
  { id: 'spicy-sauce', name: 'Spicy Sauce', price: 20 },
  { id: 'ketchup', name: 'Ketchup', price: 0 }
]

export function getModifierById(id: string) {
  return modifiers.find((m) => m.id === id)
}

export function getModifiersByIds(ids: string[] = []) {
  return ids.map(getModifierById).filter(Boolean) as Modifier[]
}
