'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface PhotoCardProps {
  slug: string
  titleEs: string
  titleEn: string
  coverImage: string
  className?: string
}

export default function PhotoCard({
  slug,
  titleEs,
  titleEn,
  coverImage,
  className = '',
}: PhotoCardProps) {
  const locale = useLocale()
  const title = locale === 'es' ? titleEs : titleEn

  return (
    <Link
      href={`/${locale}/colecciones/${slug}`}
      className={`group relative block overflow-hidden bg-ivory-dark ${className}`}
    >
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      {/* Title overlay on hover */}
      <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] bg-gradient-to-t from-stone-dark/60 to-transparent">
        <span className="font-serif text-ivory-light text-xl">{title}</span>
      </div>
    </Link>
  )
}
