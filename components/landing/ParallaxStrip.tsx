'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxStripProps {
  imageUrl: string
}

export default function ParallaxStrip({ imageUrl }: ParallaxStripProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgRef.current,
        { yPercent: -15 },
        {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="relative h-[45vh] md:h-[60vh] overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-x-0 h-[130%] -top-[15%] bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-stone-dark/20" />
    </div>
  )
}
