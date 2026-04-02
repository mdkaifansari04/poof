import { auth } from '@/lib/auth'
import { getRequestApiKey, touchAgentApiKey, verifyAgentApiKey } from '@/lib/agent-api-keys'
import { fail } from './response'

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>
export type RequestAuthType = 'session' | 'api_key'

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

type RequireRequestSessionOptions = {
  allowApiKey?: boolean
}

export async function requireRequestSession(
  request: Request,
  options: RequireRequestSessionOptions = {},
) {
  const { allowApiKey = true } = options
  const requestApiKey = allowApiKey ? getRequestApiKey(request) : null

  if (requestApiKey) {
    const verifiedKey = await verifyAgentApiKey(requestApiKey)

    if (!verifiedKey) {
      return {
        session: null,
        userId: null,
        authType: null,
        apiKey: null,
        response: fail('UNAUTHORIZED', 'Invalid API key', 401),
      }
    }

    await touchAgentApiKey(verifiedKey.id).catch(() => undefined)

    return {
      session: null,
      userId: verifiedKey.userId,
      authType: 'api_key' as const,
      apiKey: {
        id: verifiedKey.id,
        name: verifiedKey.name,
        prefix: verifiedKey.prefix,
      },
      response: null,
    }
  }

  const session = await getRequestSession(request)
  const userId = getSessionUserId(session)

  if (!session || !userId) {
    return {
      session: null,
      userId: null,
      authType: null,
      apiKey: null,
      response: fail('UNAUTHORIZED', 'Authentication required', 401),
    }
  }

  return {
    session,
    userId,
    authType: 'session' as const,
    apiKey: null,
    response: null,
  }
}
