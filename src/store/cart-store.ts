'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartModifier } from '@/types/cart'
import type { Product } from '@/types/product'
import { products } from '@/data/products'
import { getModifierById } from '@/data/modifiers'
import { clampInt, sanitizeText } from '@/lib/sanitize'

const MAX_QTY = 20
const MAX_NOTE = 200
const MAX_LINES = 40

interface CartState {
  items: CartItem[]
  addItem: (input: {
    product: Product
    quantity?: number
    modifiers?: CartModifier[]
    note?: string
  }) => void
  removeItem: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  increase: (key: string) => void
  decrease: (key: string) => void
  clear: () => void
  itemCount: () => number
  subtotal: () => number
}

function itemKey(productId: string, modifiers: CartModifier[], note?: string) {
  const mod = modifiers
    .map((m) => m.id)
    .sort()
    .join(',')
  return `${productId}__${mod}__${note || ''}`
}

function lineUnit(item: CartItem) {
  return item.unitPrice + item.modifiers.reduce((s, m) => s + m.price, 0)
}

function resolveCatalogProduct(product: Product): Product | null {
  return products.find((p) => p.id === product.id || p.slug === product.slug) || null
}

function sanitizeModifiers(modifiers: CartModifier[], allowedIds: string[]): CartModifier[] {
  const allow = new Set(allowedIds)
  return modifiers
    .filter((m) => m && typeof m.id === 'string' && allow.has(m.id))
    .map((m) => {
      const catalogMod = getModifierById(m.id)
      if (!catalogMod) return null
      return {
        id: catalogMod.id,
        name: catalogMod.name,
        price: catalogMod.price
      }
    })
    .filter(Boolean)
    .slice(0, 12) as CartModifier[]
}

function sanitizeCartItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return []
  return items
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null
      const item = raw as CartItem
      const catalog = products.find((p) => p.id === item.productId || p.slug === item.slug)
      if (!catalog) return null
      const quantity = clampInt(item.quantity, 1, MAX_QTY, 1)
      const note = item.note ? sanitizeText(item.note, MAX_NOTE) : undefined
      const modifiers = sanitizeModifiers(
        Array.isArray(item.modifiers) ? item.modifiers : [],
        catalog.modifiers ?? []
      )
      const key = itemKey(catalog.id, modifiers, note)
      return {
        key,
        productId: catalog.id,
        slug: catalog.slug,
        name: catalog.name,
        image: catalog.image,
        unitPrice: catalog.price,
        quantity,
        modifiers,
        note
      } satisfies CartItem
    })
    .filter(Boolean)
    .slice(0, MAX_LINES) as CartItem[]
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: ({ product, quantity = 1, modifiers = [], note }) => {
        const catalog = resolveCatalogProduct(product)
        if (!catalog) return

        const cleanMods = sanitizeModifiers(modifiers, catalog.modifiers ?? [])
        const cleanNote = note ? sanitizeText(note, MAX_NOTE) : undefined
        const qty = clampInt(quantity, 1, MAX_QTY, 1)
        const key = itemKey(catalog.id, cleanMods, cleanNote)
        const existing = get().items.find((i) => i.key === key)

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key
                ? { ...i, quantity: clampInt(i.quantity + qty, 1, MAX_QTY, 1) }
                : i
            )
          })
          return
        }

        if (get().items.length >= MAX_LINES) return

        set({
          items: [
            ...get().items,
            {
              key,
              productId: catalog.id,
              slug: catalog.slug,
              name: catalog.name,
              image: catalog.image,
              unitPrice: catalog.price,
              quantity: qty,
              modifiers: cleanMods,
              note: cleanNote
            }
          ]
        })
      },
      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      setQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key)
          return
        }
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity: clampInt(quantity, 1, MAX_QTY, 1) } : i
          )
        })
      },
      increase: (key) => {
        set({
          items: get().items.map((i) =>
            i.key === key
              ? { ...i, quantity: clampInt(i.quantity + 1, 1, MAX_QTY, 1) }
              : i
          )
        })
      },
      decrease: (key) => {
        const item = get().items.find((i) => i.key === key)
        if (!item) return
        if (item.quantity <= 1) get().removeItem(key)
        else {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity - 1 } : i
            )
          })
        }
      },
      clear: () => set({ items: [] }),
      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + lineUnit(i) * i.quantity, 0)
    }),
    {
      name: 'breadline-cart-v2',
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const p = persisted as { items?: unknown } | undefined
        return {
          ...current,
          items: sanitizeCartItems(p?.items)
        }
      }
    }
  )
)

export function cartLineTotal(item: CartItem) {
  return lineUnit(item) * item.quantity
}
