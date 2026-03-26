import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { requireRequestSession } from '@/app/api/_utils/auth'
import { prisma } from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ imageId: string }> | { imageId: string }
}

async function getRouteImageId(context: RouteContext): Promise<string> {
  const params = await context.params
  return params.imageId
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const imageId = await getRouteImageId(context)

    const image = await prisma.image.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        userId: true,
        deletedAt: true,
        uploadStatus: true,
      },
    })

    if (!image || image.deletedAt) {
      throw apiErrors.notFound('Image not found')
    }

    if (image.userId !== authResult.userId) {
      throw apiErrors.forbidden('You do not have access to this image')
    }

    if (image.uploadStatus !== 'PENDING') {
      throw apiErrors.validation('Image upload is not pending')
    }

    const updated = await prisma.image.update({
      where: { id: imageId },
      data: {
        uploadStatus: 'FAILED',
      },
      select: {
        id: true,
        galleryId: true,
        uploadStatus: true,
      },
    })

    return ok(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
