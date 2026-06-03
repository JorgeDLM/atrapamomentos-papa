'use client'

import { useState } from 'react'
import CollectionForm from '@/components/admin/CollectionForm'
import DropZone from '@/components/admin/DropZone'
import SortableGrid, { type PhotoItem } from '@/components/admin/SortableGrid'
import type { Collection, Photo } from '@prisma/client'

interface Props {
  collection: Collection
  photos: Photo[]
}

export default function CollectionEditorClient({ collection, photos: initial }: Props) {
  const [photos, setPhotos] = useState<PhotoItem[]>(initial as PhotoItem[])

  function handleUpload(photo: PhotoItem) {
    setPhotos(prev => [...prev, photo])
  }

  function handleDelete(id: string) {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  function handleReorder(updated: PhotoItem[]) {
    setPhotos(updated)
  }

  return (
    <div className="space-y-16">
      <div>
        <h1 className="font-serif text-2xl mb-10">Editar — {collection.titleEs}</h1>
        <CollectionForm collection={collection} />
      </div>

      <div>
        <h2 className="font-serif text-lg mb-6">Fotos</h2>
        <div data-dropzone="gallery" className="space-y-3">
          <DropZone
            saveEndpoint="/api/fotos"
            saveExtra={{ collectionId: collection.id }}
            onUpload={handleUpload}
          />
          <SortableGrid
            photos={photos}
            endpoint="/api/fotos"
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        </div>
      </div>
    </div>
  )
}
