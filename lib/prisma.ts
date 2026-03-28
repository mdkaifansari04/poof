import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'
import { PrismaClient } from '@prisma/client/edge'

type PrismaGlobalState = {
  prisma: PrismaClient | undefined
  prismaPool: Pool | undefined
}

const globalForPrisma = globalThis as typeof globalThis & {
  __poofPrisma?: PrismaGlobalState
}

function getGlobalDatabaseUrl(): string | undefined {
  const candidate = (globalThis as { DATABASE_URL?: unknown }).DATABASE_URL
  return typeof candidate === 'string' ? candidate : undefined
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? getGlobalDatabaseUrl()
  if (!url) {
    throw new Error('DATABASE_URL is required to initialize Prisma')
  }

  return url
}

function getPrismaState(): PrismaGlobalState {
  if (!globalForPrisma.__poofPrisma) {
    globalForPrisma.__poofPrisma = {
      prisma: undefined,
      prismaPool: undefined,
    }
  }

  return globalForPrisma.__poofPrisma
}

export function getPrisma(): PrismaClient {
  const state = getPrismaState()

  if (state.prisma) {
    return state.prisma
  }

  const pool =
    state.prismaPool ??
    new Pool({
      connectionString: getDatabaseUrl(),
    })

  const adapter = new PrismaNeon(pool)
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  state.prismaPool = pool
  state.prisma = client

  return client
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrisma() as unknown as Record<PropertyKey, unknown>
    const value = Reflect.get(client, property, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
