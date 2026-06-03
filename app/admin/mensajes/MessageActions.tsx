'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  read: boolean
}

export default function MessageActions({ id, read }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  async function markRead() {
    await fetch(`/api/mensajes/${id}`, { method: 'PATCH' })
    setDone(true)
    startTransition(() => router.refresh())
  }

  async function remove() {
    if (!confirm('¿Eliminar este mensaje?')) return
    await fetch(`/api/mensajes/${id}`, { method: 'DELETE' })
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex items-center gap-4 mt-3">
      {!read && !done && (
        <button
          onClick={markRead}
          disabled={pending}
          className="text-xs text-stone-warm hover:text-stone-dark transition-colors duration-[400ms] disabled:opacity-50"
        >
          Marcar como leido
        </button>
      )}
      <button
        onClick={remove}
        disabled={pending}
        className="text-xs text-red-400 hover:text-red-600 transition-colors duration-[400ms] disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  )
}
