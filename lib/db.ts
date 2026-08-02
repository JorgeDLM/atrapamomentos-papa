import { PrismaClient } from '@prisma/client'
import { createPrismaAdapter, resolveConnectionString } from './prisma-adapter'

function createPrismaClient() {
  const adapter = createPrismaAdapter(resolveConnectionString())
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
