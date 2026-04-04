import { z } from 'zod'
import { NextResponse } from 'next/server'
import {
  getAgentOwnershipKeyId,
  requireApiCapability,
  requireRequestSession,
} from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import {
  buildShareUrl,
  buildSharedImageProxyPath,
  getSharedResourceStatus,
} from '@/app/api/_utils/shared'
import { MAX_SHARE_EXPIRY_MS, MIN_SHARE_EXPIRY_MS } from '@/lib/limits'
import { prisma } from '@/lib/prisma'
import { uploadService } from '@/lib/upload'

const SHARED_IMAGE_DOWNLOAD_TTL_SECONDS = 60

type RouteContext = {
  params: Promise<{ resourceId: string }>
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
      width: true,
      height: true,
      mimeType: true,
    },
  })
}

async function resolveSharedImageR2Key(
  resource: {
    type: 'GALLERY' | 'IMAGE' | 'MULTI_IMAGE'
    galleryId: string | null
    imageIds: string[]
  },
  imageId: string,
) {
  if (resource.type === 'GALLERY') {
    if (!resource.galleryId) {
      return null
    }

    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        galleryId: resource.galleryId,
        deletedAt: null,
        uploadStatus: 'CONFIRMED',
      },
      select: {
        r2Key: true,
      },
    })

    return image?.r2Key ?? null
  }

  if (!resource.imageIds.includes(imageId)) {
    return null
  }

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      deletedAt: null,
      uploadStatus: 'CONFIRMED',
    },
    select: {
      r2Key: true,
    },
  })

  return image?.r2Key ?? null
}

function toSharedImagePayload(
  resourceId: string,
  image: {
    id: string
    fileName: string
    width: number | null
    height: number | null
    mimeType: string
  },
) {
  return {
    ...image,
    r2Url: buildSharedImageProxyPath(resourceId, image.id),
  }
}

const updateSharedResourceSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  reactivate: z.boolean().optional(),
})

export async function GET(request: Request, context: RouteContext) {
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

    const imageId = new URL(request.url).searchParams.get('imageId')
    if (imageId) {
      const imageR2Key = await resolveSharedImageR2Key(
        {
          type: resource.type,
          galleryId: resource.galleryId,
          imageIds: resource.imageIds,
        },
        imageId,
      )

      if (!imageR2Key) {
        throw apiErrors.notFound('Shared image not found')
      }

      const signedDownloadUrl = await uploadService.getPresignedDownloadUrl(
        imageR2Key,
        SHARED_IMAGE_DOWNLOAD_TTL_SECONDS,
      )

      return NextResponse.redirect(signedDownloadUrl, {
        status: 307,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      })
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

    if (resource.type === 'GALLERY') {
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
          images: images.map((image) => toSharedImagePayload(resource.id, image)),
        },
      })
    }

    if (resource.type === 'IMAGE') {
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
        image: toSharedImagePayload(resource.id, image),
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
      images: orderedImages.map((image) => toSharedImagePayload(resource.id, image)),
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

    const capabilityError = requireApiCapability(authResult, 'write')
    if (capabilityError) {
      return capabilityError
    }

    const restrictedOwnerKeyId = getAgentOwnershipKeyId(authResult)
    const resourceId = await getRouteResourceId(context)

    const resource = await prisma.sharedResource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        userId: true,
        createdByAgentApiKeyId: true,
      },
    })

    if (!resource) {
      throw apiErrors.notFound('Shared resource not found')
    }

    if (resource.userId !== authResult.userId) {
      throw apiErrors.forbidden('You do not have access to this shared resource')
    }

    if (restrictedOwnerKeyId && resource.createdByAgentApiKeyId !== restrictedOwnerKeyId) {
      throw apiErrors.forbidden('This API key can only access its own agent-created share links')
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const capabilityError = requireApiCapability(authResult, 'write')
    if (capabilityError) {
      return capabilityError
    }

    const restrictedOwnerKeyId = getAgentOwnershipKeyId(authResult)
    const body = await parseJsonBody<unknown>(request)
    const parsed = updateSharedResourceSchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const input = parsed.data
    if (!input.expiresAt && input.reactivate !== true) {
      throw apiErrors.validation('Provide expiresAt and/or reactivate=true')
    }

    const resourceId = await getRouteResourceId(context)

    const resource = await prisma.sharedResource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        userId: true,
        type: true,
        galleryId: true,
        imageIds: true,
        expiresAt: true,
        revokedAt: true,
        viewCount: true,
        createdByAgentApiKeyId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!resource) {
      throw apiErrors.notFound('Shared resource not found')
    }

    if (resource.userId !== authResult.userId) {
      throw apiErrors.forbidden('You do not have access to this shared resource')
    }

    if (restrictedOwnerKeyId && resource.createdByAgentApiKeyId !== restrictedOwnerKeyId) {
      throw apiErrors.forbidden('This API key can only access its own agent-created share links')
    }

    const now = new Date()
    let nextExpiresAt = resource.expiresAt

    if (input.expiresAt) {
      const parsedExpiresAt = new Date(input.expiresAt)
      if (Number.isNaN(parsedExpiresAt.getTime())) {
        throw apiErrors.validation('expiresAt must be a valid ISO timestamp')
      }

      const expiryDistance = parsedExpiresAt.getTime() - now.getTime()
      if (expiryDistance <= 0) {
        throw apiErrors.validation('expiresAt must be in the future')
      }
      if (expiryDistance < MIN_SHARE_EXPIRY_MS) {
        throw apiErrors.validation('Expiry must be at least 1 hour from now')
      }
      if (expiryDistance > MAX_SHARE_EXPIRY_MS) {
        throw apiErrors.validation('Expiry cannot be more than 1 year from now')
      }

      nextExpiresAt = parsedExpiresAt
    }

    if (input.reactivate === true && nextExpiresAt.getTime() <= now.getTime()) {
      throw apiErrors.validation('Provide a future expiry to reactivate this link')
    }

    const updated = await prisma.sharedResource.update({
      where: { id: resourceId },
      data: {
        expiresAt: nextExpiresAt,
        revokedAt: input.reactivate === true ? null : undefined,
      },
      select: {
        id: true,
        type: true,
        galleryId: true,
        imageIds: true,
        expiresAt: true,
        revokedAt: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return ok({
      ...updated,
      shareUrl: buildShareUrl(request, updated.id),
      status: getSharedResourceStatus(updated),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
