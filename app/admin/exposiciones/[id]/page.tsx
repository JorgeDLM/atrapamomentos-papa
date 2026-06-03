import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ExhibitionEditorClient from './ExhibitionEditorClient'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditExhibitionPage({ params }: Props) {
  const { id } = await params

  const exhibition = await db.exhibition.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } } },
  })

  if (!exhibition) notFound()

  return (
    <ExhibitionEditorClient
      exhibition={exhibition}
      photos={exhibition.photos}
    />
  )
}
