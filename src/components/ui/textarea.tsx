import * as React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[110px] w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none ring-brand/30 transition placeholder:text-ink/40 focus:border-brand focus:ring-2',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
