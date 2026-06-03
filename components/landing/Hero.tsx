'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  imageUrl: string
}

export default function Hero({ imageUrl }: HeroProps) {
  const t = useTranslations('hero')
  const sectionRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background moves slower than scroll (classic parallax depth)
      gsap.to(bgRef.current, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Text fades out as you scroll
      gsap.to(textRef.current, {
        yPercent: 15,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden"
    >
      {/* Parallax background — taller than viewport to allow shift */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-[25%] h-[125%] bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Subtle overlay for text legibility */}
      <div className="absolute inset-0 bg-stone-dark/10" />

      {/* Centered text */}
      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-ivory-light"
      >
        <p className="text-xs uppercase tracking-[0.4em] mb-6 font-sans text-ivory-light/70">
          Photography
        </p>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-center leading-tight">
          Jorge de la Mora
          <br />
          <span className="italic font-light">Toscana</span>
        </h1>
        <div className="mt-16 flex flex-col items-center gap-3 text-ivory-light/50">
          <div className="w-px h-12 bg-ivory-light/30 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-sans">
            {t('scroll')}
          </span>
        </div>
      </div>
    </section>
  )
}
