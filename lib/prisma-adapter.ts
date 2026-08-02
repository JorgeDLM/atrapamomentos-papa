import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaNeon } from '@prisma/adapter-neon'

/** URLs administradas por Prisma (Accelerate / Prisma Postgres). */
const PRISMA_PROTOCOL = /^prisma(\+postgres)?:/i

/** Cualquier endpoint de Neon, con o sin `-pooler`. */
const NEON_HOST = /neon\.tech/i

/**
 * `DATABASE_URL` es la que manda; `DIRECT_URL` es sólo el respaldo.
 *
 * Se descartan las URLs `prisma+postgres://` porque son el protocolo HTTP de
 * Accelerate: ningún driver de Postgres sabe hablarlo. Así, si `DATABASE_URL`
 * todavía apunta a Accelerate, se cae al respaldo en vez de romper.
 */
export function resolveConnectionString(): string {
  const candidates = [process.env.DATABASE_URL, process.env.DIRECT_URL]

  for (const candidate of candidates) {
    const url = candidate?.trim()
    if (url && !PRISMA_PROTOCOL.test(url)) return url
  }

  throw new Error(
    'No hay una cadena de conexión de Postgres utilizable. Define DATABASE_URL ' +
      'con una URL postgres:// (por ejemplo la de Neon). Las URLs ' +
      'prisma+postgres:// de Accelerate no las puede usar el driver directo.',
  )
}

/**
 * Elige el driver por la forma de la URL: Neon por WebSocket cuando el host es
 * de Neon, `pg` por TCP para cualquier otro Postgres.
 */
export function createPrismaAdapter(connectionString: string) {
  return NEON_HOST.test(connectionString)
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString })
}
