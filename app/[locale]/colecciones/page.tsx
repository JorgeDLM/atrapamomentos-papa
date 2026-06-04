import { db } from '@/lib/db'
import { getTranslations } from 'next-intl/server'
import CollectionGrid from '@/components/gallery/CollectionGrid'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function CollectionsPage({ params }: Props) {
  await params
  const t = await getTranslations('collections')

  const collections = await db.collection.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    select: { id: true, slug: true, titleEs: true, titleEn: true, coverImage: true },
  })

  return (
    <main className="pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h1>

        {collections.length === 0 ? (
          <p className="font-serif italic text-stone-warm text-xl">
            {t('title')} — proximamente.
          </p>
        ) : (
          <CollectionGrid collections={collections} />
        )}
      </div>
    </main>
  )
}
