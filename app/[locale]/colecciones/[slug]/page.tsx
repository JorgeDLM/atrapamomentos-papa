import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import SingleCollectionClient from './SingleCollectionClient'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const collections = await db.collection.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return collections.map((c) => ({ slug: c.slug }))
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('collections')

  const collection = await db.collection.findUnique({
    where: { slug, published: true },
    include: {
      photos: { orderBy: { order: 'asc' } },
    },
  })

  if (!collection) notFound()

  const title = locale === 'es' ? collection.titleEs : collection.titleEn
  const desc  = locale === 'es' ? collection.descEs  : collection.descEn

  const photos = collection.photos.map((p) => ({
    id:     p.id,
    url:    p.url,
    width:  p.width,
    height: p.height,
    altEs:  p.altEs,
    altEn:  p.altEn,
  }))

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-5xl text-stone-dark mb-4">{title}</h1>
          {desc && (
            <p className="font-sans text-stone-warm max-w-xl">{desc}</p>
          )}
          <p className="text-xs text-stone-warm/60 uppercase tracking-widest mt-3">
            {collection.photos.length} {t('photos' as any)}
          </p>
        </div>

        <SingleCollectionClient photos={photos} />
      </div>
    </main>
  )
}
