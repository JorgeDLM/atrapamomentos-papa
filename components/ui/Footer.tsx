import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-stone-warm/20 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-serif text-sm text-stone-warm">
          Jorge de la Mora Toscana
        </span>
        <span className="text-xs text-stone-warm/60 uppercase tracking-widest">
          &copy; {year} {t('rights')}
        </span>
      </div>
    </footer>
  )
}
