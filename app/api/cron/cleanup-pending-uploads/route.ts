import { requireCronAuthorization } from '@/app/api/_utils/cron'
import { handleApiError } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'
import { prisma } from '@/lib/prisma'

const STALE_PENDING_MS = 30 * 60 * 1000
const FAILED_RETENTION_MS = 24 * 60 * 60 * 1000

export async function GET(request: Request) {
  try {
    requireCronAuthorization(request)

    const now = Date.now()
    const stalePendingCutoff = new Date(now - STALE_PENDING_MS)
    const failedCleanupCutoff = new Date(now - FAILED_RETENTION_MS)

    const pendingToFailed = await prisma.image.updateMany({
      where: {
        deletedAt: null,
        uploadStatus: 'PENDING',
        createdAt: {
          lt: stalePendingCutoff,
        },
      },
      data: {
        uploadStatus: 'FAILED',
      },
    })

    const deletedFailed = await prisma.image.deleteMany({
      where: {
        deletedAt: null,
        uploadStatus: 'FAILED',
        updatedAt: {
          lt: failedCleanupCutoff,
        },
      },
    })

    return ok({
      markedFailed: pendingToFailed.count,
      deletedFailed: deletedFailed.count,
      stalePendingCutoff: stalePendingCutoff.toISOString(),
      failedCleanupCutoff: failedCleanupCutoff.toISOString(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
