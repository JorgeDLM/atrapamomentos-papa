import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'
import SmoothScrollProvider from '@/components/ui/SmoothScrollProvider'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'es' | 'en')) notFound()

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <SmoothScrollProvider>
        <Nav />
        {children}
        <Footer />
      </SmoothScrollProvider>
    </NextIntlClientProvider>
  )
}
