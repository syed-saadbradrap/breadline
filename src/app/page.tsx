import Link from 'next/link'
import { categories } from '@/data/categories'
import { getBestSellers } from '@/data/products'
import { Hero } from '@/components/home/hero'
import { PromoBanner } from '@/components/home/promo-banner'
import { SectionHeading } from '@/components/home/section-heading'
import { CategoryStrip } from '@/components/home/category-strip'
import { ProductCard } from '@/components/menu/product-card'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'

export default function HomePage() {
  const bestSellers = getBestSellers()

  return (
    <>
      <Hero />

      <section id="menu-browse" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Browse"
            title="THE MENU"
            subtitle="Pick a lane — burgers, premium plates, wraps, fries and more."
          />
        </Reveal>
        <div className="mt-10">
          <CategoryStrip categories={categories} />
        </div>
      </section>

      <section className="border-y border-ink/5 bg-white/70 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Crowd favorites"
                title="BEST SELLERS"
                subtitle="What North Karachi keeps coming back for."
              />
              <Button asChild variant="outline" className="shrink-0 self-start sm:self-auto">
                <Link href="/menu">View full menu</Link>
              </Button>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-5 lg:grid-cols-3">
            {bestSellers.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PromoBanner />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-ink px-6 py-12 text-center text-white sm:px-10 lg:px-16 lg:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(196,30,34,0.35),transparent_45%)]" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand">
                Ready when you are
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[0.03em]">
                TOAST. BITE. REPEAT.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-white/65">
                Full menu online — customize sauces, add sides, checkout in minutes.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/menu">Start your order</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
