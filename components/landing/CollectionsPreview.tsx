'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import PhotoCard from '@/components/gallery/PhotoCard'

gsap.registerPlugin(ScrollTrigger)

interface CollectionItem {
  id: string
  slug: string
  titleEs: string
  titleEn: string
  coverImage: string
}

interface CollectionsPreviewProps {
  collections: CollectionItem[]
}

export default function CollectionsPreview({ collections }: CollectionsPreviewProps) {
  const t = useTranslations('collections')
  const locale = useLocale()
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  if (collections.length === 0) return null

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gridRef.current ? Array.from(gridRef.current.children) : []
      if (items.length === 0) return

      gsap.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  const featured = collections.slice(0, 4)

  return (
    <section ref={sectionRef} id="colecciones" className="py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h2>

        {/* Asymmetric editorial grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
          {featured[0] && (
            <div className="md:col-span-2 aspect-[4/3]">
              <PhotoCard {...featured[0]} className="h-full" parallax sizes="(max-width: 768px) 100vw, 66vw" />
            </div>
          )}
          {(featured[1] || featured[2]) && (
            <div className="flex flex-col gap-3">
              {featured[1] && (
                <div className="flex-1 aspect-square">
                  <PhotoCard {...featured[1]} className="h-full" parallax sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
              {featured[2] && (
                <div className="flex-1 aspect-square">
                  <PhotoCard {...featured[2]} className="h-full" parallax sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              )}
            </div>
          )}
          {featured[3] && (
            <div className="md:col-span-3 aspect-[21/9]">
              <PhotoCard {...featured[3]} className="h-full" parallax sizes="100vw" />
            </div>
          )}
        </div>

        <div className="text-right">
          <Link
            href={`/${locale}/colecciones`}
            className="text-xs uppercase tracking-widest text-stone-warm hover:text-stone-dark border-b border-current pb-1 transition-colors duration-[400ms]"
          >
            {t('viewAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
