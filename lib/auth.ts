import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { getPrisma } from '@/lib/prisma'

type BetterAuthInstance = ReturnType<typeof betterAuth>

let authInstance: BetterAuthInstance | undefined

function getRuntimeEnv(name: string): string | undefined {
  const processValue = process.env[name]
  if (typeof processValue === 'string' && processValue.length > 0) {
    return processValue
  }

  const globalValue = (globalThis as Record<string, unknown>)[name]
  if (typeof globalValue === 'string' && globalValue.length > 0) {
    return globalValue
  }

  return undefined
}

export function getAuth(): BetterAuthInstance {
  if (!authInstance) {
    const googleClientId = getRuntimeEnv('GOOGLE_CLIENT_ID')
    const googleClientSecret = getRuntimeEnv('GOOGLE_CLIENT_SECRET')

    const options: Parameters<typeof betterAuth>[0] = {
      database: prismaAdapter(getPrisma(), {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 30, // 30 days
        updateAge: 60 * 60 * 24, // 1 day
      },
      plugins: [nextCookies()],
    }

    if (googleClientId && googleClientSecret) {
      options.socialProviders = {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    }

    authInstance = betterAuth(options)
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
