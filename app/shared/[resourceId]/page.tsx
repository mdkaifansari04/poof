'use client'

import { useMemo, use } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/poof/glass-card'
import { Countdown } from '@/components/poof/countdown'
import { StatusBadge } from '@/components/poof/status-badge'
import { usePublicSharedResource } from '@/hooks/queries'
import { ApiClientError } from '@/lib/axios'
import { Clock, Eye, ImageIcon, ArrowLeft } from 'lucide-react'

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
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
          </GlassCard>
        )}

        {resource.type === 'MULTI_IMAGE' && resource.images && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resource.images.map((image) => (
              <GlassCard key={image.id} className="overflow-hidden" hover={false}>
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
                  <div key={image.id} className="break-inside-avoid rounded-lg overflow-hidden">
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
    </div>
  )
}
