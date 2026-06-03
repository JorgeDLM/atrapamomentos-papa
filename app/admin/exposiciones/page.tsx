import { db } from '@/lib/db'
import Link from 'next/link'
import DeleteExhibitionButton from './DeleteExhibitionButton'
import ToggleExhibitionButton from './ToggleExhibitionButton'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long' }).format(date)
}

export default async function ExposicionesPage() {
  const exhibitions = await db.exhibition.findMany({
    orderBy: { date: 'desc' },
    include: { _count: { select: { photos: true } } },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-serif text-2xl">Exposiciones</h1>
        <Link
          href="/admin/exposiciones/nueva"
          className="text-xs uppercase tracking-widest border border-stone-dark px-4 py-2 hover:bg-stone-dark hover:text-ivory transition-all duration-[400ms]"
        >
          Nueva exposicion
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {exhibitions.map((ex) => (
          <div key={ex.id} className="py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base truncate">{ex.name}</p>
              <p className="text-xs text-stone-warm mt-0.5">
                {ex.venue}, {ex.city} &middot; {formatDate(ex.date)} &middot; {ex._count.photos} fotos
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <ToggleExhibitionButton id={ex.id} published={ex.published} />
              <Link
                href={`/admin/exposiciones/${ex.id}`}
                className="text-xs text-stone-warm hover:text-stone-dark transition-colors duration-[400ms]"
              >
                Editar
              </Link>
              <DeleteExhibitionButton id={ex.id} name={ex.name} />
            </div>
          </div>
        ))}

        {exhibitions.length === 0 && (
          <p className="py-12 text-center text-stone-warm font-serif italic">
            No hay exposiciones aun.
          </p>
        )}
      </div>
    </div>
  )
}
