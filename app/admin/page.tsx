import { db } from '@/lib/db'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import DeleteCollectionButton from './DeleteCollectionButton'
import TogglePublishButton from './TogglePublishButton'

export default async function AdminDashboard() {
  const collections = await db.collection.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { photos: true } } },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-serif text-2xl">Colecciones</h1>
        <Link
          href="/admin/colecciones/nueva"
          className="text-xs uppercase tracking-widest border border-stone-dark px-4 py-2 hover:bg-stone-dark hover:text-ivory transition-all duration-[400ms]"
        >
          Nueva coleccion
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {collections.map((col) => (
          <div key={col.id} className="py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base truncate">{col.titleEs}</p>
              <p className="text-xs text-stone-warm mt-0.5">
                {col._count.photos} fotos &middot; /{col.slug}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <TogglePublishButton id={col.id} published={col.published} />
              <Link
                href={`/admin/colecciones/${col.id}`}
                className="text-xs text-stone-warm hover:text-stone-dark transition-colors duration-[400ms]"
              >
                Editar
              </Link>
              <DeleteCollectionButton id={col.id} title={col.titleEs} />
            </div>
          </div>
        ))}

        {collections.length === 0 && (
          <p className="py-12 text-center text-stone-warm font-serif italic">
            No hay colecciones aun.
          </p>
        )}
      </div>
    </div>
  )
}
