import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ count: 0 })

  const count = await db.contactMessage.count({ where: { read: false } })
  return NextResponse.json({ count })
}
