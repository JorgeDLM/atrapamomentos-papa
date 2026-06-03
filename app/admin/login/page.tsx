'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email:    fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })

    if (result?.error) {
      setError('Credenciales incorrectas')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="w-full max-w-sm">
        <Link
          href="/es"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-warm hover:text-stone-dark transition-colors duration-[400ms] mb-10"
        >
          ← Inicio
        </Link>

        <h1 className="font-serif text-2xl text-center mb-8">
          Jorge de la Mora
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-[400ms]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full mt-6 py-3 text-xs uppercase tracking-widest border border-stone-dark text-stone-dark hover:bg-stone-dark hover:text-ivory transition-all duration-[400ms] disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
