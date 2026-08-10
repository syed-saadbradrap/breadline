import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number, currency = 'Rs.') {
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString('en-PK')
    : amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${currency} ${formatted}`
}

export function createOrderNumber() {
  const n = Math.floor(10000 + Math.random() * 90000)
  return `BL-${n}`
}
