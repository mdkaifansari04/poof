import { auth } from '@/lib/auth'
import { fail } from './response'

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>

export async function getRequestSession(request: Request): Promise<AuthSession> {
  return auth.api.getSession({ headers: request.headers })
}

export async function requireRequestSession(request: Request) {
  const session = await getRequestSession(request)

  if (!session) {
    return {
      session: null,
      response: fail('UNAUTHORIZED', 'Authentication required', 401),
    }
  }

  return { session, response: null }
}
