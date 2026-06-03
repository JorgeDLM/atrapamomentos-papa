'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function AdminNav() {
  const path = usePathname()
  const isExpo = path.startsWith('/admin/exposiciones')

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <nav className="flex items-center gap-8">
          <Link
            href="/admin"
            className={`text-sm transition-colors duration-[400ms] ${
              !isExpo ? 'text-stone-dark' : 'text-stone-warm hover:text-stone-dark'
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
