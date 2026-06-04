import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('[upload] Missing Cloudinary credentials. Restart the dev server after editing .env')
    return NextResponse.json(
      { error: 'Cloudinary no está configurado en el servidor' },
      { status: 500 },
    )
  }

  // Configure per-request so credentials are always read from the current env,
  // never cached from a stale module load.
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  try {
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
      url: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${result.public_id}`,
      width: result.width,
      height: result.height,
    })
  } catch (err: unknown) {
    console.error('[upload] Cloudinary FULL error:', err)
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
