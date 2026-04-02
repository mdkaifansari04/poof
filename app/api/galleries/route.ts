import { z } from 'zod'
import { getAgentOwnershipKeyId, requireApiCapability, requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { MAX_GALLERIES_PER_USER } from '@/lib/limits'
import { prisma } from '@/lib/prisma'

const SUPPORT_EMAIL = 'poof-support@k04.tech'
const HELLO_EMAIL = 'hello-poof@k04.tech'

const createGallerySchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(500).optional(),
})

export async function GET(request: Request) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }
    const userId = authResult.userId
    if (!userId) {
      throw apiErrors.unauthorized()
    }

    const capabilityError = requireApiCapability(authResult, 'read')
    if (capabilityError) {
      return capabilityError
    }

    const restrictedOwnerKeyId = getAgentOwnershipKeyId(authResult) ?? undefined

    const galleries = await prisma.gallery.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(restrictedOwnerKeyId ? { createdByAgentApiKeyId: restrictedOwnerKeyId } : {}),
      },
      include: {
        images: {
          where: {
            deletedAt: null,
            ...(restrictedOwnerKeyId ? { createdByAgentApiKeyId: restrictedOwnerKeyId } : {}),
          },
          select: {
            id: true,
            r2Url: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const data = galleries.map((gallery) => {
      const coverImage = gallery.coverImageId
        ? gallery.images.find((image) => image.id === gallery.coverImageId)
        : gallery.images[0]

      return {
        id: gallery.id,
        name: gallery.name,
        description: gallery.description,
        coverImageId: gallery.coverImageId,
        coverImageUrl: coverImage?.r2Url ?? null,
        bannerImageUrl: gallery.bannerImageUrl,
        bannerImageKey: gallery.bannerImageKey,
        imageCount: gallery.images.length,
        createdAt: gallery.createdAt,
        updatedAt: gallery.updatedAt,
      }
    })

    return ok(data)
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
    const userId = authResult.userId
    if (!userId) {
      throw apiErrors.unauthorized()
    }

    const capabilityError = requireApiCapability(authResult, 'write')
    if (capabilityError) {
      return capabilityError
    }

    const body = await parseJsonBody<unknown>(request)
    const parsed = createGallerySchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const existingCount = await prisma.gallery.count({
      where: {
        userId,
        deletedAt: null,
      },
    })

    if (existingCount >= MAX_GALLERIES_PER_USER) {
      throw apiErrors.validation(
        `Maximum ${MAX_GALLERIES_PER_USER} galleries allowed per user on the free plan. For higher limits, contact ${SUPPORT_EMAIL} or ${HELLO_EMAIL}.`,
      )
    }

    const gallery = await prisma.gallery.create({
      data: {
        userId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        createdByAgentApiKeyId: authResult.apiKey?.id ?? null,
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

    return ok({
      ...gallery,
      coverImageUrl: null,
      bannerImageUrl: gallery.bannerImageUrl,
      bannerImageKey: gallery.bannerImageKey,
      imageCount: 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
