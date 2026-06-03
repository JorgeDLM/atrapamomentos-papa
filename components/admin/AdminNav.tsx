'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function AdminNav() {
  const path = usePathname()
  const isExpo = path.startsWith('/admin/exposiciones')
  const isConfig = path.startsWith('/admin/configuracion')
  const isMensajes = path.startsWith('/admin/mensajes')
  const isCollections = !isExpo && !isConfig && !isMensajes

  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetch('/api/mensajes/unread')
      .then((r) => r.json())
      .then((d) => setUnread(d.count ?? 0))
      .catch(() => {})
  }, [path])

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <nav className="flex items-center gap-8">
          <Link
            href="/admin"
            className={`text-sm transition-colors duration-[400ms] ${
              isCollections ? 'text-stone-dark' : 'text-stone-warm hover:text-stone-dark'
            }`}
          >
            Colecciones
          </Link>
          <Link
            href="/admin/exposiciones"
            className={`text-sm transition-colors duration-[400ms] ${
              isExpo ? 'text-stone-dark' : 'text-stone-warm hover:text-stone-dark'
            }`}
          >
            Exposiciones
          </Link>
          <Link
            href="/admin/mensajes"
            className={`relative text-sm transition-colors duration-[400ms] ${
              isMensajes ? 'text-stone-dark' : 'text-stone-warm hover:text-stone-dark'
            }`}
          >
            Mensajes
            {unread > 0 && (
              <span className="absolute -top-1 -right-3 text-[10px] font-sans text-accent">
                {unread}
              </span>
            )}
          </Link>
          <Link
            href="/admin/configuracion"
            className={`text-sm transition-colors duration-[400ms] ${
              isConfig ? 'text-stone-dark' : 'text-stone-warm hover:text-stone-dark'
            }`}
          >
            Ajustes
          </Link>
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-stone-warm hover:text-stone-dark transition-colors duration-[400ms]"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
