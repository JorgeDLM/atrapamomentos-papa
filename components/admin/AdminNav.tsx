import { signOut } from '@/lib/auth'

export default function AdminNav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="font-serif text-lg">Admin — Jorge de la Mora</span>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/admin/login' })
          }}
        >
          <button
            type="submit"
            className="text-sm text-stone-warm hover:text-stone-dark transition-colors duration-[400ms]"
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </header>
  )
}
