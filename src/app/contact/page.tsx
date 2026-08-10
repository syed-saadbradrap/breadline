'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { contactSchema, type ContactInput } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '' }
  })

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:px-8">
      <div className="min-w-0">
        <h1 className="font-display text-[clamp(2.25rem,6vw,3.5rem)] tracking-[0.03em]">
          Contact Breadline
        </h1>
        <p className="mt-2 text-sm text-ink/60 sm:text-base">
          Questions, feedback, or catering? We’re listening.
        </p>

        <form
          className="mt-6 space-y-4 rounded-2xl border border-ink/5 bg-white p-4 shadow-sm sm:mt-8 sm:rounded-3xl sm:p-6"
          onSubmit={form.handleSubmit(() => {
            toast.success('Message sent! We’ll get back to you soon.')
            form.reset()
          })}
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} />
            <p className="mt-1 text-xs text-brand">{form.formState.errors.name?.message}</p>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
            <p className="mt-1 text-xs text-brand">{form.formState.errors.email?.message}</p>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register('phone')} />
            <p className="mt-1 text-xs text-brand">{form.formState.errors.phone?.message}</p>
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" {...form.register('message')} />
            <p className="mt-1 text-xs text-brand">{form.formState.errors.message?.message}</p>
          </div>
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold">Visit us</h2>
          <dl className="mt-4 space-y-3 text-sm text-ink/70">
            <div>
              <dt className="font-semibold text-ink">Address</dt>
              <dd>Main Boulevard, Your City</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Phone</dt>
              <dd>+92 300 0000000</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Email</dt>
              <dd>hello@breadline.local</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Opening hours</dt>
              <dd>Daily 12:00 PM – 12:00 AM</dd>
            </div>
          </dl>
        </div>
        <div className="flex aspect-[16/10] items-center justify-center rounded-3xl border border-dashed border-ink/15 bg-muted text-sm font-semibold text-ink/45">
          Map placeholder
        </div>
      </div>
    </div>
  )
}
