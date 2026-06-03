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
