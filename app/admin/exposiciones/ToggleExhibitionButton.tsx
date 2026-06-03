'use client'

import { useState } from 'react'

interface Props {
  id: string
  published: boolean
}

export default function ToggleExhibitionButton({ id, published: initial }: Props) {
  const [published, setPublished] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/exposiciones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    setPublished((p) => !p)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs uppercase tracking-widest transition-colors duration-[400ms] disabled:opacity-40 ${
        published ? 'text-stone-dark' : 'text-stone-warm hover:text-stone-dark'
      }`}
    >
      {published ? 'Publicada' : 'Borrador'}
    </button>
  )
}
