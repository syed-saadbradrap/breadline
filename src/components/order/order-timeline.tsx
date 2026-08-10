'use client'

import { cn } from '@/lib/utils'
import type { OrderStatus, OrderType } from '@/types/order'

const deliverySteps: { key: OrderStatus; label: string }[] = [
  { key: 'received', label: 'Order Received' },
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
]

const takeawaySteps: { key: OrderStatus; label: string }[] = [
  { key: 'received', label: 'Order Received' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'completed', label: 'Completed' }
]

export function OrderTimeline({
  status,
  type
}: {
  status: OrderStatus
  type: OrderType
}) {
  const steps = type === 'takeaway' ? takeawaySteps : deliverySteps
  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === status)
  )

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const done = index <= activeIndex
        const current = index === activeIndex
        return (
          <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {index < steps.length - 1 && (
              <span
                className={cn(
                  'absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5',
                  index < activeIndex ? 'bg-brand' : 'bg-ink/10'
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                done ? 'border-brand bg-brand' : 'border-ink/20 bg-white',
                current && 'animate-pulse shadow-[0_0_0_6px_rgba(196,30,34,0.18)]'
              )}
            >
              {done && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            <div>
              <div className={cn('font-semibold', done ? 'text-ink' : 'text-ink/40')}>
                {step.label}
              </div>
              {current && <div className="text-xs font-semibold uppercase tracking-wide text-brand">Current</div>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
