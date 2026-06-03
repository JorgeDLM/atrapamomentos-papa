'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

interface Props {
  className?: string
}

export default function LanguageSwitcher({ className }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggle() {
    const next = locale === 'es' ? 'en' : 'es'
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    router.push(newPath)
  }

  return (
    <button
      onClick={toggle}
      className={`text-xs uppercase tracking-widest transition-colors duration-[400ms] cursor-pointer ${
        className ?? 'text-stone-warm hover:text-stone-dark'
      }`}
      aria-label="Switch language"
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  )
}
