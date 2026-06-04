import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await auth()
  const where = session ? {} : { published: true }
  const collections = await db.collection.findMany({
    where,
    orderBy: { order: 'asc' },
    include: { _count: { select: { photos: true } } },
  })
  return NextResponse.json(collections)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { titleEs, titleEn, descEs, descEn, coverImage, slug } = body

  if (!titleEs || !titleEn || !coverImage || !slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
  }

  const collection = await db.collection.create({
    data: { titleEs, titleEn, descEs, descEn, coverImage, slug, published: true },
  })

  return NextResponse.json(collection, { status: 201 })
}
