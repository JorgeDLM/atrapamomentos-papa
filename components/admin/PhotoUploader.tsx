'use client'

import { useState, useRef } from 'react'

interface UploadedPhoto {
  id: string
  url: string
  cloudinaryId: string
  width: number
  height: number
  altEs: string | null
  altEn: string | null
  order: number
  collectionId: string
  createdAt: string
}

interface PhotoUploaderProps {
  collectionId: string
  onUpload: (photo: UploadedPhoto) => void
}

export default function PhotoUploader({ collectionId, onUpload }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)

    try {
      // Get signed upload params from our API
      const sigRes = await fetch('/api/upload-signature')
      const { timestamp, signature, apiKey } = await sigRes.json()

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'jorge-portfolio')
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('api_key', apiKey)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      )

      if (!uploadRes.ok) {
        setError('Error al subir la imagen. Intenta de nuevo.')
        return
      }

      const uploaded = await uploadRes.json()

      // Save metadata to our DB
      const saveRes = await fetch('/api/fotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinaryId: uploaded.public_id,
          width:        uploaded.width,
          height:       uploaded.height,
          collectionId,
        }),
      })

      if (!saveRes.ok) {
        setError('Error al guardar la foto. Intenta de nuevo.')
        return
      }

      const photo = await saveRes.json()
      setError('')
      onUpload(photo)
    } finally {
      setUploading(false)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors duration-[400ms] ${
        dragOver
          ? 'border-stone-dark bg-ivory-dark'
          : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && (
        <p className="text-xs text-red-600 mt-3">{error}</p>
      )}
      {uploading ? (
        <p className="text-sm text-stone-warm">Subiendo...</p>
      ) : (
        <>
          <p className="text-sm text-stone-warm">
            Arrastra fotos aqui o haz clic para seleccionar
          </p>
          <p className="text-xs text-stone-warm/50 mt-1">JPG, PNG — multiples archivos</p>
        </>
      )}
    </div>
  )
}
