'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

interface BioProps {
  portraitUrl: string
  bioEs: string
  bioEn: string
  locale: string
}

export default function Bio({ portraitUrl, bioEs, bioEn, locale }: BioProps) {
  const t = useTranslations('bio')
  const ref = useRef<HTMLElement>(null)
  const text = locale === 'es' ? bioEs : bioEn

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = ref.current?.querySelectorAll('.animate-in') ?? []
      gsap.fromTo(
        Array.from(items),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 65%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="sobre" className="py-24 md:py-40 px-6 md:px-12 bg-ivory-dark">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
        <div className="animate-in relative aspect-[3/4] max-w-sm mx-auto md:mx-0 overflow-hidden">
          <Image
            src={portraitUrl}
            alt="Jorge de la Mora Toscana"
            fill
            className="object-cover grayscale"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>

        <div>
          <h2 className="animate-in font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-8">
            {t('title')}
          </h2>
          <p className="animate-in font-serif text-xl md:text-2xl leading-relaxed text-stone-dark">
            {text}
          </p>
        </div>
      </div>
    </section>
  )
}
