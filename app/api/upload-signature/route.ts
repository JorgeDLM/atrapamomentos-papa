import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateUploadSignature } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sig = generateUploadSignature('jorge-portfolio')
  return NextResponse.json(sig)
}
