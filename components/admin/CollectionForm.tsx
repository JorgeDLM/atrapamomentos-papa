'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Collection } from '@prisma/client'
import CoverUploader from './CoverUploader'

interface CollectionFormProps {
  collection?: Collection
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter()
  const isEdit = !!collection
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slug, setSlug] = useState(collection?.slug ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const data = {
      titleEs:    fd.get('titleEs'),
      titleEn:    fd.get('titleEn'),
      descEs:     fd.get('descEs') || undefined,
      descEn:     fd.get('descEn') || undefined,
      slug:       fd.get('slug'),
      coverImage: fd.get('coverImage'),
    }

    const url    = isEdit ? `/api/colecciones/${collection!.id}` : '/api/colecciones'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    const saved = await res.json()
    router.push(`/admin/colecciones/${saved.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
            Titulo (ES)
          </label>
          <input
            name="titleEs"
            required
            defaultValue={collection?.titleEs ?? ''}
            onChange={(e) => { if (!isEdit) setSlug(toSlug(e.target.value)) }}
            className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms]"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
            Title (EN)
          </label>
          <input
            name="titleEn"
            required
            defaultValue={collection?.titleEn ?? ''}
            className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
          Slug (URL)
        </label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(toSlug(e.target.value))}
          required
          className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms] font-mono text-sm"
        />
        <p className="text-xs text-stone-warm/60 mt-1">/colecciones/{slug || '...'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
            Descripcion (ES)
          </label>
          <textarea
            name="descEs"
            rows={3}
            defaultValue={collection?.descEs ?? ''}
            className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
            Description (EN)
          </label>
          <textarea
            name="descEn"
            rows={3}
            defaultValue={collection?.descEn ?? ''}
            className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-stone-warm mb-3">
          Foto de portada
        </label>
        <CoverUploader
          defaultValue={collection?.coverImage ?? ''}
          name="coverImage"
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="text-xs uppercase tracking-widest border border-stone-dark px-6 py-3 hover:bg-stone-dark hover:text-ivory transition-all duration-[400ms] disabled:opacity-50"
      >
        {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear coleccion'}
      </button>
    </form>
  )
}
