'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function Contact() {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    const fd = new FormData(e.currentTarget)

    const res = await fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    fd.get('name'),
        email:   fd.get('email'),
        message: fd.get('message'),
      }),
    })

    setStatus(res.ok ? 'success' : 'error')
    if (res.ok) (e.target as HTMLFormElement).reset()
  }

  return (
    <section id="contacto" className="py-24 md:py-40 px-6 md:px-12 bg-ivory-dark">
      <div className="max-w-xl mx-auto">
        <h2 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h2>

        {status === 'success' ? (
          <p className="font-serif text-xl text-stone-dark">{t('success')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {(['name', 'email'] as const).map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-xs uppercase tracking-widest text-stone-warm mb-2"
                >
                  {t(field)}
                </label>
                <input
                  id={field}
                  name={field}
                  type={field === 'email' ? 'email' : 'text'}
                  required
                  className="w-full border-b border-stone-warm/40 bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms] placeholder:text-stone-warm/40"
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="message"
                className="block text-xs uppercase tracking-widest text-stone-warm mb-2"
              >
                {t('message')}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full border-b border-stone-warm/40 bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms] resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600">{t('error')}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="text-xs uppercase tracking-widest border-b border-stone-dark pb-1 hover:text-accent hover:border-accent transition-colors duration-[400ms] disabled:opacity-50"
            >
              {status === 'sending' ? t('sending') : t('send')}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
