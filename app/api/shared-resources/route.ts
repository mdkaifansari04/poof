import { z } from 'zod'
import { requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { buildShareUrl, getSharedResourceStatus } from '@/app/api/_utils/shared'
import {
  MAX_ACTIVE_SHARE_LINKS_PER_GALLERY,
  MAX_IMAGES_PER_MULTI_SHARE,
  MAX_SHARE_EXPIRY_MS,
  MIN_SHARE_EXPIRY_MS,
} from '@/lib/limits'
import { prisma } from '@/lib/prisma'

const createSharedResourceSchema = z.object({
  type: z.enum(['GALLERY', 'IMAGE', 'MULTI_IMAGE']),
  galleryId: z.string().trim().min(1).optional(),
  imageIds: z.array(z.string().trim().min(1)).optional(),
  expiresAt: z.string().datetime(),
})

async function getOwnedGalleryOrThrow(galleryId: string, userId: string) {
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: {
      id: true,
      userId: true,
      deletedAt: true,
      name: true,
    },
  })

  if (!gallery || gallery.deletedAt) {
    throw apiErrors.notFound('Gallery not found')
  }

  if (gallery.userId !== userId) {
    throw apiErrors.forbidden('You do not have access to this gallery')
  }

  return gallery
}

export async function GET(request: Request) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const resources = await prisma.sharedResource.findMany({
      where: {
        userId: authResult.userId,
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
        gallery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const now = new Date()

    return ok(
      resources.map((resource) => ({
        ...resource,
        shareUrl: buildShareUrl(request, resource.id),
        status: getSharedResourceStatus(resource, now),
      })),
    )
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const body = await parseJsonBody<unknown>(request)
    const parsed = createSharedResourceSchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const input = parsed.data
    const now = new Date()
    const expiresAt = new Date(input.expiresAt)

    if (Number.isNaN(expiresAt.getTime())) {
      throw apiErrors.validation('expiresAt must be a valid ISO timestamp')
    }

    if (expiresAt.getTime() <= now.getTime()) {
      throw apiErrors.validation('expiresAt must be in the future')
    }

    const expiryDistance = expiresAt.getTime() - now.getTime()
    if (expiryDistance < MIN_SHARE_EXPIRY_MS) {
      throw apiErrors.validation('Expiry must be at least 1 hour from now')
    }

    if (expiryDistance > MAX_SHARE_EXPIRY_MS) {
      throw apiErrors.validation('Expiry cannot be more than 1 year from now')
    }

    let resolvedGalleryId: string
    let imageIds: string[] = []

    if (input.type === 'GALLERY') {
      if (!input.galleryId) {
        throw apiErrors.validation('galleryId is required for GALLERY shares')
      }

      if (input.imageIds && input.imageIds.length > 0) {
        throw apiErrors.validation('imageIds must be empty for GALLERY shares')
      }

      const gallery = await getOwnedGalleryOrThrow(input.galleryId, authResult.userId)
      resolvedGalleryId = gallery.id
    } else {
      const providedImageIds = input.imageIds ?? []

      if (providedImageIds.length === 0) {
        throw apiErrors.validation('imageIds are required for IMAGE and MULTI_IMAGE shares')
      }

      const hasDuplicates = new Set(providedImageIds).size !== providedImageIds.length
      if (hasDuplicates) {
        throw apiErrors.validation('imageIds must not contain duplicates')
      }

      if (input.type === 'IMAGE' && providedImageIds.length !== 1) {
        throw apiErrors.validation('IMAGE share must include exactly 1 imageId')
      }

      if (
        input.type === 'MULTI_IMAGE' &&
        (providedImageIds.length < 2 || providedImageIds.length > MAX_IMAGES_PER_MULTI_SHARE)
      ) {
        throw apiErrors.validation(
          `MULTI_IMAGE share must include between 2 and ${MAX_IMAGES_PER_MULTI_SHARE} images`,
        )
      }

      const images = await prisma.image.findMany({
        where: {
          id: {
            in: providedImageIds,
          },
          userId: authResult.userId,
          deletedAt: null,
          uploadStatus: 'CONFIRMED',
        },
        select: {
          id: true,
          galleryId: true,
        },
      })

      if (images.length !== providedImageIds.length) {
        throw apiErrors.validation('One or more selected images are invalid for sharing')
      }

      const galleryIds = Array.from(new Set(images.map((image) => image.galleryId)))
      if (galleryIds.length !== 1 || !galleryIds[0]) {
        throw apiErrors.validation('All images in a share must belong to the same gallery')
      }

      resolvedGalleryId = galleryIds[0]
      imageIds = providedImageIds
    }

    const activeLinksCount = await prisma.sharedResource.count({
      where: {
        userId: authResult.userId,
        galleryId: resolvedGalleryId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    })

    if (activeLinksCount >= MAX_ACTIVE_SHARE_LINKS_PER_GALLERY) {
      throw apiErrors.validation(
        `Maximum ${MAX_ACTIVE_SHARE_LINKS_PER_GALLERY} active share links allowed per gallery`,
      )
    }

    const created = await prisma.sharedResource.create({
      data: {
        userId: authResult.userId,
        type: input.type,
        galleryId: resolvedGalleryId,
        imageIds: input.type === 'GALLERY' ? [] : imageIds,
        expiresAt,
      },
      select: {
        id: true,
        type: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    return ok({
      ...created,
      shareUrl: buildShareUrl(request, created.id),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
