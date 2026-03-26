import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  CreateGalleryInput,
  GalleryListItem,
  PresignUploadInput,
  PresignUploadResponse,
  UpdateGalleryInput,
} from '@/lib/types/gallery'
import type {
  CreateSharedResourceInput,
  CreateSharedResourceResponse,
} from '@/lib/types/shared-resource'
import { queryKeys } from './queries'

export function useCreateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateGalleryInput) =>
      api.post('/galleries', body) as Promise<GalleryListItem>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleries() })
    },
  })
}

export function useUpdateGallery(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateGalleryInput) =>
      api.patch(`/galleries/${id}`, body) as Promise<GalleryListItem>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gallery(id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleries() })
    },
  })
}

export function useDeleteGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/galleries/${id}`) as Promise<{ id: string; deletedAt: string }>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleries() })
    },
  })
}

export function useRequestPresignedUrl() {
  return useMutation({
    mutationFn: (body: PresignUploadInput) =>
      api.post('/upload/presign', body) as Promise<PresignUploadResponse>,
  })
}

export function useConfirmUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ imageId }: { imageId: string; galleryId: string }) =>
      api.post(`/images/${imageId}/confirm`) as Promise<{ id: string; galleryId: string; uploadStatus: string }>,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gallery(variables.galleryId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleries() })
    },
  })
}

export function useFailUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ imageId }: { imageId: string; galleryId: string }) =>
      api.post(`/images/${imageId}/fail`) as Promise<{ id: string; galleryId: string; uploadStatus: string }>,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gallery(variables.galleryId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleries() })
    },
  })
}

export function useDeleteImage(galleryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => api.delete(`/images/${imageId}`) as Promise<{ id: string; deletedAt: string }>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.gallery(galleryId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.galleries() })
    },
  })
}

// Phase 3
export function useCreateSharedResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateSharedResourceInput) =>
      api.post('/shared-resources', body) as Promise<CreateSharedResourceResponse>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sharedResources() })
    },
  })
}

// Phase 3
export function useRevokeSharedResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resourceId: string) =>
      api.post(`/shared-resources/${resourceId}/revoke`) as Promise<{
        id: string
        revokedAt: string
      }>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sharedResources() })
    },
  })
}

// Phase 3
export function useDeleteSharedResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resourceId: string) =>
      api.delete(`/shared-resources/${resourceId}`) as Promise<{
        id: string
        deleted: true
      }>,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sharedResources() })
    },
  })
}
