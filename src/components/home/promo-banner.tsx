'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function PromoBanner() {
  return (
    <section className="relative overflow-hidden bg-ink text-white grain">
      <div className="absolute inset-0">
        <Image
          src="/images/products/loaded-fries.png"
          alt="Breadline loaded fries"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#c41e22]/55" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="max-w-xl"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand">Tonight</p>
          <h2 className="mt-3 font-display text-[clamp(2.75rem,7vw,5rem)] leading-[0.92] tracking-[0.02em]">
            HUNGRY?
            <br />
            MAKE IT A FEAST.
          </h2>
          <p className="mt-4 max-w-md text-base text-white/75 sm:text-lg">
            Loaded fries, special zingers, and hot wraps — order in minutes.
          </p>
          <Button asChild size="lg" className="mt-7 shadow-[0_12px_40px_rgba(196,30,34,0.4)]">
            <Link href="/menu">Order Now</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
