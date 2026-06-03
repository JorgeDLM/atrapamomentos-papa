import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const session = await auth()
  const where = session ? { id } : { id, published: true }
  const collection = await db.collection.findUnique({
    where,
    include: { photos: { orderBy: { order: 'asc' } } },
  })
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(collection)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // Only allow updating specific fields
  const { titleEs, titleEn, descEs, descEn, coverImage, slug, published, order } = body
  const data: Record<string, unknown> = {}
  if (titleEs !== undefined) data.titleEs = titleEs
  if (titleEn !== undefined) data.titleEn = titleEn
  if (descEs !== undefined) data.descEs = descEs
  if (descEn !== undefined) data.descEn = descEn
  if (coverImage !== undefined) data.coverImage = coverImage
  if (slug !== undefined && /^[a-z0-9-]+$/.test(slug)) data.slug = slug
  if (published !== undefined) data.published = Boolean(published)
  if (order !== undefined) data.order = Number(order)

  const updated = await db.collection.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.collection.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
