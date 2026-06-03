'use client'

import { useRouter } from 'next/navigation'

interface Props {
  id: string
  name: string
}

export default function DeleteExhibitionButton({ id, name }: Props) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Eliminar "${name}"?`)) return
    await fetch(`/api/exposiciones/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-stone-warm hover:text-red-600 transition-colors duration-[400ms]"
    >
      Eliminar
    </button>
  )
}
