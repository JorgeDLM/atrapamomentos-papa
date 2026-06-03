import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import CollectionEditorClient from './CollectionEditorClient'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditCollectionPage({ params }: Props) {
  const { id } = await params

  const collection = await db.collection.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } } },
  })

  if (!collection) notFound()

  return (
    <CollectionEditorClient
      collection={collection}
      photos={collection.photos}
    />
  )
}
