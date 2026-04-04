import type { SharedResource } from '@prisma/client'

export type SharedStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function getConfiguredAppBaseUrl(): string | null {
  const candidates = [process.env.NEXT_PUBLIC_APP_URL, process.env.BETTER_AUTH_URL]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    try {
      return normalizeBaseUrl(new URL(candidate).origin)
    } catch {
      // Ignore invalid URL values from env.
    }
  }

  return null
}

export function getAppBaseUrl(request: Request): string {
  const configuredBaseUrl = getConfiguredAppBaseUrl()
  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  return normalizeBaseUrl(new URL(request.url).origin)
}

export function buildShareUrl(request: Request, resourceId: string): string {
  return `${getAppBaseUrl(request)}/shared/${resourceId}`
}

export function buildSharedImageProxyPath(resourceId: string, imageId: string): string {
  const encodedResourceId = encodeURIComponent(resourceId)
  const encodedImageId = encodeURIComponent(imageId)
  return `/api/shared-resources/${encodedResourceId}?imageId=${encodedImageId}`
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
