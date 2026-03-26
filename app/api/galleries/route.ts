import { z } from 'zod'
import { requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { MAX_GALLERIES_PER_USER } from '@/lib/limits'
import { prisma } from '@/lib/prisma'

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

    const galleries = await prisma.gallery.findMany({
      where: {
        userId: authResult.userId,
        deletedAt: null,
      },
      include: {
        images: {
          where: {
            deletedAt: null,
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

    const body = await parseJsonBody<unknown>(request)
    const parsed = createGallerySchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const existingCount = await prisma.gallery.count({
      where: {
        userId: authResult.userId,
        deletedAt: null,
      },
    })

    if (existingCount >= MAX_GALLERIES_PER_USER) {
      throw apiErrors.validation(`Maximum ${MAX_GALLERIES_PER_USER} galleries allowed per user`)
    }

    const gallery = await prisma.gallery.create({
      data: {
        userId: authResult.userId,
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        coverImageId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return ok({
      ...gallery,
      coverImageUrl: null,
      imageCount: 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
