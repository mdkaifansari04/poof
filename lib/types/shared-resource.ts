export type SharedResourceType = 'GALLERY' | 'IMAGE' | 'MULTI_IMAGE'
export type SharedResourceStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'

export type CreateSharedResourceInput = {
  type: SharedResourceType
  galleryId?: string
  imageIds?: string[]
  expiresAt: string
}

export type UpdateSharedResourceInput = {
  expiresAt?: string
  reactivate?: boolean
}

export type SharedResourceListItem = {
  id: string
  type: SharedResourceType
  galleryId: string | null
  gallery: { id: string; name: string } | null
  imageIds: string[]
  expiresAt: string
  revokedAt: string | null
  viewCount: number
  createdAt: string
  updatedAt: string
  shareUrl: string
  status: SharedResourceStatus
}

export type SharedImageRecord = {
  id: string
  fileName: string
  r2Url: string
  width: number | null
  height: number | null
  mimeType: string
}

export type PublicSharedGallery = {
  id: string
  name: string
  description: string | null
  images: SharedImageRecord[]
}

export type PublicSharedResource = {
  resourceId: string
  type: SharedResourceType
  expiresAt: string
  viewCount: number
  gallery?: PublicSharedGallery
  image?: SharedImageRecord
  images?: SharedImageRecord[]
}

export type CreateSharedResourceResponse = {
  id: string
  type: SharedResourceType
  expiresAt: string
  shareUrl: string
  createdAt: string
}

export type UpdateSharedResourceResponse = {
  id: string
  type: SharedResourceType
  galleryId: string | null
  imageIds: string[]
  expiresAt: string
  revokedAt: string | null
  viewCount: number
  createdAt: string
  updatedAt: string
  shareUrl: string
  status: SharedResourceStatus
}
