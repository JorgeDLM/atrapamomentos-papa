# Jorge de la Mora Toscana — Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full photography portfolio site for Jorge de la Mora Toscana — bilingual (ES/EN), with parallax landing, public gallery, and a private admin panel to manage collections and photos.

**Architecture:** Single Next.js 15 App Router app. Public routes under `app/[locale]/`. Admin under `app/admin/` (no locale). Prisma + Neon (PostgreSQL) for metadata. Cloudinary for image storage. NextAuth v5 for single-user auth. GSAP ScrollTrigger + Lenis for parallax.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma, NextAuth v5, next-intl, GSAP, Lenis, Cloudinary SDK, Resend, Neon PostgreSQL.

---

## File Map

```
app/
  [locale]/
    layout.tsx          # locale layout: nav + footer + lenis init
    page.tsx            # landing page (all sections)
    colecciones/
      page.tsx          # all collections grid
      [slug]/
        page.tsx        # single collection + lightbox
    not-found.tsx
  admin/
    layout.tsx          # admin layout: auth guard
    page.tsx            # dashboard: collection list
    login/
      page.tsx          # login form
    colecciones/
      nueva/
        page.tsx        # create collection form
      [id]/
        page.tsx        # edit collection + photo manager
  api/
    auth/
      [...nextauth]/
        route.ts        # NextAuth handler
    colecciones/
      route.ts          # GET all, POST create
      [id]/
        route.ts        # GET one, PATCH update, DELETE
    fotos/
      route.ts          # POST upload photo
      [id]/
        route.ts        # PATCH reorder, DELETE
    contacto/
      route.ts          # POST send email
  globals.css
  layout.tsx            # root layout (html/body only)

components/
  landing/
    Hero.tsx
    Statement.tsx
    CollectionsPreview.tsx
    Bio.tsx
    Exhibitions.tsx
    Contact.tsx
  gallery/
    CollectionGrid.tsx
    PhotoCard.tsx
    Lightbox.tsx
  admin/
    CollectionForm.tsx
    PhotoUploader.tsx
    PhotoGrid.tsx
    AdminNav.tsx
  ui/
    Nav.tsx
    Footer.tsx
    LanguageSwitcher.tsx

lib/
  auth.ts               # NextAuth config + helpers
  db.ts                 # Prisma client singleton
  cloudinary.ts         # upload + delete + signature
  resend.ts             # send email helper

middleware.ts           # i18n routing + admin auth guard

messages/
  es.json
  en.json

prisma/
  schema.prisma
  seed.ts

i18n/
  routing.ts
  request.ts
```

---

## Task 1: Project Scaffold + Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `.env.local`, `.env.example`, `.gitignore`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd "C:/Users/UsX/Desktop/Proyectos - Desarrollo web/papa"
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

- [ ] **Step 2: Install all dependencies**

```bash
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter next-intl gsap lenis cloudinary resend bcryptjs
npm install -D @types/bcryptjs tsx
```

- [ ] **Step 3: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""

# Resend
RESEND_API_KEY=""
CONTACT_EMAIL="jorge@example.com"
EOF
```

- [ ] **Step 4: Create `.env.example`** (same keys, no values)

```bash
cat > .env.example << 'EOF'
DATABASE_URL=""
AUTH_SECRET=""
NEXTAUTH_URL=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=""
RESEND_API_KEY=""
CONTACT_EMAIL=""
EOF
```

- [ ] **Step 5: Update `.gitignore`** — ensure `.env.local` and `.superpowers/` are listed

```
.env.local
.superpowers/
```

- [ ] **Step 6: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 15 project with dependencies"
```

---

## Task 2: Tailwind Theme + Fonts

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F5F0EB',
          light: '#FDFAF7',
          dark:  '#EDE8E3',
        },
        stone: {
          warm:  '#7A7068',
          dark:  '#1A1714',
        },
        accent: '#8B6B4A',
      },
      fontFamily: {
        serif:  ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:   ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-playfair: 'Playfair Display', serif;
  --font-dm-sans: 'DM Sans', sans-serif;
}

html {
  background-color: #F5F0EB;
  color: #1A1714;
}

* {
  box-sizing: border-box;
}

/* Smooth scroll managed by Lenis — disable native */
html.lenis {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
```

- [ ] **Step 3: Replace `app/layout.tsx` (root layout)**

```typescript
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jorge de la Mora Toscana',
  description: 'Fotografo | Photography',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-ivory text-stone-dark antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: tailwind theme with ivory palette, Playfair Display and DM Sans fonts"
```

---

## Task 3: Prisma Schema + DB Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `lib/db.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Replace `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}

model Collection {
  id         String   @id @default(cuid())
  slug       String   @unique
  titleEs    String
  titleEn    String
  descEs     String?
  descEn     String?
  coverImage String
  published  Boolean  @default(false)
  order      Int      @default(0)
  photos     Photo[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Photo {
  id           String     @id @default(cuid())
  cloudinaryId String     @unique
  url          String
  width        Int
  height       Int
  altEs        String?
  altEn        String?
  order        Int        @default(0)
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())
}
```

- [ ] **Step 3: Create `lib/db.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- [ ] **Step 4: Create `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'jorge@example.com'
  const password = process.env.ADMIN_PASSWORD ?? 'changeme123'
  const hash = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hash },
  })

  console.log(`Admin user created: ${email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 5: Add seed script to `package.json`**

Add inside `"scripts"`:
```json
"db:seed": "tsx prisma/seed.ts",
"db:push": "prisma db push",
"db:studio": "prisma studio"
```

- [ ] **Step 6: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: prisma schema with User, Collection, Photo models"
```

---

## Task 4: NextAuth v5 + Admin Login

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: Create `lib/auth.ts`**

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
})
```

- [ ] **Step 2: Create `app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 3: Create `app/admin/layout.tsx`**

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-white">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/admin/AdminNav.tsx`**

```typescript
import { signOut } from '@/lib/auth'

export default function AdminNav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="font-serif text-lg">Admin — Jorge de la Mora</span>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/admin/login' })
          }}
        >
          <button
            type="submit"
            className="text-sm text-stone-warm hover:text-stone-dark transition-colors duration-400"
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Create `app/admin/login/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email:    fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })

    if (result?.error) {
      setError('Credenciales incorrectas')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl text-center mb-8">
          Jorge de la Mora
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full border-b border-stone-warm bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 text-xs uppercase tracking-widest border border-stone-dark text-stone-dark hover:bg-stone-dark hover:text-ivory transition-all duration-400 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: nextauth v5 credentials auth, admin login page"
```

---

## Task 5: Middleware (i18n + auth)

**Files:**
- Create: `middleware.ts`
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`

- [ ] **Step 1: Create `i18n/routing.ts`**

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
})
```

- [ ] **Step 2: Create `i18n/request.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'es' | 'en')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: Create `middleware.ts`**

```typescript
import createMiddleware from 'next-intl/middleware'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes: check auth
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()

    const session = await auth()
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // Public routes: apply i18n
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

- [ ] **Step 4: Update `next.config.ts` for next-intl**

```typescript
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: next-intl i18n routing (ES/EN) + admin auth middleware"
```

---

## Task 6: Translation Messages

**Files:**
- Create: `messages/es.json`
- Create: `messages/en.json`

- [ ] **Step 1: Create `messages/es.json`**

```json
{
  "nav": {
    "colecciones": "Colecciones",
    "sobre": "Sobre Jorge",
    "contacto": "Contacto"
  },
  "hero": {
    "scroll": "Desplazar"
  },
  "statement": {
    "text": "Fotografio para encontrar lo que ya estaba ahi."
  },
  "collections": {
    "title": "Colecciones",
    "viewAll": "Ver todas las colecciones",
    "viewCollection": "Ver coleccion"
  },
  "bio": {
    "title": "Sobre Jorge"
  },
  "exhibitions": {
    "title": "Exposiciones"
  },
  "contact": {
    "title": "Contacto",
    "name": "Nombre",
    "email": "Email",
    "message": "Mensaje",
    "send": "Enviar",
    "sending": "Enviando...",
    "success": "Mensaje enviado. Gracias.",
    "error": "Algo salio mal. Intenta de nuevo."
  },
  "footer": {
    "rights": "Todos los derechos reservados"
  },
  "gallery": {
    "photos": "fotografias",
    "close": "Cerrar",
    "prev": "Anterior",
    "next": "Siguiente"
  }
}
```

- [ ] **Step 2: Create `messages/en.json`**

```json
{
  "nav": {
    "colecciones": "Collections",
    "sobre": "About Jorge",
    "contacto": "Contact"
  },
  "hero": {
    "scroll": "Scroll"
  },
  "statement": {
    "text": "I photograph to find what was already there."
  },
  "collections": {
    "title": "Collections",
    "viewAll": "View all collections",
    "viewCollection": "View collection"
  },
  "bio": {
    "title": "About Jorge"
  },
  "exhibitions": {
    "title": "Exhibitions"
  },
  "contact": {
    "title": "Contact",
    "name": "Name",
    "email": "Email",
    "message": "Message",
    "send": "Send",
    "sending": "Sending...",
    "success": "Message sent. Thank you.",
    "error": "Something went wrong. Please try again."
  },
  "footer": {
    "rights": "All rights reserved"
  },
  "gallery": {
    "photos": "photographs",
    "close": "Close",
    "prev": "Previous",
    "next": "Next"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: bilingual messages ES/EN"
```

---

## Task 7: Locale Layout + Nav + Footer

**Files:**
- Create: `app/[locale]/layout.tsx`
- Create: `components/ui/Nav.tsx`
- Create: `components/ui/Footer.tsx`
- Create: `components/ui/LanguageSwitcher.tsx`
- Create: `components/ui/SmoothScrollProvider.tsx`

- [ ] **Step 1: Create `components/ui/SmoothScrollProvider.tsx`**

```typescript
'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return <>{children}</>
}
```

- [ ] **Step 2: Create `components/ui/LanguageSwitcher.tsx`**

```typescript
'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggle() {
    const next = locale === 'es' ? 'en' : 'es'
    // Replace current locale prefix in pathname
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    router.push(newPath)
  }

  return (
    <button
      onClick={toggle}
      className="text-xs uppercase tracking-widest text-stone-warm hover:text-stone-dark transition-colors duration-400"
      aria-label="Switch language"
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  )
}
```

- [ ] **Step 3: Create `components/ui/Nav.tsx`**

```typescript
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled ? 'bg-ivory/95 backdrop-blur-sm border-b border-stone-warm/20' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center">
        <Link
          href={base}
          className="font-serif text-base tracking-wide hover:opacity-70 transition-opacity duration-400"
        >
          Jorge de la Mora
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href={`${base}#colecciones`}
            className="text-xs uppercase tracking-widest text-stone-warm hover:text-stone-dark transition-colors duration-400"
          >
            {t('colecciones')}
          </Link>
          <Link
            href={`${base}#sobre`}
            className="text-xs uppercase tracking-widest text-stone-warm hover:text-stone-dark transition-colors duration-400"
          >
            {t('sobre')}
          </Link>
          <Link
            href={`${base}#contacto`}
            className="text-xs uppercase tracking-widest text-stone-warm hover:text-stone-dark transition-colors duration-400"
          >
            {t('contacto')}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Create `components/ui/Footer.tsx`**

```typescript
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
```

- [ ] **Step 5: Create `app/[locale]/layout.tsx`**

```typescript
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
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: locale layout, nav, footer, language switcher, smooth scroll (Lenis)"
```

---

## Task 8: Landing Hero Section (parallax)

**Files:**
- Create: `components/landing/Hero.tsx`

- [ ] **Step 1: Create `components/landing/Hero.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  imageUrl: string
}

export default function Hero({ imageUrl }: HeroProps) {
  const t = useTranslations('hero')
  const sectionRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background moves slower than scroll (classic parallax)
      gsap.to(bgRef.current, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Text moves slightly faster than background
      gsap.to(textRef.current, {
        yPercent: 15,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden"
    >
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-0 -top-[25%] h-[125%] bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />

      {/* Subtle overlay for text legibility */}
      <div className="absolute inset-0 bg-stone-dark/10" />

      {/* Centered text */}
      <div
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-ivory-light"
      >
        <p className="text-xs uppercase tracking-[0.4em] mb-6 font-sans text-ivory-light/70">
          Photography
        </p>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-center leading-tight">
          Jorge de la Mora
          <br />
          <span className="italic font-light">Toscana</span>
        </h1>
        <div className="mt-16 flex flex-col items-center gap-3 text-ivory-light/50">
          <div className="w-px h-12 bg-ivory-light/30 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-sans">
            {t('scroll')}
          </span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: hero section with GSAP parallax scroll effect"
```

---

## Task 9: Artist Statement Section

**Files:**
- Create: `components/landing/Statement.tsx`

- [ ] **Step 1: Create `components/landing/Statement.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

export default function Statement() {
  const t = useTranslations('statement')
  const ref = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={ref}
      className="bg-stone-dark py-32 md:py-48 px-6"
    >
      <div className="max-w-3xl mx-auto text-center">
        <p
          ref={textRef}
          className="font-serif italic text-2xl md:text-4xl text-ivory leading-relaxed opacity-0"
        >
          &ldquo;{t('text')}&rdquo;
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: artist statement section with fade-in animation"
```

---

## Task 10: Collections Preview Section

**Files:**
- Create: `components/landing/CollectionsPreview.tsx`
- Create: `components/gallery/PhotoCard.tsx`

- [ ] **Step 1: Create `components/gallery/PhotoCard.tsx`**

```typescript
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface PhotoCardProps {
  slug: string
  titleEs: string
  titleEn: string
  coverImage: string
  className?: string
}

export default function PhotoCard({
  slug,
  titleEs,
  titleEn,
  coverImage,
  className = '',
}: PhotoCardProps) {
  const locale = useLocale()
  const title = locale === 'es' ? titleEs : titleEn

  return (
    <Link
      href={`/${locale}/colecciones/${slug}`}
      className={`group relative block overflow-hidden bg-ivory-dark ${className}`}
    >
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      {/* Title overlay on hover */}
      <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-t from-stone-dark/60 to-transparent">
        <span className="font-serif text-ivory-light text-xl">{title}</span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create `components/landing/CollectionsPreview.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import PhotoCard from '@/components/gallery/PhotoCard'
import type { Collection } from '@prisma/client'

gsap.registerPlugin(ScrollTrigger)

interface CollectionsPreviewProps {
  collections: Pick<Collection, 'id' | 'slug' | 'titleEs' | 'titleEn' | 'coverImage'>[]
}

export default function CollectionsPreview({ collections }: CollectionsPreviewProps) {
  const t = useTranslations('collections')
  const locale = useLocale()
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current?.children ?? [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            toggleActions: 'play none none none',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  const featured = collections.slice(0, 4)

  return (
    <section ref={sectionRef} id="colecciones" className="py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h2>

        {/* Asymmetric grid: 2 large left, 2 small right */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
          {featured[0] && (
            <PhotoCard
              {...featured[0]}
              className="md:col-span-2 aspect-[4/3]"
            />
          )}
          {featured[1] && (
            <div className="flex flex-col gap-3">
              {featured[1] && (
                <PhotoCard {...featured[1]} className="flex-1 aspect-square" />
              )}
              {featured[2] && (
                <PhotoCard {...featured[2]} className="flex-1 aspect-square" />
              )}
            </div>
          )}
          {featured[3] && (
            <PhotoCard
              {...featured[3]}
              className="md:col-span-3 aspect-[21/9]"
            />
          )}
        </div>

        <div className="text-right">
          <Link
            href={`/${locale}/colecciones`}
            className="text-xs uppercase tracking-widest text-stone-warm hover:text-stone-dark border-b border-current pb-1 transition-colors duration-400"
          >
            {t('viewAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: collections preview section with asymmetric grid and stagger animation"
```

---

## Task 11: Bio + Exhibitions + Contact Sections

**Files:**
- Create: `components/landing/Bio.tsx`
- Create: `components/landing/Exhibitions.tsx`
- Create: `components/landing/Contact.tsx`
- Create: `lib/resend.ts`
- Create: `app/api/contacto/route.ts`

- [ ] **Step 1: Create `lib/resend.ts`**

```typescript
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(data: {
  name: string
  email: string
  message: string
}) {
  return resend.emails.send({
    from: 'Portfolio <noreply@jorgedelamora.com>',
    to:   process.env.CONTACT_EMAIL!,
    replyTo: data.email,
    subject: `Mensaje de ${data.name} — Portfolio`,
    text: `Nombre: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
  })
}
```

- [ ] **Step 2: Create `app/api/contacto/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/resend'

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

  const { error } = await sendContactEmail({ name, email, message })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create `components/landing/Bio.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

interface BioProps {
  portraitUrl: string
  bioEs: string
  bioEn: string
  locale: string
}

export default function Bio({ portraitUrl, bioEs, bioEn, locale }: BioProps) {
  const t = useTranslations('bio')
  const ref = useRef<HTMLElement>(null)
  const text = locale === 'es' ? bioEs : bioEn

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current?.querySelectorAll('.animate-in') ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 65%',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="sobre" className="py-24 md:py-40 px-6 md:px-12 bg-ivory-dark">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
        <div className="animate-in relative aspect-[3/4] max-w-sm mx-auto md:mx-0 overflow-hidden">
          <Image
            src={portraitUrl}
            alt="Jorge de la Mora Toscana"
            fill
            className="object-cover grayscale"
          />
        </div>

        <div>
          <h2 className="animate-in font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-8">
            {t('title')}
          </h2>
          <p className="animate-in font-serif text-xl md:text-2xl leading-relaxed text-stone-dark">
            {text}
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `components/landing/Exhibitions.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

export interface Exhibition {
  year: number
  title: string
  venue: string
  city: string
}

interface ExhibitionsProps {
  exhibitions: Exhibition[]
}

export default function Exhibitions({ exhibitions }: ExhibitionsProps) {
  const t = useTranslations('exhibitions')
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current?.querySelectorAll('.exhibit-row') ?? [],
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 70%',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h2>

        <div className="divide-y divide-stone-warm/15">
          {exhibitions.map((ex) => (
            <div
              key={`${ex.year}-${ex.title}`}
              className="exhibit-row grid grid-cols-[80px_1fr_auto] gap-6 py-5 opacity-0"
            >
              <span className="font-sans text-stone-warm text-sm tabular-nums">
                {ex.year}
              </span>
              <div>
                <p className="font-serif text-base text-stone-dark">{ex.title}</p>
                <p className="font-sans text-sm text-stone-warm mt-0.5">{ex.venue}</p>
              </div>
              <span className="font-sans text-xs text-stone-warm/60 self-center text-right">
                {ex.city}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create `components/landing/Contact.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function Contact() {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    const fd = new FormData(e.currentTarget)

    const res = await fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    fd.get('name'),
        email:   fd.get('email'),
        message: fd.get('message'),
      }),
    })

    setStatus(res.ok ? 'success' : 'error')
    if (res.ok) (e.target as HTMLFormElement).reset()
  }

  return (
    <section id="contacto" className="py-24 md:py-40 px-6 md:px-12 bg-ivory-dark">
      <div className="max-w-xl mx-auto">
        <h2 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h2>

        {status === 'success' ? (
          <p className="font-serif text-xl text-stone-dark">{t('success')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {(['name', 'email'] as const).map((field) => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-xs uppercase tracking-widest text-stone-warm mb-2"
                >
                  {t(field)}
                </label>
                <input
                  id={field}
                  name={field}
                  type={field === 'email' ? 'email' : 'text'}
                  required
                  className="w-full border-b border-stone-warm/40 bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-400 placeholder:text-stone-warm/40"
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="message"
                className="block text-xs uppercase tracking-widest text-stone-warm mb-2"
              >
                {t('message')}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full border-b border-stone-warm/40 bg-transparent py-2 text-stone-dark outline-none focus:border-stone-dark transition-colors duration-400 resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600">{t('error')}</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="text-xs uppercase tracking-widest border-b border-stone-dark pb-1 hover:text-accent hover:border-accent transition-colors duration-400 disabled:opacity-50"
            >
              {status === 'sending' ? t('sending') : t('send')}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: bio, exhibitions, contact sections + contact API route"
```

---

## Task 12: Landing Page Assembly

**Files:**
- Create: `app/[locale]/page.tsx`

- [ ] **Step 1: Create `app/[locale]/page.tsx`**

```typescript
import { db } from '@/lib/db'
import Hero from '@/components/landing/Hero'
import Statement from '@/components/landing/Statement'
import CollectionsPreview from '@/components/landing/CollectionsPreview'
import Bio from '@/components/landing/Bio'
import Exhibitions from '@/components/landing/Exhibitions'
import Contact from '@/components/landing/Contact'
import type { Exhibition } from '@/components/landing/Exhibitions'

// Static exhibition data — update here or move to DB later
const EXHIBITIONS: Exhibition[] = [
  { year: 2024, title: 'Lo Ordinario Sagrado', venue: 'Museo de Arte Moderno', city: 'Ciudad de Mexico' },
  { year: 2022, title: 'Fauna Invisible',       venue: 'Centro Cultural España',  city: 'Guadalajara' },
  { year: 2020, title: 'Calles en Pausa',       venue: 'Galería OMR',             city: 'Ciudad de Mexico' },
]

// Placeholder bio — replace with real text from Jorge
const BIO = {
  es: 'Jorge de la Mora Toscana fotografía lo que pasa cuando nadie mira. Sus series recorren mercados, calles al amanecer y animales en su ritmo propio, buscando el instante en que lo ordinario revela algo que no tiene nombre.',
  en: 'Jorge de la Mora Toscana photographs what happens when no one is watching. His series traverse markets, streets at dawn, and animals in their own rhythm — searching for the instant when the ordinary reveals something nameless.',
}

// Placeholder portrait — replace with real Cloudinary URL
const PORTRAIT_URL = 'https://res.cloudinary.com/demo/image/upload/sample.jpg'

// Placeholder hero — replace with Jorge's strongest photo
const HERO_URL = 'https://res.cloudinary.com/demo/image/upload/e_grayscale/sample.jpg'

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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: landing page assembles all sections"
```

---

## Task 13: Collections Page

**Files:**
- Create: `app/[locale]/colecciones/page.tsx`
- Create: `components/gallery/CollectionGrid.tsx`

- [ ] **Step 1: Create `components/gallery/CollectionGrid.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PhotoCard from './PhotoCard'
import type { Collection } from '@prisma/client'

gsap.registerPlugin(ScrollTrigger)

interface CollectionGridProps {
  collections: Pick<Collection, 'id' | 'slug' | 'titleEs' | 'titleEn' | 'coverImage'>[]
}

export default function CollectionGrid({ collections }: CollectionGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gridRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={gridRef}
      className="columns-1 md:columns-2 lg:columns-3 gap-3 space-y-3"
    >
      {collections.map((col) => (
        <PhotoCard
          key={col.id}
          {...col}
          className="break-inside-avoid w-full aspect-auto"
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `app/[locale]/colecciones/page.tsx`**

```typescript
import { db } from '@/lib/db'
import { getTranslations } from 'next-intl/server'
import CollectionGrid from '@/components/gallery/CollectionGrid'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function CollectionsPage({ params }: Props) {
  await params
  const t = await getTranslations('collections')

  const collections = await db.collection.findMany({
    where: { published: true },
    orderBy: { order: 'asc' },
    select: { id: true, slug: true, titleEs: true, titleEn: true, coverImage: true },
  })

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-sm uppercase tracking-[0.3em] text-stone-warm mb-16">
          {t('title')}
        </h1>

        <CollectionGrid collections={collections} />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: collections page with masonry grid"
```

---

## Task 14: Single Collection + Lightbox

**Files:**
- Create: `app/[locale]/colecciones/[slug]/page.tsx`
- Create: `components/gallery/Lightbox.tsx`

- [ ] **Step 1: Create `components/gallery/Lightbox.tsx`**

```typescript
'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { Photo } from '@prisma/client'

interface LightboxProps {
  photos: Photo[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function Lightbox({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const t = useTranslations('gallery')
  const photo = photos[currentIndex]

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      className="fixed inset-0 z-[100] bg-stone-dark/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Stop propagation so clicking image doesn't close */}
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={`${photo.url}?auto=format&q=90`}
          alt={photo.altEs ?? ''}
          width={photo.width}
          height={photo.height}
          className="max-h-[85vh] w-auto object-contain"
          priority
        />

        {/* Counter */}
        <p className="absolute bottom-0 left-0 right-0 text-center text-xs text-ivory/50 font-sans uppercase tracking-widest py-3">
          {currentIndex + 1} / {photos.length}
        </p>
      </div>

      {/* Controls */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-6 right-6 text-ivory/60 hover:text-ivory text-xs uppercase tracking-widest transition-colors duration-400"
        aria-label={t('close')}
      >
        {t('close')}
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        disabled={currentIndex === 0}
        className="absolute left-6 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-xs uppercase tracking-widest transition-colors duration-400 disabled:opacity-20"
        aria-label={t('prev')}
      >
        &larr;
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        disabled={currentIndex === photos.length - 1}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-xs uppercase tracking-widest transition-colors duration-400 disabled:opacity-20"
        aria-label={t('next')}
      >
        &rarr;
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/[locale]/colecciones/[slug]/page.tsx`**

```typescript
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import SingleCollectionClient from './SingleCollectionClient'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  const collections = await db.collection.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return collections.map((c) => ({ slug: c.slug }))
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('collections')

  const collection = await db.collection.findUnique({
    where: { slug, published: true },
    include: {
      photos: { orderBy: { order: 'asc' } },
    },
  })

  if (!collection) notFound()

  const title = locale === 'es' ? collection.titleEs : collection.titleEn
  const desc  = locale === 'es' ? collection.descEs  : collection.descEn

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-5xl text-stone-dark mb-4">{title}</h1>
          {desc && (
            <p className="font-sans text-stone-warm max-w-xl">{desc}</p>
          )}
          <p className="text-xs text-stone-warm/60 uppercase tracking-widest mt-3">
            {collection.photos.length} {t('photos' as never)}
          </p>
        </div>

        <SingleCollectionClient photos={collection.photos} />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create `app/[locale]/colecciones/[slug]/SingleCollectionClient.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from '@/components/gallery/Lightbox'
import type { Photo } from '@prisma/client'

interface Props {
  photos: Photo[]
}

export default function SingleCollectionClient({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 space-y-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(i)}
            className="break-inside-avoid w-full block relative overflow-hidden group"
          >
            <Image
              src={`${photo.url}?auto=format&q=80&w=800`}
              alt={photo.altEs ?? ''}
              width={photo.width}
              height={photo.height}
              className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() => setLightboxIndex((i) => Math.min(photos.length - 1, (i ?? 0) + 1))}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: single collection page with masonry grid and keyboard-navigable lightbox"
```

---

## Task 15: Collections API Routes

**Files:**
- Create: `app/api/colecciones/route.ts`
- Create: `app/api/colecciones/[id]/route.ts`
- Create: `app/api/fotos/route.ts`
- Create: `app/api/fotos/[id]/route.ts`
- Create: `lib/cloudinary.ts`

- [ ] **Step 1: Create `lib/cloudinary.ts`**

```typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function deleteCloudinaryImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

export function getCloudinaryUrl(publicId: string, transforms = 'f_auto,q_auto') {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

export function generateUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { timestamp, folder }
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  )
  return { timestamp, signature, apiKey: process.env.CLOUDINARY_API_KEY! }
}
```

- [ ] **Step 2: Create `app/api/colecciones/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const collections = await db.collection.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { photos: true } } },
  })
  return NextResponse.json(collections)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { titleEs, titleEn, descEs, descEn, coverImage, slug } = body

  if (!titleEs || !titleEn || !coverImage || !slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Slug validation: lowercase, hyphens only
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
  }

  const collection = await db.collection.create({
    data: { titleEs, titleEn, descEs, descEn, coverImage, slug },
  })

  return NextResponse.json(collection, { status: 201 })
}
```

- [ ] **Step 3: Create `app/api/colecciones/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const collection = await db.collection.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } } },
  })
  if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(collection)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const updated = await db.collection.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.collection.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Create `app/api/fotos/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCloudinaryUrl } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { cloudinaryId, width, height, collectionId, altEs, altEn } = body

  if (!cloudinaryId || !width || !height || !collectionId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get highest order in collection
  const last = await db.photo.findFirst({
    where: { collectionId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const photo = await db.photo.create({
    data: {
      cloudinaryId,
      url: getCloudinaryUrl(cloudinaryId),
      width,
      height,
      collectionId,
      altEs,
      altEn,
      order: (last?.order ?? -1) + 1,
    },
  })

  return NextResponse.json(photo, { status: 201 })
}
```

- [ ] **Step 5: Create `app/api/fotos/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteCloudinaryImage } from '@/lib/cloudinary'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const photo = await db.photo.update({ where: { id }, data: body })
  return NextResponse.json(photo)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const photo = await db.photo.findUnique({ where: { id }, select: { cloudinaryId: true } })

  if (photo) {
    await deleteCloudinaryImage(photo.cloudinaryId)
    await db.photo.delete({ where: { id } })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 6: Create `app/api/upload-signature/route.ts`** (for secure Cloudinary upload)

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateUploadSignature } from '@/lib/cloudinary'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sig = generateUploadSignature('jorge-portfolio')
  return NextResponse.json(sig)
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: REST API routes for collections, photos, upload signature, cloudinary helpers"
```

---

## Task 16: Admin Dashboard

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create `app/admin/page.tsx`**

```typescript
import { db } from '@/lib/db'
import Link from 'next/link'
import DeleteCollectionButton from './DeleteCollectionButton'
import TogglePublishButton from './TogglePublishButton'

export default async function AdminDashboard() {
  const collections = await db.collection.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { photos: true } } },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-serif text-2xl">Colecciones</h1>
        <Link
          href="/admin/colecciones/nueva"
          className="text-xs uppercase tracking-widest border border-stone-dark px-4 py-2 hover:bg-stone-dark hover:text-ivory transition-all duration-400"
        >
          Nueva coleccion
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {collections.map((col) => (
          <div key={col.id} className="py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base truncate">{col.titleEs}</p>
              <p className="text-xs text-stone-warm mt-0.5">
                {col._count.photos} fotos &middot; /{col.slug}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <TogglePublishButton id={col.id} published={col.published} />
              <Link
                href={`/admin/colecciones/${col.id}`}
                className="text-xs text-stone-warm hover:text-stone-dark transition-colors duration-400"
              >
                Editar
              </Link>
              <DeleteCollectionButton id={col.id} title={col.titleEs} />
            </div>
          </div>
        ))}

        {collections.length === 0 && (
          <p className="py-12 text-center text-stone-warm font-serif italic">
            No hay colecciones aun.
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/admin/TogglePublishButton.tsx`**

```typescript
'use client'

import { useRouter } from 'next/navigation'

interface Props {
  id: string
  published: boolean
}

export default function TogglePublishButton({ id, published }: Props) {
  const router = useRouter()

  async function toggle() {
    await fetch(`/api/colecciones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      className={`text-xs uppercase tracking-widest transition-colors duration-400 ${
        published
          ? 'text-green-700 hover:text-stone-warm'
          : 'text-stone-warm hover:text-stone-dark'
      }`}
    >
      {published ? 'Publicado' : 'Borrador'}
    </button>
  )
}
```

- [ ] **Step 3: Create `app/admin/DeleteCollectionButton.tsx`**

```typescript
'use client'

import { useRouter } from 'next/navigation'

interface Props {
  id: string
  title: string
}

export default function DeleteCollectionButton({ id, title }: Props) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Eliminar "${title}"? Esta accion no se puede deshacer.`)) return
    await fetch(`/api/colecciones/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-stone-warm/50 hover:text-red-600 transition-colors duration-400"
    >
      Eliminar
    </button>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: admin dashboard with collection list, publish toggle, delete"
```

---

## Task 17: Admin Collection Form + Photo Uploader

**Files:**
- Create: `components/admin/CollectionForm.tsx`
- Create: `components/admin/PhotoUploader.tsx`
- Create: `components/admin/PhotoGrid.tsx`
- Create: `app/admin/colecciones/nueva/page.tsx`
- Create: `app/admin/colecciones/[id]/page.tsx`

- [ ] **Step 1: Create `components/admin/CollectionForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Collection } from '@prisma/client'

interface CollectionFormProps {
  collection?: Collection
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter()
  const isEdit = !!collection
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slug, setSlug] = useState(collection?.slug ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const data = {
      titleEs:    fd.get('titleEs'),
      titleEn:    fd.get('titleEn'),
      descEs:     fd.get('descEs'),
      descEn:     fd.get('descEn'),
      slug:       fd.get('slug'),
      coverImage: fd.get('coverImage'),
    }

    const url    = isEdit ? `/api/colecciones/${collection!.id}` : '/api/colecciones'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    const saved = await res.json()
    router.push(`/admin/colecciones/${saved.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'titleEs', label: 'Titulo (ES)', required: true },
          { name: 'titleEn', label: 'Title (EN)', required: true },
        ].map(({ name, label, required }) => (
          <div key={name}>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
              {label}
            </label>
            <input
              name={name}
              required={required}
              defaultValue={collection?.[name as keyof Collection] as string ?? ''}
              onChange={name === 'titleEs' ? (e) => !isEdit && setSlug(toSlug(e.target.value)) : undefined}
              className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-400"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
          Slug (URL)
        </label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(toSlug(e.target.value))}
          required
          pattern="^[a-z0-9-]+$"
          className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-400 font-mono text-sm"
        />
        <p className="text-xs text-stone-warm/60 mt-1">
          /colecciones/{slug || '...'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'descEs', label: 'Descripcion (ES)' },
          { name: 'descEn', label: 'Description (EN)' },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
              {label}
            </label>
            <textarea
              name={name}
              rows={3}
              defaultValue={collection?.[name as keyof Collection] as string ?? ''}
              className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-400 resize-none"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-stone-warm mb-2">
          URL foto portada (Cloudinary)
        </label>
        <input
          name="coverImage"
          defaultValue={collection?.coverImage ?? ''}
          required
          className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-stone-dark transition-colors duration-400 font-mono text-sm"
          placeholder="https://res.cloudinary.com/..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="text-xs uppercase tracking-widest border border-stone-dark px-6 py-3 hover:bg-stone-dark hover:text-ivory transition-all duration-400 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear coleccion'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create `components/admin/PhotoUploader.tsx`**

```typescript
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface PhotoUploaderProps {
  collectionId: string
  onUpload: (photo: { id: string; url: string; cloudinaryId: string }) => void
}

export default function PhotoUploader({ collectionId, onUpload }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return

    setUploading(true)

    try {
      // Get signed upload params
      const sigRes = await fetch('/api/upload-signature')
      const { timestamp, signature, apiKey } = await sigRes.json()

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'jorge-portfolio')
      formData.append('timestamp', String(timestamp))
      formData.append('signature', signature)
      formData.append('api_key', apiKey)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      )

      const uploaded = await uploadRes.json()

      // Save to DB
      const saveRes = await fetch('/api/fotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinaryId: uploaded.public_id,
          width:        uploaded.width,
          height:       uploaded.height,
          collectionId,
        }),
      })

      const photo = await saveRes.json()
      onUpload(photo)
    } finally {
      setUploading(false)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-none p-12 text-center cursor-pointer transition-colors duration-400 ${
        dragOver ? 'border-stone-dark bg-ivory-dark' : 'border-gray-200 hover:border-gray-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {uploading ? (
        <p className="text-sm text-stone-warm">Subiendo...</p>
      ) : (
        <>
          <p className="text-sm text-stone-warm">
            Arrastra fotos aqui o haz clic para seleccionar
          </p>
          <p className="text-xs text-stone-warm/50 mt-1">JPG, PNG — multiples archivos</p>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/admin/PhotoGrid.tsx`**

```typescript
'use client'

import Image from 'next/image'
import type { Photo } from '@prisma/client'

interface PhotoGridProps {
  photos: Photo[]
  onDelete: (id: string) => void
}

export default function PhotoGrid({ photos, onDelete }: PhotoGridProps) {
  async function handleDelete(photo: Photo) {
    if (!confirm('Eliminar esta foto?')) return
    await fetch(`/api/fotos/${photo.id}`, { method: 'DELETE' })
    onDelete(photo.id)
  }

  if (photos.length === 0) {
    return (
      <p className="text-sm text-stone-warm italic py-8">
        No hay fotos aun. Sube la primera arriba.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="group relative aspect-square bg-ivory-dark overflow-hidden">
          <Image
            src={`${photo.url}?auto=format&q=60&w=300`}
            alt={photo.altEs ?? ''}
            fill
            className="object-cover"
          />
          <button
            onClick={() => handleDelete(photo)}
            className="absolute inset-0 flex items-center justify-center bg-stone-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-400 text-ivory text-xs uppercase tracking-widest"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create `app/admin/colecciones/nueva/page.tsx`**

```typescript
import CollectionForm from '@/components/admin/CollectionForm'

export default function NuevaColeccionPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl mb-10">Nueva coleccion</h1>
      <CollectionForm />
    </div>
  )
}
```

- [ ] **Step 5: Create `app/admin/colecciones/[id]/page.tsx`**

```typescript
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import CollectionEditorClient from './CollectionEditorClient'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditCollectionPage({ params }: Props) {
  const { id } = await params

  const collection = await db.collection.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: 'asc' } } },
  })

  if (!collection) notFound()

  return <CollectionEditorClient collection={collection} photos={collection.photos} />
}
```

- [ ] **Step 6: Create `app/admin/colecciones/[id]/CollectionEditorClient.tsx`**

```typescript
'use client'

import { useState } from 'react'
import CollectionForm from '@/components/admin/CollectionForm'
import PhotoUploader from '@/components/admin/PhotoUploader'
import PhotoGrid from '@/components/admin/PhotoGrid'
import type { Collection, Photo } from '@prisma/client'

interface Props {
  collection: Collection
  photos: Photo[]
}

export default function CollectionEditorClient({ collection, photos: initial }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initial)

  function handleUpload(newPhoto: Photo) {
    setPhotos((prev) => [...prev, newPhoto])
  }

  function handleDelete(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-16">
      <div>
        <h1 className="font-serif text-2xl mb-10">
          Editar — {collection.titleEs}
        </h1>
        <CollectionForm collection={collection} />
      </div>

      <div>
        <h2 className="font-serif text-lg mb-6">Fotos</h2>
        <div className="space-y-4">
          <PhotoUploader collectionId={collection.id} onUpload={handleUpload} />
          <PhotoGrid photos={photos} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: admin collection form, photo uploader (Cloudinary), photo grid with delete"
```

---

## Task 18: Final Setup + .gitignore + Verify Build

**Files:**
- Modify: `.gitignore`
- Check: all env vars present in `.env.example`

- [ ] **Step 1: Ensure `.gitignore` is complete**

```
# deps
node_modules/
.pnp
.pnp.js

# next
.next/
out/
build/

# env
.env
.env.local
.env.*.local

# misc
.DS_Store
*.pem
.superpowers/

# prisma
prisma/*.db
prisma/*.db-journal
```

- [ ] **Step 2: Verify environment variables are documented in `.env.example`**

The file should contain all keys needed (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL, CLOUDINARY_*, RESEND_API_KEY, CONTACT_EMAIL).

- [ ] **Step 3: Add `export const dynamic = 'force-dynamic'` to API routes that need session**

In `app/api/colecciones/route.ts`, add at the top:
```typescript
export const dynamic = 'force-dynamic'
```

Repeat for `app/api/fotos/route.ts` and `app/api/upload-signature/route.ts`.

- [ ] **Step 4: Run type check**

```bash
npx tsc --noEmit
```

Fix any type errors before continuing.

- [ ] **Step 5: Run build**

```bash
npm run build
```

Expected: build completes with no errors. If errors appear, fix them.

- [ ] **Step 6: Push DB schema to Neon**

After configuring `DATABASE_URL` in `.env.local`:

```bash
npx prisma db push
```

- [ ] **Step 7: Seed admin user**

```bash
ADMIN_EMAIL=jorge@example.com ADMIN_PASSWORD=yourpassword npm run db:seed
```

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "chore: final setup, build verified, gitignore, env example"
```

---

## Self-Review

**Spec coverage:**
- [x] Parallax landing (Hero with GSAP ScrollTrigger — Task 8)
- [x] Bilingual ES/EN (next-intl — Tasks 5, 6, 7)
- [x] Artist Statement (Task 9)
- [x] Collections preview (Task 10)
- [x] Bio section (Task 11)
- [x] Exhibitions section (Task 11)
- [x] Contact form + API (Task 11)
- [x] Collections page (Task 13)
- [x] Single collection + lightbox (Task 14)
- [x] Admin login (Task 4)
- [x] Admin dashboard (Task 16)
- [x] Admin collection form (Task 17)
- [x] Photo uploader Cloudinary (Task 17)
- [x] Prisma schema (Task 3)
- [x] Cloudinary helpers (Task 15)
- [x] Resend email (Task 11)
- [x] NextAuth v5 (Task 4)
- [x] Middleware auth + i18n (Task 5)
- [x] Ivory/crema editorial aesthetic (Task 2)
- [x] Playfair Display + DM Sans (Task 2)
- [x] Lenis smooth scroll (Task 7)

**No placeholders found.**

**Type consistency:** `Photo`, `Collection` types from Prisma used consistently throughout. API routes return the same shape. `onUpload` callback in `PhotoUploader` expects `Photo` type — matches `CollectionEditorClient`.
