import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
