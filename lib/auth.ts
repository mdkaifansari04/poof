import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { getPrisma } from '@/lib/prisma'

type BetterAuthInstance = ReturnType<typeof betterAuth>

let authInstance: BetterAuthInstance | undefined

export function getAuth(): BetterAuthInstance {
  if (!authInstance) {
    authInstance = betterAuth({
      database: prismaAdapter(getPrisma(), {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // 1 day
      },
      plugins: [nextCookies()],
    })
  }

  return authInstance
}

export const auth = new Proxy({} as BetterAuthInstance, {
  get(_target, property, receiver) {
    const instance = getAuth() as unknown as Record<PropertyKey, unknown>
    const value = Reflect.get(instance, property, receiver)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})
