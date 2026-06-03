'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

interface StatementProps {
  text?: string
}

export default function Statement({ text }: StatementProps) {
  const t = useTranslations('statement')
  const displayText = text || t('text')
  const ref = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in on enter
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        },
      )

      // Slow horizontal drift as the section scrolls through the viewport
      gsap.fromTo(
        textRef.current,
        { x: 20 },
        {
          x: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      className="bg-stone-dark py-32 md:py-48 px-6"
    >
      <div className="max-w-3xl mx-auto text-center">
        <p
          ref={textRef}
          className="font-serif italic text-2xl md:text-4xl text-ivory leading-relaxed opacity-0"
        >
          &ldquo;{displayText}&rdquo;
        </p>
      </div>
    </section>
  )
}
