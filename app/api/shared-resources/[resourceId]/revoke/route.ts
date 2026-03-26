import { requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ resourceId: string }> | { resourceId: string }
}

async function getRouteResourceId(context: RouteContext): Promise<string> {
  const params = await context.params
  return params.resourceId
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const resourceId = await getRouteResourceId(context)

    const resource = await prisma.sharedResource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        userId: true,
      },
    })

    if (!resource) {
      throw apiErrors.notFound('Shared resource not found')
    }

    if (resource.userId !== authResult.userId) {
      throw apiErrors.forbidden('You do not have access to this shared resource')
    }

    const revokedAt = new Date()

    const updated = await prisma.sharedResource.update({
      where: { id: resourceId },
      data: {
        revokedAt,
      },
      select: {
        id: true,
        revokedAt: true,
      },
    })

    return ok(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
