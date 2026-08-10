export const DELIVERY_FEE = 99
export const TAX_RATE = 0
export const FREE_DELIVERY_THRESHOLD = 1500

export function calcDeliveryFee(subtotal: number, orderType: 'delivery' | 'takeaway') {
  if (orderType !== 'delivery') return 0
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
  return DELIVERY_FEE
}

export function calcTax(subtotal: number) {
  return Math.round(subtotal * TAX_RATE)
}
