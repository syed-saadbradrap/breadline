import Link from 'next/link'
import { Button } from './button'

export function EmptyState({
  title,
  description,
  actionHref = '/menu',
  actionLabel = 'Explore Menu'
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{description}</p>
      <Button asChild className="mt-6">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  )
}
