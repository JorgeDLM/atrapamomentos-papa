'use client'

import { useState } from 'react'
import ExhibitionForm from '@/components/admin/ExhibitionForm'
import DropZone from '@/components/admin/DropZone'
import SortableGrid, { type PhotoItem } from '@/components/admin/SortableGrid'
import type { Exhibition, ExhibitionPhoto } from '@prisma/client'

interface Props {
  exhibition: Exhibition
  photos: ExhibitionPhoto[]
}

export default function ExhibitionEditorClient({ exhibition, photos: initial }: Props) {
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
        <h1 className="font-serif text-2xl mb-10">Editar — {exhibition.name}</h1>
        <ExhibitionForm exhibition={exhibition} />
      </div>

      <div>
        <h2 className="font-serif text-lg mb-6">Fotos</h2>
        <div data-dropzone="gallery" className="space-y-3">
          <DropZone
            saveEndpoint={`/api/exposiciones/${exhibition.id}/fotos`}
            onUpload={handleUpload}
          />
          <SortableGrid
            photos={photos}
            endpoint="/api/exposiciones/fotos"
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        </div>
      </div>
    </div>
  )
}
