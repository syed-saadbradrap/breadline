'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

export function QuantitySelector({
  value,
  onChange,
  className,
  min = 1
}: {
  value: number
  onChange: (value: number) => void
  className?: string
  min?: number
}) {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-xl bg-muted p-1 sm:gap-2', className)}>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 shrink-0 rounded-lg touch-manipulation sm:h-8 sm:w-8 sm:rounded-xl"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-6 text-center text-sm font-bold tabular-nums">{value}</span>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-9 w-9 shrink-0 rounded-lg touch-manipulation sm:h-8 sm:w-8 sm:rounded-xl"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
