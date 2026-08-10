'use client'

import { formatMoney } from '@/lib/utils'
import { calcDeliveryFee, calcTax } from '@/lib/pricing'
import { useCartStore } from '@/store/cart-store'

export function CartSummary({
  orderType = 'delivery',
  discount = 0
}: {
  orderType?: 'delivery' | 'takeaway'
  discount?: number
}) {
  const subtotal = useCartStore((s) => s.subtotal())
  const delivery = calcDeliveryFee(subtotal, orderType)
  const tax = calcTax(subtotal)
  const total = Math.max(0, subtotal + delivery + tax - discount)

  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold">Order Summary</h3>
      <div className="mt-4 space-y-2 text-sm">
        <Row label="Subtotal" value={formatMoney(subtotal)} />
        <Row label="Delivery Fee" value={formatMoney(delivery)} />
        <Row label="Tax" value={formatMoney(tax)} />
        <Row label="Discount" value={formatMoney(discount)} />
        <div className="flex justify-between border-t border-ink/10 pt-3 font-display text-xl font-bold">
          <span>Total</span>
          <span className="text-brand">{formatMoney(total)}</span>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink/70">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
