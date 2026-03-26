import { SharedResourceType } from '@prisma/client'
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

async function resolveImageRecord(imageId: string) {
  return prisma.image.findFirst({
    where: {
      id: imageId,
      deletedAt: null,
      uploadStatus: 'CONFIRMED',
    },
    select: {
      id: true,
      fileName: true,
      r2Url: true,
      width: true,
      height: true,
      mimeType: true,
    },
  })
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const resourceId = await getRouteResourceId(context)

    const resource = await prisma.sharedResource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        type: true,
        galleryId: true,
        imageIds: true,
        expiresAt: true,
        revokedAt: true,
        viewCount: true,
      },
    })

    if (!resource) {
      throw apiErrors.notFound('Shared resource not found')
    }

    if (resource.revokedAt) {
      throw apiErrors.revoked('This share link has been revoked')
    }

    if (resource.expiresAt.getTime() <= Date.now()) {
      throw apiErrors.expired('This share link has expired')
    }

    const resourceWithIncrement = await prisma.sharedResource.update({
      where: { id: resource.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        viewCount: true,
      },
    })

    if (resource.type === SharedResourceType.GALLERY) {
      if (!resource.galleryId) {
        throw apiErrors.notFound('Shared gallery not found')
      }

      const gallery = await prisma.gallery.findFirst({
        where: {
          id: resource.galleryId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          description: true,
        },
      })

      if (!gallery) {
        throw apiErrors.notFound('Shared gallery not found')
      }

      const images = await prisma.image.findMany({
        where: {
          galleryId: gallery.id,
          deletedAt: null,
          uploadStatus: 'CONFIRMED',
        },
        select: {
          id: true,
          fileName: true,
          r2Url: true,
          width: true,
          height: true,
          mimeType: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      return ok({
        resourceId: resource.id,
        type: resource.type,
        expiresAt: resource.expiresAt,
        viewCount: resourceWithIncrement.viewCount,
        gallery: {
          ...gallery,
          images,
        },
      })
    }

    if (resource.type === SharedResourceType.IMAGE) {
      const imageId = resource.imageIds[0]

      if (!imageId) {
        throw apiErrors.notFound('Shared image not found')
      }

      const image = await resolveImageRecord(imageId)

      if (!image) {
        throw apiErrors.notFound('Shared image not found')
      }

      return ok({
        resourceId: resource.id,
        type: resource.type,
        expiresAt: resource.expiresAt,
        viewCount: resourceWithIncrement.viewCount,
        image,
      })
    }

    const resolvedImages = await prisma.image.findMany({
      where: {
        id: {
          in: resource.imageIds,
        },
        deletedAt: null,
        uploadStatus: 'CONFIRMED',
      },
      select: {
        id: true,
        fileName: true,
        r2Url: true,
        width: true,
        height: true,
        mimeType: true,
      },
    })

    const imagesById = new Map(resolvedImages.map((image) => [image.id, image]))
    const orderedImages = resource.imageIds
      .map((id) => imagesById.get(id))
      .filter((image): image is NonNullable<typeof image> => Boolean(image))

    if (orderedImages.length === 0) {
      throw apiErrors.notFound('Shared images not found')
    }

    return ok({
      resourceId: resource.id,
      type: resource.type,
      expiresAt: resource.expiresAt,
      viewCount: resourceWithIncrement.viewCount,
      images: orderedImages,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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

    await prisma.sharedResource.delete({
      where: { id: resourceId },
    })

    return ok({
      id: resourceId,
      deleted: true,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
