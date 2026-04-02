import { z } from 'zod'
import { requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ keyId: string }>
}

async function getRouteKeyId(context: RouteContext) {
  const params = await context.params
  return params.keyId
}

const updateAgentApiKeySchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    canRead: z.boolean().optional(),
    canWrite: z.boolean().optional(),
    agentResourcesOnly: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  })

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authResult = await requireRequestSession(request, { allowApiKey: false })

    if (authResult.response) {
      return authResult.response
    }

    const keyId = await getRouteKeyId(context)
    const body = await parseJsonBody<unknown>(request)
    const parsed = updateAgentApiKeySchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const existing = await prisma.agentApiKey.findUnique({
      where: {
        id: keyId,
      },
      select: {
        id: true,
        userId: true,
        canRead: true,
        canWrite: true,
        revokedAt: true,
      },
    })

    if (!existing) {
      throw apiErrors.notFound('API key not found')
    }

    if (existing.userId !== authResult.userId) {
      throw apiErrors.forbidden('You do not have access to this API key')
    }

    if (existing.revokedAt) {
      throw apiErrors.validation('Revoked API keys cannot be updated')
    }

    const canRead = parsed.data.canRead ?? existing.canRead
    const canWrite = parsed.data.canWrite ?? existing.canWrite

    if (!canRead && !canWrite) {
      throw apiErrors.validation('API key must enable at least read or write access')
    }

    const updated = await prisma.agentApiKey.update({
      where: {
        id: keyId,
      },
      data: {
        name: parsed.data.name,
        canRead,
        canWrite,
        agentResourcesOnly: parsed.data.agentResourcesOnly,
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
    })

    return ok(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authResult = await requireRequestSession(request, { allowApiKey: false })

    if (authResult.response) {
      return authResult.response
    }

    const keyId = await getRouteKeyId(context)

    const existing = await prisma.agentApiKey.findUnique({
      where: {
        id: keyId,
      },
      select: {
        id: true,
        userId: true,
        canRead: true,
        canWrite: true,
        agentResourcesOnly: true,
        revokedAt: true,
      },
    })

    if (!existing) {
      throw apiErrors.notFound('API key not found')
    }

    if (existing.userId !== authResult.userId) {
      throw apiErrors.forbidden('You do not have access to this API key')
    }

    if (existing.revokedAt) {
      return ok({
        id: existing.id,
        revokedAt: existing.revokedAt,
      })
    }

    const revokedAt = new Date()
    const revoked = await prisma.agentApiKey.update({
      where: {
        id: keyId,
      },
      data: {
        revokedAt,
      },
      select: {
        id: true,
        revokedAt: true,
      },
    })

    return ok(revoked)
  } catch (error) {
    return handleApiError(error)
  }
}
