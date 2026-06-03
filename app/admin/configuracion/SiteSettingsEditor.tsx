'use client'

import { useState } from 'react'
import ImageUploadField from '@/components/admin/ImageUploadField'

interface Settings {
  phone: string
  heroImageUrl: string
  heroImageCloudinaryId: string
  portraitUrl: string
  portraitCloudinaryId: string
  bioEs: string
  bioEn: string
  statementEs: string
  statementEn: string
}

interface Props {
  initial: Settings
}

export default function SiteSettingsEditor({ initial }: Props) {
  const [settings, setSettings] = useState<Settings>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)

    const res = await fetch('/api/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })

    if (res.ok) {
      setSaved(true)
    } else {
      setError('Error al guardar. Intenta de nuevo.')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-16">
      {/* Phone */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Telefono</h2>
          <p className="text-sm text-stone-warm mt-1">Aparece de forma sutil en la seccion de contacto. Deja vacio para no mostrarlo.</p>
        </div>
        <input
          type="tel"
          value={settings.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+52 xxx xxx xxxx"
          className="w-full max-w-xs border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms]"
        />
      </section>

      {/* Hero */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Portada</h2>
          <p className="text-sm text-stone-warm mt-1">La foto de fondo al abrir la pagina.</p>
        </div>
        <ImageUploadField
          label="Foto de portada"
          value={settings.heroImageUrl}
          onChange={({ url, cloudinaryId }) => {
            update('heroImageUrl', url)
            update('heroImageCloudinaryId', cloudinaryId)
          }}
        />
      </section>

      {/* Portrait */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Retrato</h2>
          <p className="text-sm text-stone-warm mt-1">La foto de Jorge en la seccion "Sobre".</p>
        </div>
        <ImageUploadField
          label="Foto de retrato"
          value={settings.portraitUrl}
          onChange={({ url, cloudinaryId }) => {
            update('portraitUrl', url)
            update('portraitCloudinaryId', cloudinaryId)
          }}
        />
      </section>

      {/* Bio */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Biografia</h2>
          <p className="text-sm text-stone-warm mt-1">El texto de presentacion en la seccion "Sobre Jorge".</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">Espanol</label>
            <textarea
              value={settings.bioEs}
              onChange={(e) => update('bioEs', e.target.value)}
              rows={5}
              className="w-full border border-gray-200 p-3 text-sm text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">Ingles</label>
            <textarea
              value={settings.bioEn}
              onChange={(e) => update('bioEn', e.target.value)}
              rows={5}
              className="w-full border border-gray-200 p-3 text-sm text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
            />
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Frase principal</h2>
          <p className="text-sm text-stone-warm mt-1">La cita en cursiva sobre fondo oscuro entre las secciones.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">Espanol</label>
            <input
              type="text"
              value={settings.statementEs}
              onChange={(e) => update('statementEs', e.target.value)}
              className="w-full border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">Ingles</label>
            <input
              type="text"
              value={settings.statementEn}
              onChange={(e) => update('statementEn', e.target.value)}
              className="w-full border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms]"
            />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer text-xs uppercase tracking-widest border border-stone-dark px-6 py-3 hover:bg-stone-dark hover:text-ivory transition-all duration-[400ms] disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && <p className="text-sm text-green-700">Cambios guardados correctamente.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
