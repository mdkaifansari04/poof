import { z } from 'zod'
import { requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { createAgentApiKey } from '@/lib/agent-api-keys'
import { prisma } from '@/lib/prisma'

const createAgentApiKeySchema = z.object({
  name: z.string().trim().min(1).max(80),
})

export async function GET(request: Request) {
  try {
    const authResult = await requireRequestSession(request, { allowApiKey: false })

    if (authResult.response) {
      return authResult.response
    }

    const keys = await prisma.agentApiKey.findMany({
      where: {
        userId: authResult.userId,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
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

    const body = await parseJsonBody<unknown>(request)
    const parsed = createAgentApiKeySchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const created = await createAgentApiKey({
      userId: authResult.userId,
      name: parsed.data.name,
    })

    return ok(created, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
