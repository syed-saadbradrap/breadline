export type OnlineOrderStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

/** Rider delivery progress (stored inside payload so DB status check stays unchanged). */
export type RiderDeliveryStatus = 'ready' | 'out_for_delivery' | 'delivered'

/** Kitchen progress synced from POS for customer tracking. */
export type KitchenProgressStatus = 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'

export type OnlineOrderItem = {
  name: string
  quantity: number
  unitPrice: number
  modifiers: string[]
  note?: string
  lineTotal: number
}

export type OnlineOrderPayload = {
  id: string
  orderNumber: string
  createdAt: string
  type: 'delivery' | 'takeaway'
  customerName: string
  phone: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  instructions?: string
  locationPin?: string
  paymentMethod: 'cod' | 'cash_restaurant'
  items: OnlineOrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  total: number
  estimatedMinutes: number
  /** ISO time when kitchen should start this order (scheduled while closed). */
  scheduledFor?: string
  kitchenStatus?: KitchenProgressStatus
  kitchenUpdatedAt?: string
  riderStatus?: RiderDeliveryStatus
  riderUpdatedAt?: string
}

export type OnlineOrderRecord = OnlineOrderPayload & {
  status: OnlineOrderStatus
  updatedAt: string
  posOrderNumber?: string
  posOrderId?: number
}
