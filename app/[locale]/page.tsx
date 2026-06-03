import { db } from '@/lib/db'
import Hero from '@/components/landing/Hero'

export const dynamic = 'force-dynamic'
import Statement from '@/components/landing/Statement'
import CollectionsPreview from '@/components/landing/CollectionsPreview'
import Bio from '@/components/landing/Bio'
import Exhibitions from '@/components/landing/Exhibitions'
import Contact from '@/components/landing/Contact'
import type { Exhibition } from '@/components/landing/Exhibitions'

// Exhibition data — Jorge can update these values directly here
const EXHIBITIONS: Exhibition[] = [
  { year: 2024, title: 'Lo Ordinario Sagrado', venue: 'Museo de Arte Moderno', city: 'Ciudad de Mexico' },
  { year: 2022, title: 'Fauna Invisible', venue: 'Centro Cultural Espana', city: 'Guadalajara' },
  { year: 2020, title: 'Calles en Pausa', venue: 'Galeria OMR', city: 'Ciudad de Mexico' },
]

// Bio text — replace with Jorge's actual biography
const BIO = {
  es: 'Jorge de la Mora Toscana fotografía lo que pasa cuando nadie mira. Sus series recorren mercados, calles al amanecer y animales en su ritmo propio, buscando el instante en que lo ordinario revela algo que no tiene nombre.',
  en: 'Jorge de la Mora Toscana photographs what happens when no one is watching. His series traverse markets, streets at dawn, and animals in their own rhythm — searching for the instant when the ordinary reveals something nameless.',
}

// Replace with actual Cloudinary URLs once Jorge provides photos
const PORTRAIT_URL = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
const HERO_URL = 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params

  const collections = await db.collection.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    select: { id: true, slug: true, titleEs: true, titleEn: true, coverImage: true },
    take: 4,
  })

  return (
    <main>
      <Hero imageUrl={HERO_URL} />
      <Statement />
      <CollectionsPreview collections={collections} />
      <Bio
        portraitUrl={PORTRAIT_URL}
        bioEs={BIO.es}
        bioEn={BIO.en}
        locale={locale}
      />
      <Exhibitions exhibitions={EXHIBITIONS} />
      <Contact />
    </main>
  )
}
