'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

interface ExhibitionPhoto {
  id: string
  url: string
  width: number
  height: number
}

export interface Exhibition {
  id: string
  name: string
  venue: string
  city: string
  date: Date
  descEs: string | null
  descEn: string | null
  photos: ExhibitionPhoto[]
}

interface ExhibitionsProps {
  exhibitions: Exhibition[]
  locale: string
}

export default function Exhibitions({ exhibitions, locale }: ExhibitionsProps) {
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

  if (exhibitions.length === 0) return null

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h2>

        <div className="divide-y divide-stone-warm/15">
          {exhibitions.map((ex) => {
            const year = new Date(ex.date).getFullYear()
            const desc = locale === 'es' ? ex.descEs : ex.descEn

            return (
              <div key={ex.id} className="exhibit-row py-8 opacity-0">
                <div className="grid grid-cols-[80px_1fr_auto] gap-6 items-start">
                  <span className="font-sans text-stone-warm text-sm tabular-nums pt-0.5">
                    {year}
                  </span>
                  <div>
                    <p className="font-serif text-base text-stone-dark">{ex.name}</p>
                    <p className="font-sans text-sm text-stone-warm mt-0.5">
                      {ex.venue}
                    </p>
                    {desc && (
                      <p className="font-sans text-sm text-stone-warm/70 mt-3 leading-relaxed max-w-prose">
                        {desc}
                      </p>
                    )}
                    {ex.photos.length > 0 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                        {ex.photos.slice(0, 6).map((photo) => (
                          <div
                            key={photo.id}
                            className="relative shrink-0 h-20 aspect-square overflow-hidden bg-ivory-dark"
                          >
                            <Image
                              src={photo.url}
                              alt=""
                              fill
                              className="object-cover grayscale"
                              sizes="80px"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-sans text-xs text-stone-warm/60 self-start text-right">
                    {ex.city}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
