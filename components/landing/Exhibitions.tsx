'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

export interface Exhibition {
  year: number
  title: string
  venue: string
  city: string
}

interface ExhibitionsProps {
  exhibitions: Exhibition[]
}

export default function Exhibitions({ exhibitions }: ExhibitionsProps) {
  const t = useTranslations('exhibitions')
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = ref.current?.querySelectorAll('.exhibit-row') ?? []
      gsap.fromTo(
        Array.from(rows),
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h2>

        <div className="divide-y divide-stone-warm/15">
          {exhibitions.map((ex) => (
            <div
              key={`${ex.year}-${ex.title}`}
              className="exhibit-row grid grid-cols-[80px_1fr_auto] gap-6 py-5 opacity-0"
            >
              <span className="font-sans text-stone-warm text-sm tabular-nums">
                {ex.year}
              </span>
              <div>
                <p className="font-serif text-base text-stone-dark">{ex.title}</p>
                <p className="font-sans text-sm text-stone-warm mt-0.5">{ex.venue}</p>
              </div>
              <span className="font-sans text-xs text-stone-warm/60 self-center text-right">
                {ex.city}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
