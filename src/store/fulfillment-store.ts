'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrderType } from '@/types/order'

interface FulfillmentState {
  orderType: OrderType
  hasChosen: boolean
  pickerOpen: boolean
  setOrderType: (type: OrderType) => void
  openPicker: () => void
  closePicker: () => void
}

export const useFulfillmentStore = create<FulfillmentState>()(
  persist(
    (set) => ({
      orderType: 'delivery',
      hasChosen: false,
      pickerOpen: false,
      setOrderType: (type) =>
        set({
          orderType: type,
          hasChosen: true,
          pickerOpen: false
        }),
      openPicker: () => set({ pickerOpen: true }),
      closePicker: () =>
        set((s) => ({
          // Only allow closing if they already chose once
          pickerOpen: s.hasChosen ? false : s.pickerOpen
        }))
    }),
    {
      name: 'breadline-fulfillment',
      partialize: (s) => ({
        orderType: s.orderType,
        hasChosen: s.hasChosen
      })
    }
  )
)
