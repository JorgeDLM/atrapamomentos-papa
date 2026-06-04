import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  const where = session ? {} : { published: true }
  const exhibitions = await db.exhibition.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      photos: { orderBy: { order: 'asc' } },
      _count: { select: { photos: true } },
    },
  })
  return NextResponse.json(exhibitions)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, nameEn, venue, city, date, descEs, descEn } = body

  if (!name || !venue || !city || !date) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const exhibition = await db.exhibition.create({
    data: {
      name,
      nameEn: nameEn || '',
      venue,
      city,
      date: new Date(date),
      descEs: descEs || null,
      descEn: descEn || null,
    },
  })

  return NextResponse.json(exhibition, { status: 201 })
}
