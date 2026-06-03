import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const collection = await db.collection.findUnique({
    where: { id },
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

  const updated = await db.collection.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.collection.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
