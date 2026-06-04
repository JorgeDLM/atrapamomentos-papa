'use client'

import { useState, useRef, useEffect } from 'react'
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

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  initial: Settings
}

export default function SiteSettingsEditor({ initial }: Props) {
  const [settings,   setSettings]   = useState<Settings>(initial)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const settingsRef  = useRef<Settings>(initial)
  const fadeTimer    = useRef<ReturnType<typeof setTimeout>>()

  // Keep ref in sync so saveNow always reads latest values
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      settingsRef.current = next
      return next
    })
  }

  async function saveNow(overrides?: Partial<Settings>) {
    const toSave = overrides
      ? { ...settingsRef.current, ...overrides }
      : settingsRef.current

    clearTimeout(fadeTimer.current)
    setSaveStatus('saving')

    const res = await fetch('/api/site-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSave),
    })

    if (res.ok) {
      setSaveStatus('saved')
      fadeTimer.current = setTimeout(() => setSaveStatus('idle'), 2500)
    } else {
      setSaveStatus('error')
      fadeTimer.current = setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  useEffect(() => () => clearTimeout(fadeTimer.current), [])

  return (
    <div className="space-y-16">

      {/* ── Save status indicator ── */}
      <div
        className={`fixed top-6 right-6 z-50 transition-all duration-500 pointer-events-none ${
          saveStatus === 'idle' ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
        }`}
      >
        {saveStatus === 'saving' && (
          <span className="text-xs uppercase tracking-widest text-stone-warm bg-white border border-gray-200 px-4 py-2 shadow-sm">
            Guardando…
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-xs uppercase tracking-widest text-green-700 bg-white border border-green-200 px-4 py-2 shadow-sm">
            ✓ Guardado
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="text-xs uppercase tracking-widest text-red-600 bg-white border border-red-200 px-4 py-2 shadow-sm">
            Error al guardar
          </span>
        )}
      </div>

      {/* ── Teléfono ── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Telefono</h2>
          <p className="text-sm text-stone-warm mt-1">
            Aparece de forma sutil en la seccion de contacto. Deja vacio para no mostrarlo.
          </p>
        </div>
        <input
          type="tel"
          value={settings.phone}
          onChange={(e) => update('phone', e.target.value)}
          onBlur={() => saveNow()}
          placeholder="+52 xxx xxx xxxx"
          className="w-full max-w-xs border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms]"
        />
      </section>

      {/* ── Portada ── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Portada</h2>
          <p className="text-sm text-stone-warm mt-1">La foto de fondo al abrir la pagina.</p>
        </div>
        <ImageUploadField
          label="Foto de portada"
          value={settings.heroImageUrl}
          onChange={({ url, cloudinaryId }) => {
            const overrides = { heroImageUrl: url, heroImageCloudinaryId: cloudinaryId }
            setSettings((prev) => { const n = { ...prev, ...overrides }; settingsRef.current = n; return n })
            saveNow(overrides)
          }}
        />
      </section>

      {/* ── Retrato ── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Retrato</h2>
          <p className="text-sm text-stone-warm mt-1">La foto de Jorge en la seccion "Sobre".</p>
        </div>
        <ImageUploadField
          label="Foto de retrato"
          value={settings.portraitUrl}
          onChange={({ url, cloudinaryId }) => {
            const overrides = { portraitUrl: url, portraitCloudinaryId: cloudinaryId }
            setSettings((prev) => { const n = { ...prev, ...overrides }; settingsRef.current = n; return n })
            saveNow(overrides)
          }}
        />
      </section>

      {/* ── Biografía ── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Biografia</h2>
          <p className="text-sm text-stone-warm mt-1">
            El texto de presentacion en la seccion "Sobre Jorge".
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">Espanol</label>
            <textarea
              value={settings.bioEs}
              onChange={(e) => update('bioEs', e.target.value)}
              onBlur={() => saveNow()}
              rows={5}
              className="w-full border border-gray-200 p-3 text-sm text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">Ingles</label>
            <textarea
              value={settings.bioEn}
              onChange={(e) => update('bioEn', e.target.value)}
              onBlur={() => saveNow()}
              rows={5}
              className="w-full border border-gray-200 p-3 text-sm text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
            />
          </div>
        </div>
      </section>

      {/* ── Frase principal ── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-lg">Frase principal</h2>
          <p className="text-sm text-stone-warm mt-1">
            La cita en cursiva sobre fondo oscuro entre las secciones.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">Espanol</label>
            <input
              type="text"
              value={settings.statementEs}
              onChange={(e) => update('statementEs', e.target.value)}
              onBlur={() => saveNow()}
              className="w-full border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">Ingles</label>
            <input
              type="text"
              value={settings.statementEn}
              onChange={(e) => update('statementEn', e.target.value)}
              onBlur={() => saveNow()}
              className="w-full border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms]"
            />
          </div>
        </div>
      </section>

    </div>
  )
}
