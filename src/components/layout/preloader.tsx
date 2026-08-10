'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SESSION_KEY = 'bl-preloader-seen'
const MIN_MS = 2200

export function Preloader() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      seen = false
    }

    if (seen) {
      document.getElementById('bl-boot-screen')?.remove()
      document.documentElement.classList.remove('bl-boot')
      return
    }

    setVisible(true)
    document.documentElement.classList.add('bl-loading')
    document.body.style.overflow = 'hidden'

    // Swap static boot → animated preloader without a blank frame
    requestAnimationFrame(() => {
      document.getElementById('bl-boot-screen')?.remove()
      document.documentElement.classList.remove('bl-boot')
    })

    const start = performance.now()
    let frame = 0
    let finished = false

    const tick = (now: number) => {
      const t = Math.min((now - start) / MIN_MS, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.min(94, Math.floor(eased * 94)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    const finish = () => {
      if (finished) return
      finished = true
      setProgress(100)
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(SESSION_KEY, '1')
        } catch {
          // ignore
        }
        setVisible(false)
        document.documentElement.classList.remove('bl-loading')
        document.body.style.overflow = ''
      }, 320)
    }

    const onReady = () => {
      const remaining = Math.max(0, MIN_MS - (performance.now() - start))
      window.setTimeout(finish, remaining)
    }

    if (document.readyState === 'complete') onReady()
    else {
      window.addEventListener('load', onReady, { once: true })
      window.setTimeout(onReady, MIN_MS + 500)
    }

    return () => {
      finished = true
      cancelAnimationFrame(frame)
      window.removeEventListener('load', onReady)
      document.documentElement.classList.remove('bl-loading')
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink text-white"
          initial={{ y: 0 }}
          exit={{ y: '-105%' }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          aria-busy="true"
          aria-label="Loading Breadline"
          role="status"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(196,30,34,0.3),transparent_55%)]" />
            <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(217,217,217,0.55)_1px,transparent_1px)] [background-size:18px_18px]" />
          </div>

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-8">
            <motion.div
              initial={{ scale: 0.72, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-5 rounded-full border border-brand/35"
                animate={{ scale: [1, 1.14, 1], opacity: [0.5, 0.12, 0.5] }}
                transition={{ duration: 1.85, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Image
                src="/images/breadline-logo.png"
                alt="Breadline"
                width={88}
                height={88}
                priority
                className="relative h-[88px] w-[88px] rounded-full object-cover shadow-[0_0_40px_rgba(196,30,34,0.4)] ring-2 ring-white/20"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="mt-7"
            >
              <div className="font-display text-4xl tracking-[0.06em] sm:text-6xl">
                <span className="text-white">BREAD</span>
                <span className="text-brand">LINE</span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="mt-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/45"
            >
              Toast. Bite. Repeat.
            </motion.p>

            <div className="mt-10 w-full max-w-[220px]">
              <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-150 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                <span>Loading</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
