'use client'

import { useMemo, use, useEffect, useState } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/poof/glass-card'
import { Countdown } from '@/components/poof/countdown'
import { StatusBadge } from '@/components/poof/status-badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { usePublicSharedResource } from '@/hooks/queries'
import { ApiClientError } from '@/lib/axios'
import { Clock, Eye, ImageIcon, ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'

type SharedPageProps = {
  params: Promise<{ resourceId: string }>
}

function ErrorState({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="min-h-screen bg-poof-base text-white px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <GlassCard className="p-10 text-center" hover={false}>
          <h1 className="font-heading font-extrabold text-3xl text-white">{title}</h1>
          <p className="text-poof-mist mt-3">{message}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-poof-violet hover:underline mt-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to homepage
          </Link>
        </GlassCard>
      </div>
    </div>
  )
}

export default function SharedResourcePage({ params }: SharedPageProps) {
  const { resourceId } = use(params)
  const resourceQuery = usePublicSharedResource(resourceId)
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null)

  const expiresAt = useMemo(() => {
    if (!resourceQuery.data?.expiresAt) {
      return null
    }

    return new Date(resourceQuery.data.expiresAt)
  }, [resourceQuery.data?.expiresAt])

  if (resourceQuery.isPending) {
    return (
      <div className="min-h-screen bg-poof-base text-white px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="skeleton-shimmer h-12 w-64 rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <div key={index} className="skeleton-shimmer aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (resourceQuery.isError) {
    const error = resourceQuery.error as Error
    const apiError = error instanceof ApiClientError ? error : null

    if (apiError?.code === 'REVOKED') {
      return <ErrorState title="Link Revoked" message="This share link was revoked by the owner." />
    }

    if (apiError?.code === 'EXPIRED') {
      return <ErrorState title="This already poofed" message="This share link has expired." />
    }

    if (apiError?.code === 'NOT_FOUND') {
      return <ErrorState title="Link not found" message="This share link does not exist anymore." />
    }

    return <ErrorState title="Could not load shared content" message={error.message} />
  }

  const resource = resourceQuery.data
  const previewImages = useMemo(() => {
    if (resource.type === 'IMAGE' && resource.image) {
      return [resource.image]
    }

    if (resource.type === 'MULTI_IMAGE' && resource.images) {
      return resource.images
    }

    if (resource.type === 'GALLERY' && resource.gallery) {
      return resource.gallery.images
    }

    return []
  }, [resource])
  const currentImageIndex = lightboxImageId
    ? previewImages.findIndex((image) => image.id === lightboxImageId)
    : -1
  const currentImage = currentImageIndex >= 0 ? previewImages[currentImageIndex] : null

  useEffect(() => {
    if (!lightboxImageId) {
      return
    }

    if (!previewImages.some((image) => image.id === lightboxImageId)) {
      setLightboxImageId(null)
    }
  }, [lightboxImageId, previewImages])

  const goToPrevImage = () => {
    if (currentImageIndex <= 0) return
    setLightboxImageId(previewImages[currentImageIndex - 1]?.id ?? null)
  }

  const goToNextImage = () => {
    if (currentImageIndex < 0 || currentImageIndex >= previewImages.length - 1) return
    setLightboxImageId(previewImages[currentImageIndex + 1]?.id ?? null)
  }

  return (
    <div className="min-h-screen bg-poof-base text-white px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-6">
        <GlassCard className="p-4 sm:p-5" hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                {resource.type === 'GALLERY' && resource.gallery ? resource.gallery.name : 'Shared Photos'}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-poof-mist">
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {resource.viewCount} views
                </span>
                <StatusBadge
                  variant={resource.type === 'GALLERY' ? 'gallery' : 'photo'}
                  className="text-[11px]"
                >
                  {resource.type === 'GALLERY' ? 'Gallery' : resource.type === 'IMAGE' ? 'Single image' : 'Selection'}
                </StatusBadge>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <Clock className="w-4 h-4 text-poof-mist" />
              <Countdown expiresAt={expiresAt} />
            </div>
          </div>
        </GlassCard>

        {resource.type === 'IMAGE' && resource.image && (
          <GlassCard className="p-3" hover={false}>
            <img
              src={resource.image.r2Url}
              alt={resource.image.fileName}
              className="w-full max-h-[80vh] object-contain rounded-lg cursor-zoom-in"
              onClick={() => setLightboxImageId(resource.image?.id ?? null)}
            />
          </GlassCard>
        )}

        {resource.type === 'MULTI_IMAGE' && resource.images && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resource.images.map((image) => (
              <GlassCard
                key={image.id}
                className="overflow-hidden cursor-zoom-in"
                hover={false}
                onClick={() => setLightboxImageId(image.id)}
              >
                <img
                  src={image.r2Url}
                  alt={image.fileName}
                  className="w-full aspect-square object-cover"
                />
              </GlassCard>
            ))}
          </div>
        )}

        {resource.type === 'GALLERY' && resource.gallery && (
          <>
            {resource.gallery.description && (
              <p className="text-poof-mist">{resource.gallery.description}</p>
            )}

            {resource.gallery.images.length > 0 ? (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {resource.gallery.images.map((image) => (
                  <div
                    key={image.id}
                    className="break-inside-avoid rounded-lg overflow-hidden cursor-zoom-in"
                    onClick={() => setLightboxImageId(image.id)}
                  >
                    <img
                      src={image.r2Url}
                      alt={image.fileName}
                      className="w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <GlassCard className="p-8 text-center" hover={false}>
                <div className="flex items-center justify-center gap-2 text-poof-mist">
                  <ImageIcon className="w-4 h-4" />
                  No images available in this shared gallery.
                </div>
              </GlassCard>
            )}
          </>
        )}
      </div>

      <Dialog open={Boolean(lightboxImageId)} onOpenChange={() => setLightboxImageId(null)}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-white/10"
          showCloseButton={false}
        >
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setLightboxImageId(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {currentImageIndex > 0 && (
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  goToPrevImage()
                }}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {currentImageIndex < previewImages.length - 1 && (
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  goToNextImage()
                }}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {currentImage && (
              <img
                src={currentImage.r2Url}
                alt={currentImage.fileName}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {currentImage && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
                <span className="text-white text-sm">{currentImage.fileName}</span>
                <span className="text-poof-mist text-sm">
                  {currentImageIndex + 1} / {previewImages.length}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
