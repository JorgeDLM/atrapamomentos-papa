import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCloudinaryUrl } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { cloudinaryId, width, height, collectionId, altEs, altEn } = body

  if (!cloudinaryId || !width || !height || !collectionId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const last = await db.photo.findFirst({
    where: { collectionId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const photo = await db.photo.create({
    data: {
      cloudinaryId,
      url: getCloudinaryUrl(cloudinaryId),
      width,
      height,
      collectionId,
      altEs: altEs ?? null,
      altEn: altEn ?? null,
      order: (last?.order ?? -1) + 1,
    },
  })

  return NextResponse.json(photo, { status: 201 })
}
