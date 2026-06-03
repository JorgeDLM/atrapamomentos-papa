'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { uploadImageDirect } from './upload'
import { UploadIcon, SpinnerIcon, ImageIcon } from './icons'

interface CoverUploaderProps {
  defaultValue?: string
  name?: string
  required?: boolean
}

export default function CoverUploader({
  defaultValue = '',
  name = 'coverImage',
  required,
}: CoverUploaderProps) {
  const [url,       setUrl]       = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [localDrag, setLocalDrag] = useState(false)
  const [error,     setError]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    setError('')
    try {
      const result = await uploadImageDirect(file)
      setUrl(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  function fromDrop(e: React.DragEvent) {
    e.preventDefault()
    setLocalDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // Paste support (only when no global DropZone is present on the page)
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      // Only if this is the only focusable uploader — skip if a gallery DropZone is mounted
      const globalDropActive = document.querySelector('[data-dropzone="gallery"]')
      if (globalDropActive) return
      const file = e.clipboardData?.files[0]
      if (file?.type.startsWith('image/')) handleFile(file)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={url} required={required} />

      {url ? (
        // ── Has image — show preview ──────────────────────────────────────
        <div
          onDragOver={e => { e.preventDefault(); setLocalDrag(true) }}
          onDragLeave={() => setLocalDrag(false)}
          onDrop={fromDrop}
          onClick={() => inputRef.current?.click()}
          className={`group relative aspect-video max-w-sm overflow-hidden cursor-pointer border transition-all duration-[400ms] ${
            localDrag ? 'border-stone-dark' : 'border-gray-100'
          }`}
        >
          <Image
            src={url}
            alt="Portada"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-[400ms]">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] flex flex-col items-center gap-2">
              {uploading ? (
                <SpinnerIcon className="w-5 h-5 text-white animate-spin" />
              ) : (
                <>
                  <UploadIcon className="w-5 h-5 text-white" />
                  <p className="text-xs uppercase tracking-widest text-white">Cambiar</p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // ── No image — show drop zone ─────────────────────────────────────
        <div
          onDragOver={e => {
            if (!e.dataTransfer.types.includes('Files')) return
            e.preventDefault()
            setLocalDrag(true)
          }}
          onDragLeave={() => setLocalDrag(false)}
          onDrop={fromDrop}
          onClick={() => inputRef.current?.click()}
          className={`group flex flex-col items-center justify-center gap-3 aspect-video max-w-sm border border-dashed cursor-pointer transition-all duration-[400ms] ${
            localDrag
              ? 'border-stone-dark/40 bg-stone-dark/[0.02]'
              : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          {uploading ? (
            <SpinnerIcon className="w-5 h-5 text-stone-warm animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-stone-warm/40 group-hover:text-stone-warm transition-colors duration-[400ms]" />
              <p className="text-xs uppercase tracking-widest text-stone-warm/60 group-hover:text-stone-warm transition-colors duration-[400ms]">
                Foto de portada
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
