import { z } from 'zod'
import { requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { createAgentApiKey } from '@/lib/agent-api-keys'
import { prisma } from '@/lib/prisma'

const createAgentApiKeySchema = z.object({
  name: z.string().trim().min(1).max(80),
  canRead: z.boolean().optional(),
  canWrite: z.boolean().optional(),
  agentResourcesOnly: z.boolean().optional(),
})

export async function GET(request: Request) {
  try {
    const authResult = await requireRequestSession(request, { allowApiKey: false })

    if (authResult.response) {
      return authResult.response
    }
    const userId = authResult.userId
    if (!userId) {
      throw apiErrors.unauthorized()
    }

    const keys = await prisma.agentApiKey.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        canRead: true,
        canWrite: true,
        agentResourcesOnly: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return ok(keys)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireRequestSession(request, { allowApiKey: false })

    if (authResult.response) {
      return authResult.response
    }
    const userId = authResult.userId
    if (!userId) {
      throw apiErrors.unauthorized()
    }

    const body = await parseJsonBody<unknown>(request)
    const parsed = createAgentApiKeySchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const canRead = parsed.data.canRead ?? true
    const canWrite = parsed.data.canWrite ?? true

    if (!canRead && !canWrite) {
      throw apiErrors.validation('API key must enable at least read or write access')
    }

    const created = await createAgentApiKey({
      userId,
      name: parsed.data.name,
      permissions: {
        canRead,
        canWrite,
        agentResourcesOnly: parsed.data.agentResourcesOnly ?? false,
      },
    })

    return ok(created, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
