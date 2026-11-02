import { PrismaNeonHTTP } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return new PrismaClient({ log: ['query'] })
  }

  const adapter = new PrismaNeonHTTP(connectionString, {})
  return new PrismaClient({ adapter, log: ['query'] })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
