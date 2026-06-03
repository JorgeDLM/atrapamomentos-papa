'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PhotoCard from './PhotoCard'

gsap.registerPlugin(ScrollTrigger)

interface CollectionItem {
  id: string
  slug: string
  titleEs: string
  titleEn: string
  coverImage: string
}

interface CollectionGridProps {
  collections: CollectionItem[]
}

export default function CollectionGrid({ collections }: CollectionGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gridRef.current ? Array.from(gridRef.current.children) : []
      if (items.length === 0) return

      gsap.fromTo(
        items,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={gridRef}
      className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3"
    >
      {collections.map((col) => (
        <div key={col.id} className="break-inside-avoid">
          <PhotoCard
            {...col}
            className="w-full aspect-[4/3]"
          />
        </div>
      ))}
    </div>
  )
}
