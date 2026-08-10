import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm text-ink outline-none ring-brand/30 transition placeholder:text-ink/40 focus:border-brand focus:ring-2',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'
