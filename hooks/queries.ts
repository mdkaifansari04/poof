import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { GalleryDetail, GalleryListItem } from '@/lib/types/gallery'
import type { PublicSharedResource, SharedResourceListItem } from '@/lib/types/shared-resource'

export const queryKeys = {
  galleries: () => ['galleries'] as const,
  gallery: (id: string) => ['galleries', id] as const,
  galleryImages: (id: string) => ['galleries', id, 'images'] as const,
  sharedResources: () => ['shared-resources'] as const,
  sharedResource: (resourceId: string) => ['shared-resources', resourceId] as const,
  publicSharedResource: (resourceId: string) => ['public', 'shared-resources', resourceId] as const,
}

const realtimeQueryOptions = {
  staleTime: 0,
  gcTime: 60 * 1000, // 1 min
  refetchOnMount: 'always' as const,
  refetchOnReconnect: true,
  refetchOnWindowFocus: true,
}

export function useGalleries() {
  return useQuery({
    queryKey: queryKeys.galleries(),
    queryFn: () => api.get('/galleries') as Promise<GalleryListItem[]>,
    ...realtimeQueryOptions,
  })
}

export function useGallery(id: string) {
  return useQuery({
    queryKey: queryKeys.gallery(id),
    queryFn: () => api.get(`/galleries/${id}`) as Promise<GalleryDetail>,
    enabled: Boolean(id),
    ...realtimeQueryOptions,
  })
}

// Phase 3
export function useSharedResources() {
  return useQuery({
    queryKey: queryKeys.sharedResources(),
    queryFn: () => api.get('/shared-resources') as Promise<SharedResourceListItem[]>,
    ...realtimeQueryOptions,
  })
}

// Phase 3
export function usePublicSharedResource(resourceId: string) {
  return useQuery({
    queryKey: queryKeys.publicSharedResource(resourceId),
    queryFn: () => api.get(`/shared-resources/${resourceId}`) as Promise<PublicSharedResource>,
    enabled: Boolean(resourceId),
    retry: false,
    ...realtimeQueryOptions,
  })
}
