import { z } from 'zod'
import { sanitizePhone, sanitizeText } from './sanitize'

export const checkoutSchema = z
  .object({
    fullName: z
      .string()
      .transform((v) => sanitizeText(v, 80))
      .pipe(z.string().min(2, 'Name is required').max(80)),
    phone: z
      .string()
      .transform((v) => sanitizePhone(v))
      .pipe(
        z
          .string()
          .min(10, 'Valid phone is required')
          .max(20)
          .regex(/^\+?[\d\s()-]{10,20}$/, 'Enter a valid phone number')
      ),
    email: z
      .string()
      .transform((v) => sanitizeText(v, 120).toLowerCase())
      .pipe(z.string().email('Valid email required').or(z.literal('')))
      .optional(),
    orderType: z.enum(['delivery', 'takeaway']),
    address: z
      .string()
      .transform((v) => sanitizeText(v, 200))
      .optional(),
    city: z
      .string()
      .transform((v) => sanitizeText(v, 60))
      .optional(),
    postalCode: z
      .string()
      .transform((v) => sanitizeText(v, 16))
      .optional(),
    instructions: z
      .string()
      .transform((v) => sanitizeText(v, 300))
      .optional(),
    locationPin: z
      .string()
      .transform((v) => sanitizeText(v, 500))
      .optional(),
    paymentMethod: z.enum(['cod', 'cash_restaurant'])
  })
  .superRefine((data, ctx) => {
    if (data.orderType === 'delivery') {
      if (!data.address?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Address is required', path: ['address'] })
      }
      if (!data.city?.trim()) {
        ctx.addIssue({ code: 'custom', message: 'City is required', path: ['city'] })
      }
      if (data.locationPin?.trim()) {
        const pin = data.locationPin.trim()
        const ok =
          /^https?:\/\//i.test(pin) ||
          /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(pin) ||
          /maps\.google|google\.com\/maps|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(pin)
        if (!ok) {
          ctx.addIssue({
            code: 'custom',
            message: 'Paste a valid Google Maps pin link or lat,lng',
            path: ['locationPin']
          })
        }
      }
    }
  })

export const contactSchema = z.object({
  name: z
    .string()
    .transform((v) => sanitizeText(v, 80))
    .pipe(z.string().min(2, 'Name is required').max(80)),
  email: z
    .string()
    .transform((v) => sanitizeText(v, 120).toLowerCase())
    .pipe(z.string().email('Valid email required').max(120)),
  phone: z
    .string()
    .transform((v) => sanitizePhone(v))
    .pipe(
      z
        .string()
        .min(10, 'Valid phone is required')
        .max(20)
        .regex(/^\+?[\d\s()-]{10,20}$/, 'Enter a valid phone number')
    ),
  message: z
    .string()
    .transform((v) => sanitizeText(v, 1000))
    .pipe(z.string().min(10, 'Message is too short').max(1000))
})

export const loginSchema = z.object({
  email: z
    .string()
    .transform((v) => sanitizeText(v, 120).toLowerCase())
    .pipe(z.string().email('Valid email required').max(120)),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128)
})

export const registerSchema = z
  .object({
    name: z
      .string()
      .transform((v) => sanitizeText(v, 80))
      .pipe(z.string().min(2, 'Name is required').max(80)),
    email: z
      .string()
      .transform((v) => sanitizeText(v, 120).toLowerCase())
      .pipe(z.string().email('Valid email required').max(120)),
    phone: z
      .string()
      .transform((v) => sanitizePhone(v))
      .pipe(
        z
          .string()
          .min(10, 'Valid phone is required')
          .max(20)
          .regex(/^\+?[\d\s()-]{10,20}$/, 'Enter a valid phone number')
      ),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
    confirmPassword: z.string().min(6, 'Confirm your password').max(128)
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
