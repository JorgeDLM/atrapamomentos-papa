import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteCloudinaryImage } from '@/lib/cloudinary'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { order } = await request.json()
  const photo = await db.exhibitionPhoto.update({
    where: { id },
    data: { order: Number(order) },
  })
  return NextResponse.json(photo)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const photo = await db.exhibitionPhoto.findUnique({
    where: { id },
    select: { cloudinaryId: true },
  })

  if (photo) {
    await deleteCloudinaryImage(photo.cloudinaryId)
    await db.exhibitionPhoto.delete({ where: { id } })
  }

  return NextResponse.json({ ok: true })
}
