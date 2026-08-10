import type { Metadata } from 'next'
import Image from 'next/image'
import { FoodImage } from '@/components/ui/food-image'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn the Breadline story — fresh ingredients, bold flavors, made fast.',
  alternates: { canonical: '/about' }
}

const values = [
  { title: 'Fresh Ingredients', text: 'We start with quality produce and proteins every day.' },
  { title: 'Bold Flavors', text: 'From zinger heat to garlic mayo — every bite hits.' },
  { title: 'Made Fresh', text: 'Prepared to order so it arrives crispy and hot.' },
  { title: 'Fast Service', text: 'Built for cravings — quick without cutting corners.' }
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <Image
              src="/images/breadline-logo.png"
              alt="Breadline"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-silver/80"
            />
            <div className="font-display text-3xl tracking-[0.04em]">
              <span className="text-ink">BREAD</span>
              <span className="text-brand">LINE</span>
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand">Est. 2026</p>
          <h1 className="mt-2 font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.95] tracking-[0.03em]">
            OUR STORY
          </h1>
          <p className="mt-5 text-lg text-ink/70">
            At Breadline, we believe great food starts with great ingredients, bold flavors and
            fresh preparation.
          </p>
          <p className="mt-4 text-ink/60">
            From crispy burgers to loaded fries and toasted sandwiches — we’re here for the late
            nights, lunch breaks, and every craving in between. Toast. Bite. Repeat.
          </p>
        </div>
        <FoodImage
          src="/images/products/special-zinger.png"
          alt="Breadline Special Zinger"
          className="aspect-[4/3] rounded-2xl shadow-[0_20px_50px_rgba(20,20,20,0.12)]"
          priority
        />
      </div>

      <section className="mt-20">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] tracking-[0.04em] text-ink">
          WHY BREADLINE
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl bg-white p-5 shadow-[0_12px_32px_rgba(20,20,20,0.05)] ring-1 ring-ink/5"
            >
              <h3 className="font-display text-2xl tracking-[0.04em] text-brand">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
