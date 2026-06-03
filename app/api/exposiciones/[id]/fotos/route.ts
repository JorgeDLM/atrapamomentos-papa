import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCloudinaryUrl } from '@/lib/cloudinary'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: exhibitionId } = await params
  const body = await request.json()
  const { cloudinaryId, width, height } = body

  if (!cloudinaryId || !width || !height) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const last = await db.exhibitionPhoto.findFirst({
    where: { exhibitionId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const photo = await db.exhibitionPhoto.create({
    data: {
      cloudinaryId,
      url: getCloudinaryUrl(cloudinaryId),
      width,
      height,
      exhibitionId,
      order: (last?.order ?? -1) + 1,
    },
  })

  return NextResponse.json(photo, { status: 201 })
}
