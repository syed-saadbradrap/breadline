export type OnlineOrderStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

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
}

export type OnlineOrderRecord = OnlineOrderPayload & {
  status: OnlineOrderStatus
  updatedAt: string
  posOrderNumber?: string
  posOrderId?: number
}
