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

export async function DELETE(request: Request, context: RouteContext) {
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
        galleryId: true,
        deletedAt: true,
      },
    })

    if (!image || image.deletedAt) {
      throw apiErrors.notFound('Image not found')
    }

    if (image.userId !== authResult.userId) {
      throw apiErrors.forbidden('You do not have access to this image')
    }

    const deletedAt = new Date()

    await prisma.$transaction([
      prisma.image.update({
        where: { id: imageId },
        data: { deletedAt },
      }),
      prisma.gallery.updateMany({
        where: {
          id: image.galleryId,
          coverImageId: imageId,
        },
        data: { coverImageId: null },
      }),
    ])

    return ok({ id: imageId, deletedAt })
  } catch (error) {
    return handleApiError(error)
  }
}
