import { z } from 'zod'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { requireRequestSession } from '@/app/api/_utils/auth'
import { prisma } from '@/lib/prisma'
import { uploadService } from '@/lib/upload'

const updateGallerySchema = z
  .object({
    name: z.string().trim().min(1).max(60).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    coverImageId: z.string().trim().min(1).nullable().optional(),
    bannerImageUrl: z.string().trim().url().nullable().optional(),
    bannerImageKey: z.string().trim().min(1).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  })

type RouteContext = {
  params: Promise<{ id: string }> | { id: string }
}

async function getRouteId(context: RouteContext): Promise<string> {
  const params = await context.params
  return params.id
}

async function getOwnedGalleryOrThrow(galleryId: string, userId: string) {
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: {
      id: true,
      userId: true,
      deletedAt: true,
      bannerImageKey: true,
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

export async function GET(request: Request, context: RouteContext) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const galleryId = await getRouteId(context)
    await getOwnedGalleryOrThrow(galleryId, authResult.userId)

    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      select: {
        id: true,
        name: true,
        description: true,
        coverImageId: true,
        bannerImageUrl: true,
        bannerImageKey: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!gallery) {
      throw apiErrors.notFound('Gallery not found')
    }

    const images = await prisma.image.findMany({
      where: {
        galleryId,
        deletedAt: null,
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        r2Url: true,
        width: true,
        height: true,
        uploadStatus: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const coverImageUrl = gallery?.coverImageId
      ? images.find((image) => image.id === gallery.coverImageId)?.r2Url ?? null
      : images[0]?.r2Url ?? null

    return ok({
      ...gallery,
      coverImageUrl,
      bannerImageUrl: gallery.bannerImageUrl,
      bannerImageKey: gallery.bannerImageKey,
      images,
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

    const galleryId = await getRouteId(context)
    const gallery = await getOwnedGalleryOrThrow(galleryId, authResult.userId)

    const body = await parseJsonBody<unknown>(request)
    const parsed = updateGallerySchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    if (parsed.data.coverImageId) {
      const coverImage = await prisma.image.findFirst({
        where: {
          id: parsed.data.coverImageId,
          userId: authResult.userId,
          galleryId,
          deletedAt: null,
        },
        select: { id: true },
      })

      if (!coverImage) {
        throw apiErrors.validation('coverImageId must reference an image in the same gallery')
      }
    }

    const previousBannerImageKey = gallery.bannerImageKey

    const updated = await prisma.gallery.update({
      where: { id: galleryId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        coverImageId: parsed.data.coverImageId,
        bannerImageUrl: parsed.data.bannerImageUrl,
        bannerImageKey: parsed.data.bannerImageKey,
      },
      select: {
        id: true,
        name: true,
        description: true,
        coverImageId: true,
        bannerImageUrl: true,
        bannerImageKey: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const nextBannerImageKey = updated.bannerImageKey
    const shouldDeleteOldBanner =
      Boolean(previousBannerImageKey) &&
      previousBannerImageKey !== nextBannerImageKey &&
      previousBannerImageKey?.startsWith(`galleries/${galleryId}/banner/`)

    if (shouldDeleteOldBanner && previousBannerImageKey) {
      await uploadService.deleteObject(previousBannerImageKey).catch(() => undefined)
    }

    const images = await prisma.image.findMany({
      where: {
        galleryId,
        deletedAt: null,
      },
      select: {
        id: true,
        r2Url: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const coverImageUrl = updated.coverImageId
      ? images.find((image) => image.id === updated.coverImageId)?.r2Url ?? null
      : images[0]?.r2Url ?? null

    return ok({
      ...updated,
      coverImageUrl,
      bannerImageUrl: updated.bannerImageUrl,
      bannerImageKey: updated.bannerImageKey,
      imageCount: images.length,
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

    const galleryId = await getRouteId(context)
    await getOwnedGalleryOrThrow(galleryId, authResult.userId)

    const deletedAt = new Date()

    await prisma.$transaction([
      prisma.gallery.update({
        where: { id: galleryId },
        data: { deletedAt },
      }),
      prisma.image.updateMany({
        where: {
          galleryId,
          deletedAt: null,
        },
        data: { deletedAt },
      }),
    ])

    return ok({ id: galleryId, deletedAt })
  } catch (error) {
    return handleApiError(error)
  }
}
