import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const username = process.env.ADMIN_USERNAME ?? 'jorge'
  const password = process.env.ADMIN_PASSWORD ?? 'tequieropa'
  const hash = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, password: hash },
  })

  console.log(`Admin user created: ${username}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
