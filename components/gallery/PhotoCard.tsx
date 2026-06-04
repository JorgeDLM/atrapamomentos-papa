'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface PhotoCardProps {
  slug: string
  titleEs: string
  titleEn: string
  coverImage: string
  className?: string
  parallax?: boolean
  /** Responsive sizes hint — must match the slot's real display width so Next
   *  serves a source large enough to stay sharp on this photography site. */
  sizes?: string
}

export default function PhotoCard({
  slug,
  titleEs,
  titleEn,
  coverImage,
  className = '',
  parallax = false,
  sizes = '(max-width: 768px) 100vw, 70vw',
}: PhotoCardProps) {
  const locale = useLocale()
  const title = locale === 'es' ? titleEs : titleEn
  const linkRef = useRef<HTMLAnchorElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!parallax || !innerRef.current || !linkRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: linkRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [parallax])

  return (
    <Link
      ref={linkRef}
      href={`/${locale}/colecciones/${slug}`}
      className={`group relative block overflow-hidden bg-ivory-dark ${className}`}
    >
      <div
        ref={innerRef}
        className={parallax ? 'absolute inset-x-0 h-[116%] -top-[8%]' : 'relative w-full h-full overflow-hidden'}
      >
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes={sizes}
          quality={95}
          className={`object-cover transition-transform duration-700 ease-out ${parallax ? '' : 'group-hover:scale-[1.03]'}`}
        />
      </div>

      {/* Title overlay on hover */}
      <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] bg-gradient-to-t from-stone-dark/60 to-transparent">
        <span className="font-serif text-ivory-light text-xl">{title}</span>
      </div>
    </Link>
  )
}
