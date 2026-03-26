export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
] as const

export const MAX_IMAGES_PER_GALLERY = 500
export const MAX_GALLERIES_PER_USER = 50
export const PRESIGNED_URL_TTL_SECONDS = 300

export type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number]
