'use client'

import Image from 'next/image'

interface PhotoItem {
  id: string
  url: string
  width: number
  height: number
  altEs: string | null
  altEn: string | null
  order: number
  collectionId: string
  cloudinaryId: string
  createdAt: string
}

interface PhotoGridProps {
  photos: PhotoItem[]
  onDelete: (id: string) => void
}

export default function PhotoGrid({ photos, onDelete }: PhotoGridProps) {
  async function handleDelete(photo: PhotoItem) {
    if (!confirm('Eliminar esta foto?')) return
    await fetch(`/api/fotos/${photo.id}`, { method: 'DELETE' })
    onDelete(photo.id)
  }

  if (photos.length === 0) {
    return (
      <p className="text-sm text-stone-warm italic py-8">
        No hay fotos aun. Sube la primera arriba.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="group relative aspect-square bg-ivory-dark overflow-hidden">
          <Image
            src={photo.url}
            alt={photo.altEs ?? ''}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <button
            onClick={() => handleDelete(photo)}
            className="absolute inset-0 flex items-center justify-center bg-stone-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] text-ivory text-xs uppercase tracking-widest"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  )
}
