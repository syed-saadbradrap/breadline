import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createOnlineOrder } from '@/lib/online-orders/store'
import type { OnlineOrderPayload } from '@/lib/online-orders/types'
import { sendOrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { sanitizeText } from '@/lib/sanitize'

export const runtime = 'nodejs'

const itemSchema = z.object({
  name: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(50),
  unitPrice: z.number().min(0).max(100000),
  modifiers: z.array(z.string().max(80)).max(20).default([]),
  note: z.string().max(200).optional(),
  lineTotal: z.number().min(0).max(500000)
})

const orderSchema = z.object({
  id: z.string().uuid(),
  orderNumber: z.string().min(3).max(40),
  createdAt: z.string().min(10).max(40),
  type: z.enum(['delivery', 'takeaway']),
  customerName: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  email: z.string().email().max(120),
  address: z.string().max(240).optional(),
  city: z.string().max(80).optional(),
  postalCode: z.string().max(20).optional(),
  instructions: z.string().max(300).optional(),
  locationPin: z.string().max(500).optional(),
  paymentMethod: z.enum(['cod', 'cash_restaurant']),
  items: z.array(itemSchema).min(1).max(40),
  subtotal: z.number().min(0),
  deliveryFee: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().min(0),
  estimatedMinutes: z.number().int().min(5).max(180)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = orderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid order' },
        { status: 400 }
      )
    }

    const data = parsed.data
    const payload: OnlineOrderPayload = {
      ...data,
      customerName: sanitizeText(data.customerName, 80),
      phone: sanitizeText(data.phone, 20),
      email: data.email ? sanitizeText(data.email, 120) : undefined,
      address: data.address ? sanitizeText(data.address, 240) : undefined,
      city: data.city ? sanitizeText(data.city, 80) : undefined,
      postalCode: data.postalCode ? sanitizeText(data.postalCode, 20) : undefined,
      instructions: data.instructions ? sanitizeText(data.instructions, 300) : undefined,
      locationPin: data.locationPin ? sanitizeText(data.locationPin, 500) : undefined,
      items: data.items.map((item) => ({
        ...item,
        name: sanitizeText(item.name, 120),
        note: item.note ? sanitizeText(item.note, 200) : undefined,
        modifiers: item.modifiers.map((m) => sanitizeText(m, 80))
      }))
    }

    const saved = await createOnlineOrder(payload)

    // Best-effort: order succeeds even if email provider is down
    const emailResult = await sendOrderConfirmationEmail(payload).catch((err) => {
      console.error('[email] unexpected failure', err)
      return { sent: false as const, reason: 'unexpected' }
    })

    return NextResponse.json(
      { ok: true, order: saved, emailSent: emailResult.sent },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
