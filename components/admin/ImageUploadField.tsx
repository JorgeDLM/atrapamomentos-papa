'use client'

import { useState, useRef } from 'react'
import { uploadImageDirect } from './upload'

interface ImageUploadFieldProps {
  label: string
  value: string
  hint?: string
  onChange: (result: { url: string; cloudinaryId: string }) => void
}

export default function ImageUploadField({ label, value, hint, onChange }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const [error,     setError]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    setError('')
    try {
      const result = await uploadImageDirect(file)
      onChange({ url: result.url, cloudinaryId: result.cloudinaryId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-stone-warm">{label}</p>
      {hint && <p className="text-sm text-stone-warm/70">{hint}</p>}

      {value && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-full w-full object-cover" />
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) uploadFile(file)
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-[400ms] ${
          dragOver ? 'border-stone-dark bg-ivory-dark' : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) uploadFile(f)
            e.target.value = ''
          }}
        />
        {uploading ? (
          <p className="text-sm text-stone-warm">Subiendo...</p>
        ) : (
          <p className="text-sm text-stone-warm">
            {value ? 'Cambiar imagen' : 'Subir imagen'} — arrastra o haz clic
          </p>
        )}
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  )
}
