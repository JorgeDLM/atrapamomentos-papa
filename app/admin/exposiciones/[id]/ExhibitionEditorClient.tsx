'use client'

import { useState } from 'react'
import ExhibitionForm from '@/components/admin/ExhibitionForm'
import PhotoUploader from '@/components/admin/PhotoUploader'
import PhotoGrid from '@/components/admin/PhotoGrid'
import type { Exhibition, ExhibitionPhoto } from '@prisma/client'

interface Props {
  exhibition: Exhibition
  photos: ExhibitionPhoto[]
}

export default function ExhibitionEditorClient({ exhibition, photos: initial }: Props) {
  const [photos, setPhotos] = useState<ExhibitionPhoto[]>(initial)

  function handleUpload(newPhoto: ExhibitionPhoto) {
    setPhotos((prev) => [...prev, newPhoto])
  }

  function handleDelete(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-16">
      <div>
        <h1 className="font-serif text-2xl mb-10">
          Editar — {exhibition.name}
        </h1>
        <ExhibitionForm exhibition={exhibition} />
      </div>

      <div>
        <h2 className="font-serif text-lg mb-6">Fotos</h2>
        <div className="space-y-4">
          <PhotoUploader
            saveEndpoint={`/api/exposiciones/${exhibition.id}/fotos`}
            onUpload={handleUpload as any}
          />
          <PhotoGrid
            photos={photos as any}
            deleteEndpoint="/api/exposiciones/fotos"
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  )
}
