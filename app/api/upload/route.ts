import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const result = await new Promise<{
    public_id: string
    secure_url: string
    width: number
    height: number
  }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'jorge-portfolio', resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'))
        resolve(result as any)
      },
    ).end(buffer)
  })

  return NextResponse.json({
    cloudinaryId: result.public_id,
    url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${result.public_id}`,
    width: result.width,
    height: result.height,
  })
}
