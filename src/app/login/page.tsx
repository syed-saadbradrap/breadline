'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { loginSchema, type LoginInput } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-[2rem] border border-ink/5 bg-white p-8 shadow-sm">
        <h1 className="font-display text-3xl font-extrabold">Login</h1>
        <p className="mt-2 text-sm text-ink/60">Welcome back to Breadline.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit(() => {
            toast.message('UI ready', {
              description: 'Connect a real auth API when backend is available.'
            })
          })}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
            <p className="mt-1 text-xs text-brand">{form.formState.errors.email?.message}</p>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register('password')} />
            <p className="mt-1 text-xs text-brand">{form.formState.errors.password?.message}</p>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <div className="mt-4 grid gap-2">
          <Button type="button" variant="outline" className="w-full" disabled>
            Continue with Google
          </Button>
          <Button type="button" variant="outline" className="w-full" disabled>
            Continue with Apple
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-ink/60">
          New here?{' '}
          <Link href="/register" className="font-semibold text-brand">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
