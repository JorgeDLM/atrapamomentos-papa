'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from '@/components/gallery/Lightbox'

interface PhotoItem {
  id: string
  url: string
  width: number
  height: number
  altEs: string | null
  altEn: string | null
}

interface Props {
  photos: PhotoItem[]
}

export default function SingleCollectionClient({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 space-y-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            className="break-inside-avoid w-full block relative overflow-hidden group cursor-pointer"
          >
            <Image
              src={photo.url}
              alt={photo.altEs ?? ''}
              width={photo.width}
              height={photo.height}
              className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))}
        />
      )}
    </>
  )
}
