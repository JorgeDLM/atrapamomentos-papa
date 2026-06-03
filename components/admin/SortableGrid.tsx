'use client'

import { useState } from 'react'
import Image from 'next/image'
import { XIcon, DragIcon } from './icons'

export interface PhotoItem {
  id: string
  url: string
  width: number
  height: number
  order: number
  cloudinaryId: string
  [key: string]: unknown
}

interface SortableGridProps {
  photos: PhotoItem[]
  /** Base endpoint used for PATCH /{id} and DELETE /{id} */
  endpoint: string
  onDelete:  (id: string) => void
  onReorder: (photos: PhotoItem[]) => void
}

export default function SortableGrid({
  photos,
  endpoint,
  onDelete,
  onReorder,
}: SortableGridProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId,     setOverId]     = useState<string | null>(null)

  // ── Reorder ──────────────────────────────────────────────────────────────
  function reorder(fromId: string, toId: string) {
    if (fromId === toId) return
    const list  = [...photos]
    const fromI = list.findIndex(p => p.id === fromId)
    const toI   = list.findIndex(p => p.id === toId)
    const [item] = list.splice(fromI, 1)
    list.splice(toI, 0, item)
    const updated = list.map((p, i) => ({ ...p, order: i }))
    onReorder(updated)
    // Persist all changed orders in parallel
    updated.forEach(p =>
      fetch(`${endpoint}/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: p.order }),
      }),
    )
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(photo: PhotoItem) {
    const res = await fetch(`${endpoint}/${photo.id}`, { method: 'DELETE' })
    if (res.ok) onDelete(photo.id)
  }

  if (photos.length === 0) {
    return (
      <p className="py-8 text-xs uppercase tracking-widest text-stone-warm/50 text-center">
        Sin fotos
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {photos.map(photo => {
        const isDragging = photo.id === draggingId
        const isOver     = photo.id === overId && photo.id !== draggingId

        return (
          <div
            key={photo.id}
            draggable
            onDragStart={e => {
              setDraggingId(photo.id)
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('application/x-photo-id', photo.id)
            }}
            onDragEnd={() => {
              setDraggingId(null)
              setOverId(null)
            }}
            onDragOver={e => {
              // Ignore OS file drags
              if (e.dataTransfer.types.includes('Files')) return
              if (!e.dataTransfer.types.includes('application/x-photo-id')) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              setOverId(photo.id)
            }}
            onDragLeave={() => setOverId(null)}
            onDrop={e => {
              e.preventDefault()
              const fromId = e.dataTransfer.getData('application/x-photo-id')
              if (fromId) reorder(fromId, photo.id)
              setDraggingId(null)
              setOverId(null)
            }}
            className={`group relative aspect-square bg-stone-50 overflow-hidden select-none transition-all duration-300 ${
              isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
            } ${isOver ? 'ring-2 ring-stone-dark ring-offset-1' : ''}`}
          >
            <Image
              src={photo.url}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
              unoptimized
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-start justify-between p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]">
              {/* Drag handle */}
              <button
                className="w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm cursor-grab active:cursor-grabbing"
                onMouseDown={e => e.stopPropagation()}
              >
                <DragIcon className="w-3.5 h-3.5 text-stone-dark" />
              </button>

              {/* Delete */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleDelete(photo)
                }}
                className="w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-red-50 transition-colors duration-200"
              >
                <XIcon className="w-3.5 h-3.5 text-stone-dark hover:text-red-600" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
