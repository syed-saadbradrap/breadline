'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-white">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/images/products/zinger-burger.png"
          alt="Breadline Zinger Burger"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_35%] max-[380px]:object-[75%_30%] sm:object-[68%_40%] lg:object-[60%_38%]"
        />
      </motion.div>

      {/* Mobile: bottom-heavy veil so copy stays readable; desktop: left fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/35 sm:bg-gradient-to-r sm:from-black sm:via-black/75 sm:to-black/15 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent opacity-90 sm:opacity-100" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-28 pt-24 sm:justify-center sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-xl lg:max-w-2xl"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60 sm:text-[11px] sm:tracking-[0.32em]">
            Toast. Bite. Repeat.
          </p>

          <h1 className="mt-3 font-display text-[clamp(3.25rem,15vw,8.5rem)] leading-[0.88] tracking-[0.04em] sm:mt-4">
            <span className="text-white">BREAD</span>
            <span className="text-brand">LINE</span>
          </h1>

          <p className="mt-3 font-display text-[clamp(1.25rem,5.2vw,2.75rem)] leading-[1.05] tracking-[0.04em] text-white/95 sm:mt-4">
            CRISPY. JUICY. <span className="text-brand">IRRESISTIBLE.</span>
          </p>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/72 sm:mt-5 sm:text-base lg:text-lg">
            Burgers, wraps, sandwiches and sides — made fresh, served hot.
          </p>

          <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="w-full shadow-[0_12px_36px_rgba(196,30,34,0.4)] sm:w-auto sm:min-w-[150px]"
            >
              <Link href="/menu">Order Now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-white/35 bg-transparent text-white hover:border-white hover:bg-white hover:text-ink sm:w-auto sm:min-w-[150px]"
            >
              <Link href="/menu">Explore Menu</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#menu-browse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute bottom-[5.5rem] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/45 transition hover:text-white/80 sm:bottom-8 sm:flex"
        aria-label="Scroll to menu"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </motion.a>
    </section>
  )
}
