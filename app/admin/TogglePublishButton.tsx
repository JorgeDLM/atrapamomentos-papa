'use client'

import { useRouter } from 'next/navigation'

interface Props {
  id: string
  published: boolean
}

export default function TogglePublishButton({ id, published }: Props) {
  const router = useRouter()

  async function toggle() {
    await fetch(`/api/colecciones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      className={`text-xs uppercase tracking-widest transition-colors duration-[400ms] ${
        published
          ? 'text-green-700 hover:text-stone-warm'
          : 'text-stone-warm hover:text-stone-dark'
      }`}
    >
      {published ? 'Publicado' : 'Borrador'}
    </button>
  )
}
