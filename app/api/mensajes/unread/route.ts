import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ unread: 0, total: 0 })

  const [unread, total] = await Promise.all([
    db.contactMessage.count({ where: { read: false } }),
    db.contactMessage.count(),
  ])
  return NextResponse.json({ unread, total })
}
