# Jorge de la Mora Toscana — Portfolio Design Spec
_Date: 2026-06-02_

## Overview

Professional photography portfolio for Jorge de la Mora Toscana — artist, photographer of the everyday and animals, with museum exhibition history. The site must feel like a gallery, not a website. Less is more. Every pixel serves the work.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 App Router + TypeScript | Best-in-class SSR, file-based routing, Server Components |
| Styling | Tailwind CSS (no component libraries) | Full control over every design detail |
| ORM | Prisma | Type-safe, clean migrations |
| Database | Neon (PostgreSQL, serverless) | Generous free tier, zero config with Vercel |
| Auth | NextAuth.js v5 (Credentials) | Simple single-user login for Jorge |
| Images | Cloudinary | Auto-optimization, WebP, CDN, URL transforms |
| Animation | GSAP ScrollTrigger + Lenis | Industry standard for award-winning parallax |
| i18n | next-intl | Bilingual ES/EN with locale routing |
| Email | Resend | Contact form delivery, simple API |
| Deploy | Vercel | Zero-config for Next.js |

---

## Visual Identity

### Palette
- Background: `#F5F0EB` (ivory warm)
- Surface: `#EDE8E3` (warm off-white)
- Text primary: `#1A1714` (near black, warm)
- Text secondary: `#7A7068` (warm gray)
- Accent: `#8B6B4A` (terracotta/warm brown — sparingly)
- White: `#FDFAF7`

### Typography
- **Headings / Name / Titles**: Playfair Display (serif) — elegance, timelessness
- **Body / UI / Labels**: DM Sans (geometric sans-serif) — clean, modern, readable
- **Artist Statement**: Playfair Display Italic — literary, poetic tone

### Principles
- Generous white space (the negative space IS the design)
- Images always full-quality, never cropped awkwardly
- No gradients. No shadows. No rounded corners on photos.
- Hover states: slow fade (400ms), never jump
- Mobile: single column, same elegance, photos full-width

---

## Project Structure

```
papa/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # Locale layout with nav + footer
│   │   ├── page.tsx                # Landing page
│   │   ├── colecciones/
│   │   │   ├── page.tsx            # All collections grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Single collection photo viewer
│   │   └── not-found.tsx
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout (auth guard)
│   │   ├── login/page.tsx
│   │   ├── page.tsx                # Dashboard (collection list)
│   │   ├── colecciones/
│   │   │   ├── nueva/page.tsx      # Create collection
│   │   │   └── [id]/page.tsx       # Edit collection + manage photos
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── colecciones/route.ts
│   │       ├── colecciones/[id]/route.ts
│   │       ├── fotos/route.ts
│   │       └── fotos/[id]/route.ts
│   └── globals.css
├── components/
│   ├── landing/
│   │   ├── Hero.tsx               # Full-screen parallax hero
│   │   ├── Statement.tsx          # Artist statement section
│   │   ├── CollectionsPreview.tsx # Featured 3-4 collections
│   │   ├── Bio.tsx                # About Jorge
│   │   ├── Exhibitions.tsx        # Exhibition history
│   │   └── Contact.tsx            # Contact form
│   ├── gallery/
│   │   ├── CollectionGrid.tsx     # Asymmetric masonry grid
│   │   ├── PhotoViewer.tsx        # Full-screen photo modal
│   │   └── PhotoCard.tsx          # Individual photo tile
│   ├── admin/
│   │   ├── CollectionForm.tsx
│   │   ├── PhotoUploader.tsx      # Drag & drop Cloudinary upload
│   │   └── PhotoGrid.tsx          # Reorderable photo grid
│   └── ui/
│       ├── Nav.tsx
│       ├── Footer.tsx
│       ├── LanguageSwitcher.tsx
│       └── ScrollProgress.tsx
├── lib/
│   ├── auth.ts                    # NextAuth config
│   ├── cloudinary.ts              # Upload + delete helpers
│   ├── db.ts                      # Prisma client singleton
│   └── resend.ts                  # Email helper
├── messages/
│   ├── es.json
│   └── en.json
├── prisma/
│   └── schema.prisma
└── public/
    └── assets/                    # Static assets (see assets.md)
```

---

## Data Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
}

model Collection {
  id          String   @id @default(cuid())
  slug        String   @unique
  titleEs     String
  titleEn     String
  descEs      String?
  descEn      String?
  coverImage  String   // Cloudinary URL (auto-optimized)
  published   Boolean  @default(false)
  order       Int      @default(0)
  photos      Photo[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Photo {
  id           String     @id @default(cuid())
  cloudinaryId String     @unique
  url          String     // Cloudinary base URL
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

---

## Landing Page — Section Breakdown

### 1. Hero (full screen, parallax)
- Background: Jorge's strongest photo, full viewport, no overlay
- Foreground layer: name in Playfair Display, large, centered, parallax slower than bg
- Subtle scroll indicator (animated line going down)
- On scroll: photo slides slower than viewport (classic parallax depth)

### 2. Artist Statement
- Dark background section (breaks the ivory rhythm intentionally)
- Single sentence or short paragraph in Playfair Display Italic, centered, large
- No decoration. The text is the design.
- Bilingual: ES by default, EN on locale switch

### 3. Collections Preview
- Asymmetric grid: 2 large + 2 small, or 1 hero + 3 side
- Each collection: hover reveals title, slow fade
- CTA: "Ver todas las colecciones" / "View all collections"
- Parallax: each image moves at slightly different speed on scroll

### 4. Bio — Sobre Jorge
- Two-column: photo of Jorge (left) + text (right) on desktop
- Single column on mobile
- Text: literary tone, not CV. First person optional.
- Photo: black and white portrait, no background (or dark bg)

### 5. Exposiciones
- Clean timeline or vertical list
- Year — Museum/Gallery — City
- No decorative elements, just typography

### 6. Contacto
- Minimal form: Nombre, Email, Mensaje
- Send via Resend API to Jorge's email
- Success/error state with subtle animation
- No CAPTCHA (too much friction for a portfolio)

---

## Collections Page

- Masonry/asymmetric grid of all published collections
- Each card: cover image + title, minimal hover state
- No sidebar, no filters — purity

## Single Collection Page

- Collection title + description at top (short)
- Photos in a responsive masonry grid
- Click photo → full-screen lightbox modal
  - Keyboard navigation (arrow keys)
  - Touch swipe on mobile
  - ESC to close
  - Photo counter (3 / 12)
  - Alt text visible below (subtle)

---

## Admin Panel

Minimal, functional. Not designed to impress — designed to not get in the way.

### /admin/login
- Email + password form
- Single user (Jorge), password stored hashed in DB

### /admin (Dashboard)
- List of all collections (title, photo count, status published/draft, date)
- Button: Nueva coleccion
- Each row: edit link, toggle publish, delete

### /admin/colecciones/nueva + /admin/colecciones/[id]
- Fields: Title ES, Title EN, Description ES, Description EN, Slug (auto-generated, editable), Cover photo
- Photo section: drag & drop upload to Cloudinary
- Uploaded photos appear in reorderable grid (drag to reorder)
- Delete individual photos
- Save / Publish toggle

---

## Auth & Security

- NextAuth.js v5 Credentials provider
- bcrypt for password hashing
- Admin routes protected via middleware (`matcher: ['/admin/:path*']`)
- API routes check session server-side
- Cloudinary unsigned upload preset for client-side upload (scoped to portfolio folder)
- Environment variables for all secrets (never hardcoded)
- Contact form: basic validation + rate limit via Vercel Edge Config or simple in-memory store

---

## Performance

- All images served through Cloudinary CDN with `f_auto,q_auto` transforms
- Next.js `<Image>` for non-Cloudinary images
- GSAP loaded only on client (dynamic import)
- Lenis smooth scroll initialized once at root layout
- `next-intl` static rendering for all public pages
- Collections page: ISR with 60s revalidation

---

## i18n — Content Structure

All user-facing text in `/messages/es.json` and `/messages/en.json`. Collection titles/descriptions stored bilingual in DB. Nav, footer, UI strings fully translated.

---

## Assets Required

See `docs/assets-needed.md` for complete list of photography/visual assets Jorge must provide.
