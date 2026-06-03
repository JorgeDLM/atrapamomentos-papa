'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface PhotoItem {
  id: string
  url: string
  width: number
  height: number
  altEs: string | null
  altEn: string | null
}

interface LightboxProps {
  photos: PhotoItem[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function Lightbox({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const t = useTranslations('gallery')
  const photo = photos[currentIndex]

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      className="fixed inset-0 z-[100] bg-stone-dark/95 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt={photo.altEs ?? ''}
          width={photo.width}
          height={photo.height}
          className="max-h-[85vh] w-auto object-contain"
          priority
        />

        <p className="absolute bottom-0 left-0 right-0 text-center text-xs text-ivory/50 font-sans uppercase tracking-widest py-3">
          {currentIndex + 1} / {photos.length}
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-6 right-6 text-ivory/60 hover:text-ivory text-xs uppercase tracking-widest transition-colors duration-[400ms]"
        aria-label={t('close')}
      >
        {t('close')}
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        disabled={currentIndex === 0}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-2xl transition-colors duration-[400ms] disabled:opacity-20"
        aria-label={t('prev')}
      >
        &larr;
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        disabled={currentIndex === photos.length - 1}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-2xl transition-colors duration-[400ms] disabled:opacity-20"
        aria-label={t('next')}
      >
        &rarr;
      </button>
    </div>
  )
}
