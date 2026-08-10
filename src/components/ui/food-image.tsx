'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const palettes = [
  'from-[#1a0506] via-[#c41e22] to-[#e85f5f]',
  'from-[#141414] via-[#3f3f46] to-[#c41e22]',
  'from-[#2a0a0b] via-[#9a171a] to-[#f87171]',
  'from-[#141414] via-[#52525b] to-[#d9d9d9]'
]

export function FoodImage({
  src,
  alt,
  className,
  priority
}: {
  src?: string
  alt: string
  className?: string
  priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const tone = palettes[(alt.length + (src?.length || 0)) % palettes.length]
  const label = alt.split(' ').slice(0, 2).join(' ')

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)} aria-label={alt} role="img">
      {(!src || failed) && (
        <>
          <div className={cn('absolute inset-0 bg-gradient-to-br', tone)} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_45%)]" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <span className="inline-block bg-black/35 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              {label}
            </span>
          </div>
        </>
      )}
      {src && !failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
          priority={priority}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
