'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Exhibition } from '@prisma/client'

interface ExhibitionFormProps {
  exhibition?: Exhibition
}

export default function ExhibitionForm({ exhibition }: ExhibitionFormProps) {
  const router = useRouter()
  const isEdit = !!exhibition
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Format date for input[type=date]
  const defaultDate = exhibition
    ? new Date(exhibition.date).toISOString().split('T')[0]
    : ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const data = {
      name:   fd.get('name'),
      venue:  fd.get('venue'),
      city:   fd.get('city'),
      date:   fd.get('date'),
      descEs: fd.get('descEs') || undefined,
      descEn: fd.get('descEn') || undefined,
    }

    const url    = isEdit ? `/api/exposiciones/${exhibition!.id}` : '/api/exposiciones'
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
    router.push(`/admin/exposiciones/${saved.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div>
        <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
          Nombre
        </label>
        <input
          name="name"
          required
          defaultValue={exhibition?.name ?? ''}
          className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
            Lugar
          </label>
          <input
            name="venue"
            required
            defaultValue={exhibition?.venue ?? ''}
            className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms]"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
            Ciudad
          </label>
          <input
            name="city"
            required
            defaultValue={exhibition?.city ?? ''}
            className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
          Fecha
        </label>
        <input
          name="date"
          type="date"
          required
          defaultValue={defaultDate}
          className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
            Descripcion (ES)
          </label>
          <textarea
            name="descEs"
            rows={4}
            defaultValue={exhibition?.descEs ?? ''}
            className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
            Description (EN)
          </label>
          <textarea
            name="descEn"
            rows={4}
            defaultValue={exhibition?.descEn ?? ''}
            className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="text-xs uppercase tracking-widest border border-stone-dark px-6 py-3 hover:bg-stone-dark hover:text-ivory transition-all duration-[400ms] disabled:opacity-50"
      >
        {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear exposicion'}
      </button>
    </form>
  )
}
