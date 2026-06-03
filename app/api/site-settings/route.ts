import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
    return NextResponse.json(settings ?? {})
  } catch {
    return NextResponse.json({})
  }
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  // Strip non-writable fields
  const { id: _id, updatedAt: _updatedAt, ...data } = body

  const settings = await db.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  })
  return NextResponse.json(settings)
}
