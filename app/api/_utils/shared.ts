import type { SharedResource } from '@prisma/client'

export type SharedStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export function getAppBaseUrl(request: Request): string {
  const envBase = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL
  if (envBase) {
    return normalizeBaseUrl(envBase)
  }

  return normalizeBaseUrl(new URL(request.url).origin)
}

export function buildShareUrl(request: Request, resourceId: string): string {
  return `${getAppBaseUrl(request)}/shared/${resourceId}`
}

export function getSharedResourceStatus(
  resource: Pick<SharedResource, 'revokedAt' | 'expiresAt'>,
  now = new Date(),
): SharedStatus {
  if (resource.revokedAt) {
    return 'REVOKED'
  }

  if (resource.expiresAt.getTime() <= now.getTime()) {
    return 'EXPIRED'
  }

  return 'ACTIVE'
}
