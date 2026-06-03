import { db } from '@/lib/db'
import SiteSettingsEditor from './SiteSettingsEditor'

export const dynamic = 'force-dynamic'

const DEFAULTS = {
  phone: '',
  heroImageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80',
  heroImageCloudinaryId: '',
  portraitUrl: '/jorge.jpg',
  portraitCloudinaryId: '',
  bioEs: 'Jorge de la Mora Toscana fotografía lo que pasa cuando nadie mira. Sus series recorren mercados, calles al amanecer y animales en su ritmo propio, buscando el instante en que lo ordinario revela algo que no tiene nombre.',
  bioEn: 'Jorge de la Mora Toscana photographs what happens when no one is watching. His series traverse markets, streets at dawn, and animals in their own rhythm — searching for the instant when the ordinary reveals something nameless.',
  statementEs: 'Fotografio para encontrar lo que ya estaba ahi.',
  statementEn: 'I photograph to find what was already there.',
}

export default async function ConfiguracionPage() {
  let settings = DEFAULTS
  try {
    const raw = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
    if (raw) {
      settings = {
        phone:                 raw.phone                 ?? DEFAULTS.phone,
        heroImageUrl:          raw.heroImageUrl          || DEFAULTS.heroImageUrl,
        heroImageCloudinaryId: raw.heroImageCloudinaryId || DEFAULTS.heroImageCloudinaryId,
        portraitUrl:           raw.portraitUrl           || DEFAULTS.portraitUrl,
        portraitCloudinaryId:  raw.portraitCloudinaryId  || DEFAULTS.portraitCloudinaryId,
        bioEs:                 raw.bioEs                 || DEFAULTS.bioEs,
        bioEn:                 raw.bioEn                 || DEFAULTS.bioEn,
        statementEs:           raw.statementEs           || DEFAULTS.statementEs,
        statementEn:           raw.statementEn           || DEFAULTS.statementEn,
      }
    }
  } catch {
    // DB unavailable — use defaults
  }

  return (
    <div>
      <h1 className="font-serif text-2xl mb-10">Ajustes del sitio</h1>
      <SiteSettingsEditor initial={settings} />
    </div>
  )
}
