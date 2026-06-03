'use client'

import { useRouter } from 'next/navigation'

interface Props {
  id: string
  title: string
}

export default function DeleteCollectionButton({ id, title }: Props) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Eliminar "${title}"? Esta accion no se puede deshacer.`)) return
    await fetch(`/api/colecciones/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-stone-warm/50 hover:text-red-600 transition-colors duration-[400ms]"
    >
      Eliminar
    </button>
  )
}
