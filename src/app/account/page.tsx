import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your Breadline profile, addresses and orders.',
  alternates: { canonical: '/account' }
}

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-extrabold">My Account</h1>
      <p className="mt-2 text-ink/60">Profile, addresses and order history.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card
          title="Profile"
          body="Demo customer profile. Connect authentication to load real user data."
          action={{ href: '/login', label: 'Login / Register' }}
        />
        <Card
          title="Saved Addresses"
          body="Home · Main Boulevard, Your City"
          action={{ href: '/checkout', label: 'Use at checkout' }}
        />
        <Card
          title="Order History"
          body="View past Breadline orders and reorder favorites."
          action={{ href: '/account/orders', label: 'My Orders' }}
        />
        <Card
          title="Account Settings"
          body="Update contact details and notification preferences."
          action={{ href: '/contact', label: 'Contact support' }}
        />
      </div>
    </div>
  )
}

function Card({
  title,
  body,
  action
}: {
  title: string
  body: string
  action: { href: string; label: string }
}) {
  return (
    <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-ink/60">{body}</p>
      <Button asChild className="mt-5" variant="outline">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    </div>
  )
}
