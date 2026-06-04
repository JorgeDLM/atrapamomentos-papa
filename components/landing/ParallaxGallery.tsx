'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations, useLocale } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

export interface GalleryPhoto {
  id: string
  url: string
  width: number
  height: number
  collectionSlug: string
  collectionTitleEs: string
  collectionTitleEn: string
}

interface ParallaxGalleryProps {
  photos: GalleryPhoto[]
}

// Different parallax depths per column position create a layered, organic feel.
const PARALLAX_DEPTHS = [7, 11, 9, 13]

const IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw'

interface GalleryTileProps {
  photo: GalleryPhoto
  title: string
  href: string
  viewLabel: string
}

/**
 * A single masonry tile. Shows an animated shimmer skeleton while its photo
 * loads, then fades/unblurs the image in — giving the gallery time to load
 * gracefully instead of popping in half-rendered.
 */
function GalleryTile({ photo, title, href, viewLabel }: GalleryTileProps) {
  const [loaded, setLoaded] = useState(false)
  const ratio = photo.width && photo.height ? photo.width / photo.height : 0.8

  return (
    <Link
      href={href}
      className="pg-tile group relative mb-3 block w-full overflow-hidden break-inside-avoid bg-ivory-dark"
      style={{ aspectRatio: String(ratio) }}
    >
      {/* Loading shimmer — fades out once the photo is ready */}
      <div
        aria-hidden
        className={`pg-shimmer absolute inset-0 transition-opacity duration-700 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Parallax frame — taller than the tile so it can drift on scroll */}
      <div className="pg-inner absolute inset-x-0 -top-[13%] h-[126%] will-change-transform">
        <Image
          src={photo.url}
          alt={title}
          fill
          sizes={IMAGE_SIZES}
          quality={90}
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-all duration-[1200ms] ease-out group-hover:scale-[1.05] ${
            loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
          }`}
        />
      </div>

      {/* Hover scrim + collection label */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-t from-stone-dark/75 via-stone-dark/10 to-transparent">
        <span className="font-serif text-ivory-light text-lg md:text-xl leading-tight [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
          {title}
        </span>
        <span className="mt-2 text-[0.65rem] uppercase tracking-[0.25em] text-ivory-light/80 font-sans">
          {viewLabel} &rarr;
        </span>
      </div>
    </Link>
  )
}

export default function ParallaxGallery({ photos }: ParallaxGalleryProps) {
  const t = useTranslations('gallery')
  const tCollections = useTranslations('collections')
  const locale = useLocale()
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (photos.length === 0) return
    const ctx = gsap.context(() => {
      const tiles = gsap.utils.toArray<HTMLElement>('.pg-tile')
      if (tiles.length === 0) return

      // Staggered reveal as tiles enter the viewport (batched for performance).
      gsap.set(tiles, { opacity: 0, y: 32 })
      ScrollTrigger.batch(tiles, {
        start: 'top 92%',
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.09,
            ease: 'power3.out',
            overwrite: true,
          }),
      })

      // Subtle per-tile parallax — the image drifts inside its frame on scroll.
      tiles.forEach((tile, i) => {
        const inner = tile.querySelector<HTMLElement>('.pg-inner')
        if (!inner) return
        const depth = PARALLAX_DEPTHS[i % PARALLAX_DEPTHS.length]
        gsap.fromTo(
          inner,
          { yPercent: -depth },
          {
            yPercent: depth,
            ease: 'none',
            scrollTrigger: {
              trigger: tile,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      ScrollTrigger.refresh()
    }, sectionRef)

    return () => ctx.revert()
  }, [photos.length])

  if (photos.length === 0) return null

  return (
    <section
      ref={sectionRef}
      id="galeria"
      className="bg-ivory py-24 md:py-40 px-4 md:px-10"
    >
      <div className="max-w-[88rem] mx-auto">
        {/* Header */}
        <div className="mb-14 md:mb-20 flex items-end justify-between gap-6 px-2">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-accent mb-4 font-sans">
              {t('subtitle')}
            </p>
            <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-stone-dark leading-none">
              {t('title')}
            </h2>
          </div>
          <Link
            href={`/${locale}/colecciones`}
            className="hidden md:inline-block shrink-0 text-xs uppercase tracking-widest text-stone-warm hover:text-stone-dark border-b border-current pb-1 transition-colors duration-[400ms]"
          >
            {tCollections('viewAll')}
          </Link>
        </div>

        {/* Masonry — CSS columns keep layout stable while each image parallaxes */}
        <div className="[column-gap:0.75rem] columns-2 lg:columns-3">
          {photos.map((photo) => (
            <GalleryTile
              key={photo.id}
              photo={photo}
              title={locale === 'es' ? photo.collectionTitleEs : photo.collectionTitleEn}
              href={`/${locale}/colecciones/${photo.collectionSlug}`}
              viewLabel={tCollections('viewCollection')}
            />
          ))}
        </div>

        {/* Mobile view-all */}
        <div className="mt-12 text-center md:hidden">
          <Link
            href={`/${locale}/colecciones`}
            className="text-xs uppercase tracking-widest text-stone-warm border-b border-current pb-1"
          >
            {tCollections('viewAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
