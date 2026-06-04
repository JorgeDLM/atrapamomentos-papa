import { db } from '@/lib/db'
import Hero from '@/components/landing/Hero'
import Statement from '@/components/landing/Statement'
import ParallaxGallery, { type GalleryPhoto } from '@/components/landing/ParallaxGallery'
import Bio from '@/components/landing/Bio'
import ParallaxStrip from '@/components/landing/ParallaxStrip'
import Exhibitions from '@/components/landing/Exhibitions'
import Contact from '@/components/landing/Contact'

const GALLERY_LIMIT = 48
// Pleasant varied ratios used only as a fallback when a collection has a cover
// but no individual photos yet.
const FALLBACK_RATIOS = [0.8, 1, 1.3, 0.75, 1.5]

const DEFAULTS = {
  phone: '',
  heroImageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80',
  parallaxImageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80',
  portraitUrl: '/jorge.jpg',
  bioEs: 'Jorge de la Mora Toscana fotografía lo que pasa cuando nadie mira. Sus series recorren mercados, calles al amanecer y animales en su ritmo propio, buscando el instante en que lo ordinario revela algo que no tiene nombre.',
  bioEn: 'Jorge de la Mora Toscana photographs what happens when no one is watching. His series traverse markets, streets at dawn, and animals in their own rhythm — searching for the instant when the ordinary reveals something nameless.',
  statementEs: 'Fotografio para encontrar lo que ya estaba ahí.',
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
        heroImageUrl:     raw.heroImageUrl     || DEFAULTS.heroImageUrl,
        parallaxImageUrl: raw.parallaxImageUrl || DEFAULTS.parallaxImageUrl,
        portraitUrl:      raw.portraitUrl      || DEFAULTS.portraitUrl,
        bioEs:        raw.bioEs         || DEFAULTS.bioEs,
        bioEn:        raw.bioEn         || DEFAULTS.bioEn,
        statementEs:  raw.statementEs   || DEFAULTS.statementEs,
        statementEn:  raw.statementEn   || DEFAULTS.statementEn,
      }
    }
  } catch {
    // DB unavailable — use defaults
  }

  let galleryPhotos: GalleryPhoto[] = []
  try {
    const cols = await db.collection.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
      select: {
        slug: true,
        titleEs: true,
        titleEn: true,
        coverImage: true,
        photos: {
          orderBy: { order: 'asc' },
          select: { id: true, url: true, width: true, height: true },
        },
      },
    })

    // One bucket of photos per collection, tagged with collection info.
    const buckets = cols.map((c) =>
      c.photos.map((p) => ({
        id: p.id,
        url: p.url,
        width: p.width,
        height: p.height,
        collectionSlug: c.slug,
        collectionTitleEs: c.titleEs,
        collectionTitleEn: c.titleEn,
      })),
    )

    // Round-robin interleave so the masonry mixes collections instead of
    // showing one collection fully before the next.
    const interleaved: GalleryPhoto[] = []
    const maxLen = buckets.reduce((m, b) => Math.max(m, b.length), 0)
    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (bucket[i]) interleaved.push(bucket[i])
      }
    }

    // Fallback: collections that only have a cover (no photos yet) still appear.
    if (interleaved.length === 0) {
      cols.forEach((c, i) => {
        if (!c.coverImage) return
        const ratio = FALLBACK_RATIOS[i % FALLBACK_RATIOS.length]
        interleaved.push({
          id: c.slug,
          url: c.coverImage,
          width: Math.round(ratio * 1000),
          height: 1000,
          collectionSlug: c.slug,
          collectionTitleEs: c.titleEs,
          collectionTitleEn: c.titleEn,
        })
      })
    }

    galleryPhotos = interleaved.slice(0, GALLERY_LIMIT)
  } catch {
    // DB not available
  }

  let exhibitions: {
    id: string
    name: string
    nameEn: string
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
      <ParallaxGallery photos={galleryPhotos} />
      <Bio
        portraitUrl={site.portraitUrl}
        bioEs={site.bioEs}
        bioEn={site.bioEn}
        locale={locale}
      />
      <ParallaxStrip imageUrl={site.parallaxImageUrl} />
      <Exhibitions exhibitions={exhibitions} locale={locale} />
      <Contact phone={site.phone || undefined} />
    </main>
  )
}
