'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { registerSchema, type RegisterInput } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  })

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-[2rem] border border-ink/5 bg-white p-8 shadow-sm">
        <h1 className="font-display text-3xl font-extrabold">Create Account</h1>
        <p className="mt-2 text-sm text-ink/60">Join Breadline for faster checkout.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={form.handleSubmit(() => {
            toast.message('UI ready', {
              description: 'Connect a real auth API when backend is available.'
            })
          })}
        >
          {(
            [
              ['name', 'Name', 'text'],
              ['email', 'Email', 'email'],
              ['phone', 'Phone', 'tel'],
              ['password', 'Password', 'password'],
              ['confirmPassword', 'Confirm password', 'password']
            ] as const
          ).map(([key, label, type]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} type={type} {...form.register(key)} />
              <p className="mt-1 text-xs text-brand">
                {form.formState.errors[key]?.message as string | undefined}
              </p>
            </div>
          ))}
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
