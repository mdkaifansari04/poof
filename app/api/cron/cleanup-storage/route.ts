import { requireCronAuthorization } from '@/app/api/_utils/cron'
import { handleApiError } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { prisma } from '@/lib/prisma'
import { uploadService } from '@/lib/upload'

const STORAGE_CLEANUP_RETENTION_MS = 24 * 60 * 60 * 1000
const STORAGE_DELETE_BATCH_SIZE = 100

export async function GET(request: Request) {
  try {
    requireCronAuthorization(request)

    const cutoff = new Date(Date.now() - STORAGE_CLEANUP_RETENTION_MS)
    const candidates = await prisma.image.findMany({
      where: {
        deletedAt: {
          not: null,
          lte: cutoff,
        },
      },
      select: {
        id: true,
        r2Key: true,
      },
      orderBy: {
        deletedAt: 'asc',
      },
    })

    if (candidates.length === 0) {
      return ok({
        deletedFromStorage: 0,
        deletedFromDb: 0,
        batches: 0,
        cutoff: cutoff.toISOString(),
      })
    }

    for (let index = 0; index < candidates.length; index += STORAGE_DELETE_BATCH_SIZE) {
      const batch = candidates.slice(index, index + STORAGE_DELETE_BATCH_SIZE)
      const keys = batch.map((item) => item.r2Key)
      await uploadService.deleteObjects(keys)
    }

    const deleted = await prisma.image.deleteMany({
      where: {
        id: {
          in: candidates.map((item) => item.id),
        },
      },
    })

    return ok({
      deletedFromStorage: candidates.length,
      deletedFromDb: deleted.count,
      batches: Math.ceil(candidates.length / STORAGE_DELETE_BATCH_SIZE),
      cutoff: cutoff.toISOString(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
