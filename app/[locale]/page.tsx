import { db } from '@/lib/db'
import Hero from '@/components/landing/Hero'
import Statement from '@/components/landing/Statement'
import CollectionsPreview from '@/components/landing/CollectionsPreview'
import Bio from '@/components/landing/Bio'
import ParallaxStrip from '@/components/landing/ParallaxStrip'
import Exhibitions from '@/components/landing/Exhibitions'
import Contact from '@/components/landing/Contact'

const PARALLAX_STRIP_URL = 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80'

const DEFAULTS = {
  phone: '',
  heroImageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80',
  portraitUrl: '/jorge.jpg',
  bioEs: 'Jorge de la Mora Toscana fotografía lo que pasa cuando nadie mira. Sus series recorren mercados, calles al amanecer y animales en su ritmo propio, buscando el instante en que lo ordinario revela algo que no tiene nombre.',
  bioEn: 'Jorge de la Mora Toscana photographs what happens when no one is watching. His series traverse markets, streets at dawn, and animals in their own rhythm — searching for the instant when the ordinary reveals something nameless.',
  statementEs: 'Fotografio para encontrar lo que ya estaba ahi.',
  statementEn: 'I photograph to find what was already there.',
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params

  // Site settings
  let site = DEFAULTS
  try {
    const raw = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
    if (raw) {
      site = {
        phone:        raw.phone         ?? DEFAULTS.phone,
        heroImageUrl: raw.heroImageUrl  || DEFAULTS.heroImageUrl,
        portraitUrl:  raw.portraitUrl   || DEFAULTS.portraitUrl,
        bioEs:        raw.bioEs         || DEFAULTS.bioEs,
        bioEn:        raw.bioEn         || DEFAULTS.bioEn,
        statementEs:  raw.statementEs   || DEFAULTS.statementEs,
        statementEn:  raw.statementEn   || DEFAULTS.statementEn,
      }
    }
  } catch {
    // DB unavailable — use defaults
  }

  let collections: { id: string; slug: string; titleEs: string; titleEn: string; coverImage: string | null }[] = []
  try {
    collections = await db.collection.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
      select: { id: true, slug: true, titleEs: true, titleEn: true, coverImage: true },
      take: 4,
    })
  } catch {
    // DB not available
  }

  let exhibitions: {
    id: string
    name: string
    venue: string
    city: string
    date: Date
    descEs: string | null
    descEn: string | null
    photos: { id: string; url: string; width: number; height: number }[]
  }[] = []
  try {
    exhibitions = await db.exhibition.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      include: {
        photos: {
          orderBy: { order: 'asc' },
          select: { id: true, url: true, width: true, height: true },
        },
      },
    })
  } catch {
    // DB not available
  }

  const statement = locale === 'es' ? site.statementEs : site.statementEn

  return (
    <main>
      <Hero imageUrl={site.heroImageUrl} />
      <Statement text={statement} />
      <CollectionsPreview collections={collections} />
      <Bio
        portraitUrl={site.portraitUrl}
        bioEs={site.bioEs}
        bioEn={site.bioEn}
        locale={locale}
      />
      <ParallaxStrip imageUrl={PARALLAX_STRIP_URL} />
      <Exhibitions exhibitions={exhibitions} locale={locale} />
      <Contact phone={site.phone || undefined} />
    </main>
  )
}
