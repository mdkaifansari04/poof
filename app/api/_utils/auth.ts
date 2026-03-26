import { auth } from '@/lib/auth'
import { fail } from './response'

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>

export async function getRequestSession(request: Request): Promise<AuthSession> {
  return auth.api.getSession({ headers: request.headers })
}

export function getSessionUserId(session: AuthSession): string | null {
  if (!session) return null

  const userId =
    (session as { user?: { id?: string } }).user?.id ??
    (session as { session?: { userId?: string } }).session?.userId ??
    null

  return typeof userId === 'string' ? userId : null
}

export async function requireRequestSession(request: Request) {
  const session = await getRequestSession(request)
  const userId = getSessionUserId(session)

  if (!session || !userId) {
    return {
      session: null,
      userId: null,
      response: fail('UNAUTHORIZED', 'Authentication required', 401),
    }
  }

  return { session, userId, response: null }
}
