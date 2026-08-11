export type OrderType = 'delivery' | 'takeaway'
export type PaymentMethod = 'cod' | 'cash_restaurant'
export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'

export interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
  modifiers: string[]
  note?: string
  lineTotal: number
}

export interface Order {
  id: string
  orderNumber: string
  createdAt: string
  type: OrderType
  status: OrderStatus
  customerName: string
  phone: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  instructions?: string
  /** Google Maps pin link or lat,lng for delivery */
  locationPin?: string
  paymentMethod: PaymentMethod
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  discount: number
  total: number
  estimatedMinutes: number
  /** When set, kitchen should start at this time (scheduled while closed). */
  scheduledFor?: string
}
