'use client'

import { useEffect, type ReactNode } from 'react'

export default function RiderLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add('rider-app')
    document.documentElement.classList.remove('bl-boot')

    let meta = document.querySelector('meta[name="apple-mobile-web-app-capable"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'apple-mobile-web-app-capable')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'yes')

    return () => document.body.classList.remove('rider-app')
  }, [])

  return <>{children}</>
}
