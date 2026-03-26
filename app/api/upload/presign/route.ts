import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { apiErrors } from '@/app/api/_utils/errors'
import { getFileExtension } from '@/app/api/_utils/gallery'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { requireRequestSession } from '@/app/api/_utils/auth'
import {
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGES_PER_GALLERY,
  PRESIGNED_URL_TTL_SECONDS,
  SUPPORTED_IMAGE_MIME_TYPES,
} from '@/lib/limits'
import { prisma } from '@/lib/prisma'
import { uploadService } from '@/lib/upload'

const presignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1),
  fileSize: z.number().int().positive(),
  galleryId: z.string().trim().min(1),
})

export async function POST(request: Request) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const body = await parseJsonBody<unknown>(request)
    const parsed = presignSchema.safeParse(body)

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid request body')
    }

    const input = parsed.data

    if (!SUPPORTED_IMAGE_MIME_TYPES.includes(input.mimeType as (typeof SUPPORTED_IMAGE_MIME_TYPES)[number])) {
      throw apiErrors.unsupportedType('Supported file types: image/jpeg, image/png, image/webp, image/heic')
    }

    if (input.fileSize > MAX_FILE_SIZE_BYTES) {
      throw apiErrors.fileTooLarge(`Maximum file size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`)
    }

    const gallery = await prisma.gallery.findUnique({
      where: { id: input.galleryId },
      select: {
        id: true,
        userId: true,
        deletedAt: true,
      },
    })

    if (!gallery || gallery.deletedAt) {
      throw apiErrors.notFound('Gallery not found')
    }

    if (gallery.userId !== authResult.userId) {
      throw apiErrors.forbidden('You do not have access to this gallery')
    }

    const imageCount = await prisma.image.count({
      where: {
        galleryId: input.galleryId,
        deletedAt: null,
      },
    })

    if (imageCount >= MAX_IMAGES_PER_GALLERY) {
      throw apiErrors.validation(`Maximum ${MAX_IMAGES_PER_GALLERY} images allowed per gallery`)
    }

    const imageId = randomUUID().replace(/-/g, '')
    const extension = getFileExtension(input.fileName)
    const key = `galleries/${input.galleryId}/${imageId}.${extension}`

    const presigned = await uploadService.getPresignedUploadUrl(
      key,
      input.mimeType,
      PRESIGNED_URL_TTL_SECONDS,
    )

    await prisma.image.create({
      data: {
        id: imageId,
        galleryId: input.galleryId,
        userId: authResult.userId,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        r2Key: presigned.r2Key,
        r2Url: presigned.publicUrl,
        uploadStatus: 'PENDING',
      },
    })

    return ok({
      presignedUrl: presigned.presignedUrl,
      imageId,
      publicUrl: presigned.publicUrl,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
