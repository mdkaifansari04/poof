import { auth } from '@/lib/auth'
import { getRequestApiKey, touchAgentApiKey, verifyAgentApiKey } from '@/lib/agent-api-keys'
import { apiErrors } from './errors'
import { fail } from './response'

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>
export type RequestAuthType = 'session' | 'api_key'
export type RequestCapability = 'read' | 'write'

export type RequestApiKeyContext = {
  id: string
  name: string
  prefix: string
  canRead: boolean
  canWrite: boolean
  agentResourcesOnly: boolean
}

export type RequestAuthResult = {
  session: AuthSession | null
  userId: string | null
  authType: RequestAuthType | null
  apiKey: RequestApiKeyContext | null
  response: Response | null
}

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
): Promise<RequestAuthResult> {
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
        canRead: verifiedKey.canRead,
        canWrite: verifiedKey.canWrite,
        agentResourcesOnly: verifiedKey.agentResourcesOnly,
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

export function requireApiCapability(
  authResult: Pick<RequestAuthResult, 'authType' | 'apiKey'>,
  capability: RequestCapability,
): Response | null {
  if (authResult.authType !== 'api_key' || !authResult.apiKey) {
    return null
  }

  if (capability === 'read' && !authResult.apiKey.canRead) {
    return fail('FORBIDDEN', 'API key does not allow read access', 403)
  }

  if (capability === 'write' && !authResult.apiKey.canWrite) {
    return fail('FORBIDDEN', 'API key does not allow write access', 403)
  }

  return null
}

export function getAgentOwnershipKeyId(authResult: Pick<RequestAuthResult, 'authType' | 'apiKey'>) {
  if (authResult.authType !== 'api_key' || !authResult.apiKey?.agentResourcesOnly) {
    return null
  }

  return authResult.apiKey.id
}

export function assertAgentResourceAccess(
  authResult: Pick<RequestAuthResult, 'authType' | 'apiKey'>,
  createdByAgentApiKeyId: string | null | undefined,
  resourceLabel = 'resource',
) {
  const restrictedOwnerKeyId = getAgentOwnershipKeyId(authResult)
  if (!restrictedOwnerKeyId) {
    return
  }

  if (createdByAgentApiKeyId !== restrictedOwnerKeyId) {
    throw apiErrors.forbidden(
      `This API key can only access its own agent-created ${resourceLabel}`,
    )
  }
}
