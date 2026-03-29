import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { getFileExtension } from '@/app/api/_utils/gallery'
import { handleApiError, parseJsonBody } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { MAX_FILE_SIZE_BYTES, PRESIGNED_URL_TTL_SECONDS, SUPPORTED_IMAGE_MIME_TYPES } from '@/lib/limits'
import { prisma } from '@/lib/prisma'
import { uploadService } from '@/lib/upload'

type RouteContext = {
  params: Promise<{ id: string }> | { id: string }
}

const bannerPresignSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1),
  fileSize: z.number().int().positive(),
})

async function getRouteId(context: RouteContext): Promise<string> {
  const params = await context.params
  return params.id
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const galleryId = await getRouteId(context)
    const gallery = await prisma.gallery.findFirst({
      where: {
        id: galleryId,
        userId: authResult.userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    })

    if (!gallery) {
      throw apiErrors.notFound('Gallery not found')
    }

    const body = await parseJsonBody<unknown>(request)
    const parsed = bannerPresignSchema.safeParse(body)

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

    const extension = getFileExtension(input.fileName)
    const key = `galleries/${galleryId}/banner/${randomUUID().replace(/-/g, '')}.${extension}`
    const presigned = await uploadService.getPresignedUploadUrl(
      key,
      input.mimeType,
      PRESIGNED_URL_TTL_SECONDS,
    )

    return ok({
      presignedUrl: presigned.presignedUrl,
      publicUrl: presigned.publicUrl,
      key: presigned.r2Key,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
