export const queryKeys = {
  galleries: () => ['galleries'] as const,
  gallery: (id: string) => ['galleries', id] as const,
  galleryImages: (id: string) => ['galleries', id, 'images'] as const,
  sharedResources: () => ['shared-resources'] as const,
  sharedResource: (resourceId: string) => ['shared-resources', resourceId] as const,
  publicSharedResource: (resourceId: string) => ['public', 'shared-resources', resourceId] as const,
}

// Phase 2 onward: useQuery hooks are implemented here.
