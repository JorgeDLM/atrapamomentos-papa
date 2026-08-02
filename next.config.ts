import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
    '@prisma/adapter-neon',
    '@neondatabase/serverless',
    'pg',
    'bcryptjs',
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Allow high-quality values (Next 16 only permits declared qualities).
    qualities: [75, 90, 95, 100],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
