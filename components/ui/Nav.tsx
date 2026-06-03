'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'
import { useEffect, useState } from 'react'

export default function Nav() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const base = `/${locale}`
  const linkClass = scrolled
    ? 'text-stone-warm hover:text-stone-dark'
    : 'text-ivory/80 hover:text-ivory'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[400ms] ${
        scrolled ? 'bg-ivory/95 backdrop-blur-sm border-b border-stone-warm/20' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center">
        <Link
          href={base}
          className={`font-serif text-base tracking-wide hover:opacity-70 transition-all duration-[400ms] ${
            scrolled ? 'text-stone-dark' : 'text-ivory'
          }`}
        >
          Jorge de la Mora
        </Link>

        <div className="flex items-center gap-8">
          <Link href={`${base}#colecciones`} className={`text-xs uppercase tracking-widest transition-colors duration-[400ms] ${linkClass}`}>
            {t('colecciones')}
          </Link>
          <Link href={`${base}#sobre`} className={`text-xs uppercase tracking-widest transition-colors duration-[400ms] ${linkClass}`}>
            {t('sobre')}
          </Link>
          <Link href={`${base}#contacto`} className={`text-xs uppercase tracking-widest transition-colors duration-[400ms] ${linkClass}`}>
            {t('contacto')}
          </Link>
          <LanguageSwitcher className={linkClass} />
        </div>
      </div>
    </nav>
  )
}
