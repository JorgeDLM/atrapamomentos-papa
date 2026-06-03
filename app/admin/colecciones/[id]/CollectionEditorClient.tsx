'use client'

import { useState } from 'react'
import CollectionForm from '@/components/admin/CollectionForm'
import PhotoUploader from '@/components/admin/PhotoUploader'
import PhotoGrid from '@/components/admin/PhotoGrid'
import type { Collection, Photo } from '@prisma/client'

interface Props {
  collection: Collection
  photos: Photo[]
}

export default function CollectionEditorClient({ collection, photos: initial }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initial)

  function handleUpload(newPhoto: Photo) {
    setPhotos((prev) => [...prev, newPhoto])
  }

  function handleDelete(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-16">
      <div>
        <h1 className="font-serif text-2xl mb-10">
          Editar — {collection.titleEs}
        </h1>
        <CollectionForm collection={collection} />
      </div>

      <div>
        <h2 className="font-serif text-lg mb-6">Fotos</h2>
        <div className="space-y-4">
          <PhotoUploader collectionId={collection.id} onUpload={handleUpload as any} />
          <PhotoGrid photos={photos as any} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}
