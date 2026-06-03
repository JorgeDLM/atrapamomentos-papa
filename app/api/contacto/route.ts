import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/resend'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Simple in-memory rate limit: 5 requests per IP per 10 minutes
const rateMap = new Map<string, { count: number; reset: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)

  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 10 * 60 * 1000 })
    return false
  }

  if (entry.count >= 5) return true

  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await request.json()
  const { name, email, message } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  // Save to DB (best-effort — never block the user response)
  try {
    await db.contactMessage.create({ data: { name, email, message } })
  } catch (dbErr) {
    console.error('DB save error:', dbErr)
  }

  const { error } = await sendContactEmail({ name, email, message })

  if (error) {
    console.error('Resend error:', error)
    // Message already saved to DB — still return ok so user isn't confused
  }

  return NextResponse.json({ ok: true })
}
