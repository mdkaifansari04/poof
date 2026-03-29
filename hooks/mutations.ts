import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  CreateGalleryInput,
  GalleryListItem,
  PresignBannerUploadInput,
  PresignBannerUploadResponse,
  PresignUploadInput,
  PresignUploadResponse,
  UpdateGalleryInput,
} from '@/lib/types/gallery'
import type {
  CreateSharedResourceInput,
  CreateSharedResourceResponse,
  UpdateSharedResourceInput,
  UpdateSharedResourceResponse,
} from '@/lib/types/shared-resource'
import { queryKeys } from './queries'

async function invalidateGalleryData(queryClient: ReturnType<typeof useQueryClient>, galleryId?: string) {
  const tasks: Promise<unknown>[] = [
    queryClient.invalidateQueries({ queryKey: queryKeys.galleries(), refetchType: 'active' }),
  ]

  if (galleryId) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery(galleryId), refetchType: 'active' }),
    )
  }

  await Promise.all(tasks)
}

async function invalidateShareData(queryClient: ReturnType<typeof useQueryClient>, resourceId?: string) {
  const tasks: Promise<unknown>[] = [
    queryClient.invalidateQueries({ queryKey: queryKeys.sharedResources(), refetchType: 'active' }),
  ]

  if (resourceId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.sharedResource(resourceId),
        refetchType: 'active',
      }),
    )
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.publicSharedResource(resourceId),
        refetchType: 'active',
      }),
    )
  }

  await Promise.all(tasks)
}

export function useCreateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateGalleryInput) =>
      api.post('/galleries', body) as Promise<GalleryListItem>,
    onSuccess: async () => {
      await invalidateGalleryData(queryClient)
    },
  })
}

export function useUpdateGallery(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateGalleryInput) =>
      api.patch(`/galleries/${id}`, body) as Promise<GalleryListItem>,
    onSuccess: async () => {
      await invalidateGalleryData(queryClient, id)
    },
  })
}

export function useDeleteGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/galleries/${id}`) as Promise<{ id: string; deletedAt: string }>,
    onSuccess: async () => {
      await invalidateGalleryData(queryClient)
    },
  })
}

export function useRequestPresignedUrl() {
  return useMutation({
    mutationFn: (body: PresignUploadInput) =>
      api.post('/upload/presign', body) as Promise<PresignUploadResponse>,
  })
}

export function useRequestBannerPresignedUrl(galleryId: string) {
  return useMutation({
    mutationFn: (body: PresignBannerUploadInput) =>
      api.post(`/galleries/${galleryId}/banner/presign`, body) as Promise<PresignBannerUploadResponse>,
  })
}

export function useConfirmUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ imageId }: { imageId: string; galleryId: string }) =>
      api.post(`/images/${imageId}/confirm`) as Promise<{ id: string; galleryId: string; uploadStatus: string }>,
    onSuccess: async (_, variables) => {
      await invalidateGalleryData(queryClient, variables.galleryId)
    },
  })
}

export function useFailUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ imageId }: { imageId: string; galleryId: string }) =>
      api.post(`/images/${imageId}/fail`) as Promise<{ id: string; galleryId: string; uploadStatus: string }>,
    onSuccess: async (_, variables) => {
      await invalidateGalleryData(queryClient, variables.galleryId)
    },
  })
}

export function useDeleteImage(galleryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => api.delete(`/images/${imageId}`) as Promise<{ id: string; deletedAt: string }>,
    onSuccess: async () => {
      await invalidateGalleryData(queryClient, galleryId)
    },
  })
}

// Phase 3
export function useCreateSharedResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateSharedResourceInput) =>
      api.post('/shared-resources', body) as Promise<CreateSharedResourceResponse>,
    onSuccess: async (created) => {
      await invalidateShareData(queryClient, created.id)
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
    onSuccess: async (_, resourceId) => {
      await invalidateShareData(queryClient, resourceId)
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
    onSuccess: async (_, resourceId) => {
      await invalidateShareData(queryClient, resourceId)
    },
  })
}

export function useUpdateSharedResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      resourceId,
      body,
    }: {
      resourceId: string
      body: UpdateSharedResourceInput
    }) =>
      api.patch(`/shared-resources/${resourceId}`, body) as Promise<UpdateSharedResourceResponse>,
    onSuccess: async (_, variables) => {
      await invalidateShareData(queryClient, variables.resourceId)
    },
  })
}
