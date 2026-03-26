export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
] as const

// Temporary free-tier limits
export const MAX_IMAGES_PER_GALLERY = 10
export const MAX_GALLERIES_PER_USER = 3
export const PRESIGNED_URL_TTL_SECONDS = 300
export const MAX_IMAGES_PER_MULTI_SHARE = 100
export const MAX_ACTIVE_SHARE_LINKS_PER_GALLERY = 20
export const MIN_SHARE_EXPIRY_MS = 60 * 60 * 1000
export const MAX_SHARE_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000

export type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number]
