'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { uploadImage, type UploadedPhoto } from './upload'
import { UploadIcon, SpinnerIcon } from './icons'

interface DropZoneProps {
  saveEndpoint: string
  saveExtra?: Record<string, string>
  onUpload: (photo: UploadedPhoto) => void
}

export default function DropZone({ saveEndpoint, saveExtra = {}, onUpload }: DropZoneProps) {
  const [globalDrag, setGlobalDrag] = useState(false)
  const [localDrag, setLocalDrag] = useState(false)
  const [uploading, setUploading]  = useState(0)   // count of in-flight uploads
  const [error, setError]          = useState('')
  const inputRef   = useRef<HTMLInputElement>(null)
  const dragCount  = useRef(0)

  // ── Global drag detection (files entering the browser window) ──────────────
  useEffect(() => {
    function onEnter(e: DragEvent) {
      if (!e.dataTransfer?.types.includes('Files')) return
      dragCount.current++
      setGlobalDrag(true)
    }
    function onLeave() {
      dragCount.current = Math.max(0, dragCount.current - 1)
      if (dragCount.current === 0) setGlobalDrag(false)
    }
    function onReset() {
      dragCount.current = 0
      setGlobalDrag(false)
    }
    function onOver(e: DragEvent) { e.preventDefault() }

    document.addEventListener('dragenter', onEnter)
    document.addEventListener('dragleave', onLeave)
    document.addEventListener('drop',      onReset)
    document.addEventListener('dragover',  onOver)
    window.addEventListener('blur', onReset)

    return () => {
      document.removeEventListener('dragenter', onEnter)
      document.removeEventListener('dragleave', onLeave)
      document.removeEventListener('drop',      onReset)
      document.removeEventListener('dragover',  onOver)
      window.removeEventListener('blur', onReset)
    }
  }, [])

  // ── Paste support ──────────────────────────────────────────────────────────
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = Array.from(e.clipboardData?.files ?? []).filter(f =>
        f.type.startsWith('image/'),
      )
      if (files.length > 0) handleFiles(files)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveEndpoint, JSON.stringify(saveExtra)])

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'))
    if (!images.length) return
    setError('')

    for (const file of images) {
      setUploading(n => n + 1)
      try {
        const photo = await uploadImage(file, saveEndpoint, saveExtra)
        onUpload(photo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir')
      } finally {
        setUploading(n => n - 1)
      }
    }
  }, [saveEndpoint, saveExtra, onUpload])

  function fromDrop(e: React.DragEvent) {
    e.preventDefault()
    setLocalDrag(false)
    setGlobalDrag(false)
    dragCount.current = 0
    handleFiles(Array.from(e.dataTransfer.files))
  }

  const isActive = localDrag || uploading > 0

  return (
    <>
      {/* ── Full-screen overlay ───────────────────────────────────────────── */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={fromDrop}
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          globalDrag
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-white/92 backdrop-blur-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5 border border-dashed border-stone-dark/25 w-80 h-56 justify-center transition-all duration-[400ms]">
            <UploadIcon className="w-7 h-7 text-stone-warm" />
            <p className="text-xs uppercase tracking-[0.25em] text-stone-dark">
              Suelta aqui
            </p>
          </div>
        </div>
      </div>

      {/* ── Inline drop zone ─────────────────────────────────────────────── */}
      <div
        onDragOver={e => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          setLocalDrag(true)
        }}
        onDragLeave={() => setLocalDrag(false)}
        onDrop={fromDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center gap-3 py-10 border border-dashed cursor-pointer select-none transition-all duration-[400ms] ${
          isActive
            ? 'border-stone-dark/40 bg-stone-dark/[0.02]'
            : 'border-gray-200 hover:border-gray-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => {
            handleFiles(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />

        {uploading > 0 ? (
          <>
            <SpinnerIcon className="w-5 h-5 text-stone-warm animate-spin" />
            <p className="text-xs uppercase tracking-widest text-stone-warm">
              Subiendo{uploading > 1 ? ` ${uploading}` : ''}…
            </p>
          </>
        ) : (
          <>
            <UploadIcon className="w-5 h-5 text-stone-warm/60 group-hover:text-stone-warm transition-colors duration-[400ms]" />
            <p className="text-xs uppercase tracking-widest text-stone-warm">
              Arrastra, pega o{' '}
              <span className="underline underline-offset-2">selecciona</span>
            </p>
          </>
        )}

        {error && (
          <p className="absolute bottom-3 text-xs text-red-500">{error}</p>
        )}
      </div>
    </>
  )
}
