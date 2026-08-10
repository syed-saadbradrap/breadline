'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { checkoutSchema, type CheckoutInput } from '@/lib/validation'
import { useCartStore, cartLineTotal } from '@/store/cart-store'
import { useOrderStore } from '@/store/order-store'
import { CartSummary } from '@/components/cart/cart-summary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import { LocationPinField } from '@/components/checkout/location-pin-field'
import { LocationMap } from '@/components/ui/location-map'
import { calcDeliveryFee, calcTax } from '@/lib/pricing'
import { createOrderNumber } from '@/lib/utils'
import type { Order } from '@/types/order'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const clear = useCartStore((s) => s.clear)
  const addOrder = useOrderStore((s) => s.addOrder)

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      orderType: 'delivery',
      address: '',
      city: 'Karachi',
      postalCode: '',
      instructions: '',
      locationPin: '',
      paymentMethod: 'cod'
    }
  })

  const orderType = form.watch('orderType')

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Nothing to checkout" description="Add items from the menu first." />
      </div>
    )
  }

  const onSubmit = (data: CheckoutInput) => {
    const deliveryFee = calcDeliveryFee(subtotal, data.orderType)
    const tax = calcTax(subtotal)
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber: createOrderNumber(),
      createdAt: new Date().toISOString(),
      type: data.orderType,
      status: 'received',
      customerName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
      instructions: data.instructions,
      locationPin: data.locationPin || undefined,
      paymentMethod: data.paymentMethod,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        modifiers: i.modifiers.map((m) => m.name),
        note: i.note,
        lineTotal: cartLineTotal(i)
      })),
      subtotal,
      deliveryFee,
      tax,
      discount: 0,
      total: subtotal + deliveryFee + tax,
      estimatedMinutes: data.orderType === 'delivery' ? 40 : 25
    }
    addOrder(order)
    clear()
    toast.success('Order placed successfully')
    router.push(`/order-confirmation?id=${order.id}`)
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-w-0 space-y-5 sm:space-y-6">
        <div>
          <h1 className="font-display text-[clamp(2.25rem,6vw,3.5rem)] tracking-[0.03em]">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-ink/60 sm:text-base">
            Almost there — tell us where to send your feast.
          </p>
        </div>

        <section className="rounded-2xl border border-ink/5 bg-white p-4 sm:rounded-3xl sm:p-5">
          <h2 className="font-display text-xl tracking-[0.04em]">Customer information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...form.register('fullName')} />
              <Err msg={form.formState.errors.fullName?.message} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register('phone')} />
              <Err msg={form.formState.errors.phone?.message} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              <Err msg={form.formState.errors.email?.message} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/5 bg-white p-4 sm:rounded-3xl sm:p-5">
          <h2 className="font-display text-xl tracking-[0.04em]">Order type</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(['delivery', 'takeaway'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => form.setValue('orderType', t)}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize ${
                  orderType === t ? 'border-brand bg-brand/5 text-brand' : 'border-ink/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {orderType === 'delivery' ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...form.register('address')} />
                <Err msg={form.formState.errors.address?.message} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" {...form.register('city')} />
                <Err msg={form.formState.errors.city?.message} />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal code</Label>
                <Input id="postalCode" {...form.register('postalCode')} />
              </div>
              <LocationPinField
                value={form.watch('locationPin') || ''}
                onChange={(v) => form.setValue('locationPin', v, { shouldValidate: true })}
                error={form.formState.errors.locationPin?.message}
              />
              <div className="sm:col-span-2">
                <Label htmlFor="instructions">Delivery instructions</Label>
                <Textarea id="instructions" {...form.register('instructions')} />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="rounded-2xl bg-muted p-4 text-sm text-ink/70">
                Pickup at Breadline — Sector 9, North Karachi. We’ll notify you when your order is
                ready.
              </p>
              <LocationMap title="Pickup pin" />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-ink/5 bg-white p-4 sm:rounded-3xl sm:p-5">
          <h2 className="font-display text-xl tracking-[0.04em]">Payment</h2>
          <div className="mt-4 grid gap-3">
            <PayOption
              active={form.watch('paymentMethod') === 'cod'}
              label="Cash on Delivery"
              onClick={() => form.setValue('paymentMethod', 'cod')}
            />
            <PayOption
              active={form.watch('paymentMethod') === 'cash_restaurant'}
              label="Cash at Restaurant"
              onClick={() => form.setValue('paymentMethod', 'cash_restaurant')}
            />
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full lg:w-auto">
          Place Order
        </Button>
      </form>

      <div className="order-first lg:order-none lg:sticky lg:top-28 lg:self-start">
        <CartSummary orderType={orderType} />
      </div>
    </div>
  )
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-brand">{msg}</p>
}

function PayOption({
  active,
  label,
  onClick
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
        active ? 'border-brand bg-brand/5 text-brand' : 'border-ink/10'
      }`}
    >
      {label}
    </button>
  )
}
