import { requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ keyId: string }> | { keyId: string }
}

async function getRouteKeyId(context: RouteContext) {
  const params = await context.params
  return params.keyId
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
