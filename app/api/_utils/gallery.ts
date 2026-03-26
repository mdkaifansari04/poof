import { prisma } from '@/lib/prisma'

export async function getOwnedGalleryOrNull(galleryId: string, userId: string) {
  return prisma.gallery.findFirst({
    where: {
      id: galleryId,
      userId,
      deletedAt: null,
    },
  })
}

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')

  if (lastDot < 0 || lastDot === fileName.length - 1) {
    return 'bin'
  }

  return fileName.slice(lastDot + 1).toLowerCase()
}
