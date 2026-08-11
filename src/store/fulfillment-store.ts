'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrderType } from '@/types/order'

interface FulfillmentState {
  orderType: OrderType
  hasChosen: boolean
  pickerOpen: boolean
  /** When kitchen is closed, customer chose to schedule for next open. */
  scheduleForOpen: boolean
  scheduleLabel: string | null
  setOrderType: (type: OrderType) => void
  openPicker: () => void
  closePicker: () => void
  enableScheduleForOpen: (label: string) => void
  clearScheduleForOpen: () => void
}

export const useFulfillmentStore = create<FulfillmentState>()(
  persist(
    (set) => ({
      orderType: 'delivery',
      hasChosen: false,
      pickerOpen: false,
      scheduleForOpen: false,
      scheduleLabel: null,
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
        })),
      enableScheduleForOpen: (label) =>
        set({
          scheduleForOpen: true,
          scheduleLabel: label
        }),
      clearScheduleForOpen: () =>
        set({
          scheduleForOpen: false,
          scheduleLabel: null
        })
    }),
    {
      name: 'breadline-fulfillment',
      partialize: (s) => ({
        orderType: s.orderType,
        hasChosen: s.hasChosen,
        scheduleForOpen: s.scheduleForOpen,
        scheduleLabel: s.scheduleLabel
      })
    }
  )
)
