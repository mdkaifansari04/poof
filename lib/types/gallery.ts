export type UploadStatus = 'PENDING' | 'CONFIRMED' | 'FAILED'

export type GalleryListItem = {
  id: string
  name: string
  description: string | null
  coverImageId: string | null
  coverImageUrl: string | null
  bannerImageUrl: string | null
  bannerImageKey: string | null
  imageCount: number
  createdAt: string
  updatedAt: string
}

export type GalleryImage = {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  r2Url: string
  width: number | null
  height: number | null
  uploadStatus: UploadStatus
  createdAt: string
}

export type GalleryDetail = {
  id: string
  name: string
  description: string | null
  coverImageId: string | null
  coverImageUrl: string | null
  bannerImageUrl: string | null
  bannerImageKey: string | null
  images: GalleryImage[]
  createdAt: string
  updatedAt: string
}

export type CreateGalleryInput = {
  name: string
  description?: string
}

export type UpdateGalleryInput = {
  name?: string
  description?: string | null
  coverImageId?: string | null
  bannerImageUrl?: string | null
  bannerImageKey?: string | null
}

export type PresignUploadInput = {
  fileName: string
  mimeType: string
  fileSize: number
  galleryId: string
}

export type PresignUploadResponse = {
  presignedUrl: string
  imageId: string
  publicUrl: string
}

export type PresignBannerUploadInput = {
  fileName: string
  mimeType: string
  fileSize: number
}

export type PresignBannerUploadResponse = {
  presignedUrl: string
  publicUrl: string
  key: string
}
