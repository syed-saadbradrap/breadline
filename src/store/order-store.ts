'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '@/types/order'
import { sanitizePhone, sanitizeText } from '@/lib/sanitize'

const MAX_ORDERS = 30

interface OrderState {
  orders: Order[]
  lastOrderId: string | null
  addOrder: (order: Order) => void
  getOrder: (id: string) => Order | undefined
  getOrderByNumber: (orderNumber: string) => Order | undefined
}

function sanitizeOrder(order: Order): Order {
  return {
    ...order,
    id: sanitizeText(order.id, 64),
    orderNumber: sanitizeText(order.orderNumber, 32),
    customerName: sanitizeText(order.customerName, 80),
    phone: sanitizePhone(order.phone),
    email: order.email ? sanitizeText(order.email, 120).toLowerCase() : undefined,
    address: order.address ? sanitizeText(order.address, 200) : undefined,
    city: order.city ? sanitizeText(order.city, 60) : undefined,
    postalCode: order.postalCode ? sanitizeText(order.postalCode, 16) : undefined,
    instructions: order.instructions ? sanitizeText(order.instructions, 300) : undefined,
    items: (order.items || []).slice(0, 40).map((item) => ({
      ...item,
      name: sanitizeText(item.name, 80),
      quantity: Math.min(20, Math.max(1, Math.trunc(item.quantity || 1))),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
      lineTotal: Math.max(0, Number(item.lineTotal) || 0),
      modifiers: (item.modifiers || []).slice(0, 12).map((m) => sanitizeText(m, 60)),
      note: item.note ? sanitizeText(item.note, 200) : undefined
    })),
    subtotal: Math.max(0, Number(order.subtotal) || 0),
    deliveryFee: Math.max(0, Number(order.deliveryFee) || 0),
    tax: Math.max(0, Number(order.tax) || 0),
    discount: Math.max(0, Number(order.discount) || 0),
    total: Math.max(0, Number(order.total) || 0)
  }
}

const demoOrders: Order[] = [
  {
    id: 'demo-1',
    orderNumber: 'BL-10241',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'delivery',
    status: 'preparing',
    customerName: 'Demo Customer',
    phone: '03001234567',
    email: 'demo@breadline.local',
    address: 'Main Street 12',
    city: 'City',
    paymentMethod: 'cod',
    items: [
      {
        name: 'Zinger Burger',
        quantity: 2,
        unitPrice: 280.5,
        modifiers: ['Extra Cheese'],
        lineTotal: 611
      },
      {
        name: 'Loaded Fries',
        quantity: 1,
        unitPrice: 340,
        modifiers: [],
        lineTotal: 340
      }
    ],
    subtotal: 951,
    deliveryFee: 99,
    tax: 0,
    discount: 0,
    total: 1050,
    estimatedMinutes: 35
  }
]

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: demoOrders,
      lastOrderId: null,
      addOrder: (order) => {
        const clean = sanitizeOrder(order)
        set({
          orders: [clean, ...get().orders.filter((o) => o.id !== clean.id)].slice(0, MAX_ORDERS),
          lastOrderId: clean.id
        })
      },
      getOrder: (id) => get().orders.find((o) => o.id === id),
      getOrderByNumber: (orderNumber) =>
        get().orders.find((o) => o.orderNumber === orderNumber)
    }),
    {
      name: 'breadline-orders-v2',
      partialize: (state) => ({
        orders: state.orders.slice(0, MAX_ORDERS),
        lastOrderId: state.lastOrderId
      })
    }
  )
)
