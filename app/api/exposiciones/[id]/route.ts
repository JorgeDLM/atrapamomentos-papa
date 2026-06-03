import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { name, venue, city, date, descEs, descEn, published, order } = body

  const data: Record<string, unknown> = {}
  if (name      !== undefined) data.name      = name
  if (venue     !== undefined) data.venue     = venue
  if (city      !== undefined) data.city      = city
  if (date      !== undefined) data.date      = new Date(date)
  if (descEs    !== undefined) data.descEs    = descEs || null
  if (descEn    !== undefined) data.descEn    = descEn || null
  if (published !== undefined) data.published = published
  if (order     !== undefined) data.order     = Number(order)

  const exhibition = await db.exhibition.update({ where: { id }, data })
  return NextResponse.json(exhibition)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.exhibition.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
