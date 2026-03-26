'use client'

import { useEffect, useMemo, useRef, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/poof/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Share2,
  Plus,
  MoreHorizontal,
  Download,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react'
import {
  useConfirmUpload,
  useDeleteGallery,
  useDeleteImage,
  useFailUpload,
  useRequestPresignedUrl,
  useUpdateGallery,
} from '@/hooks/mutations'
import { useGallery } from '@/hooks/queries'
import {
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_IMAGE_MIME_TYPES,
} from '@/lib/limits'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const supportedMimeSet = new Set<string>(SUPPORTED_IMAGE_MIME_TYPES)

type GalleryRouteParams = Promise<{ id: string }>

function uploadWithPresignedUrl(
  file: File,
  presignedUrl: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(file)
  })
}

export default function GalleryDetailPage({ params }: { params: GalleryRouteParams }) {
  const router = useRouter()
  const { id } = use(params)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const galleryQuery = useGallery(id)
  const updateGallery = useUpdateGallery(id)
  const deleteGallery = useDeleteGallery()
  const deleteImage = useDeleteImage(id)
  const requestPresign = useRequestPresignedUrl()
  const confirmUpload = useConfirmUpload()
  const failUpload = useFailUpload()

  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const gallery = galleryQuery.data
  const allImages = gallery?.images ?? []
  const confirmedImages = useMemo(
    () => allImages.filter((image) => image.uploadStatus === 'CONFIRMED'),
    [allImages],
  )

  useEffect(() => {
    if (gallery?.name) {
      setEditName(gallery.name)
    }
  }, [gallery?.name])

  const handleRenameCommit = async () => {
    const nextName = editName.trim()
    if (!nextName) {
      setEditName(gallery?.name ?? '')
      setIsEditing(false)
      return
    }

    try {
      await updateGallery.mutateAsync({ name: nextName })
      setIsEditing(false)
      toast.success('Gallery updated')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to rename gallery'
      toast.error(message)
    }
  }

  const handleDeleteGallery = async () => {
    const confirmed = window.confirm(
      'Delete this gallery and all its images from your dashboard?',
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteGallery.mutateAsync(id)
      toast.success('Gallery deleted')
      router.push('/galleries')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete gallery'
      toast.error(message)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    const confirmed = window.confirm('Delete this image?')

    if (!confirmed) {
      return
    }

    try {
      await deleteImage.mutateAsync(imageId)
      setLightboxPhoto((current) => (current === imageId ? null : current))
      toast.success('Image deleted')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete image'
      toast.error(message)
    }
  }

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }

    const candidates = Array.from(files)
    setIsUploading(true)

    try {
      for (const file of candidates) {
        if (!supportedMimeSet.has(file.type)) {
          toast.error(`Unsupported type for ${file.name}`)
          continue
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`${file.name} exceeds 10MB limit`)
          continue
        }

        let imageId: string | null = null
        try {
          const presigned = await requestPresign.mutateAsync({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            galleryId: id,
          })

          imageId = presigned.imageId
          await uploadWithPresignedUrl(file, presigned.presignedUrl)
          await confirmUpload.mutateAsync({ imageId, galleryId: id })
        } catch (error) {
          if (imageId) {
            await failUpload.mutateAsync({ imageId, galleryId: id }).catch(() => undefined)
          }

          const message = error instanceof Error ? error.message : 'Upload failed'
          toast.error(`${file.name}: ${message}`)
        }
      }

      await galleryQuery.refetch()
      toast.success('Upload flow completed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const currentPhotoIndex = lightboxPhoto
    ? confirmedImages.findIndex((image) => image.id === lightboxPhoto)
    : -1

  const goToPrevPhoto = () => {
    if (currentPhotoIndex <= 0) return
    setLightboxPhoto(confirmedImages[currentPhotoIndex - 1]?.id ?? null)
  }

  const goToNextPhoto = () => {
    if (currentPhotoIndex < 0 || currentPhotoIndex >= confirmedImages.length - 1) return
    setLightboxPhoto(confirmedImages[currentPhotoIndex + 1]?.id ?? null)
  }

  if (galleryQuery.isPending) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-10 w-72 rounded-lg" />
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="skeleton-shimmer h-48 rounded-lg break-inside-avoid" />
          ))}
        </div>
      </div>
    )
  }

  if (galleryQuery.isError || !gallery) {
    return (
      <GlassCard className="p-8 text-center" hover={false}>
        <p className="text-white font-medium">Gallery not found</p>
        <p className="text-poof-mist text-sm mt-2">
          {galleryQuery.isError ? galleryQuery.error.message : 'This gallery may have been deleted.'}
        </p>
        <Button asChild className="mt-4 bg-poof-accent hover:bg-poof-accent/90 text-white">
          <Link href="/galleries">Back to galleries</Link>
        </Button>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <input
        ref={fileInputRef}
        type="file"
        accept={SUPPORTED_IMAGE_MIME_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(event) => void handleUploadFiles(event.target.files)}
      />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/galleries"
            className="mt-1 p-2 rounded-lg text-poof-mist hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onBlur={() => void handleRenameCommit()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleRenameCommit()
                  }
                  if (event.key === 'Escape') {
                    setEditName(gallery.name)
                    setIsEditing(false)
                  }
                }}
                className="font-heading font-extrabold text-3xl lg:text-4xl bg-transparent border-0 border-b border-poof-accent p-0 h-auto text-white focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditing(true)}
                className="font-heading font-extrabold text-3xl lg:text-4xl text-white cursor-pointer hover:text-poof-violet transition-colors"
              >
                {gallery.name}
              </h1>
            )}
            {gallery.description && <p className="text-poof-mist mt-1">{gallery.description}</p>}
            <p className="text-poof-mist/60 text-sm mt-2">
              {allImages.length} photos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Button
            variant="outline"
            className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add photos
              </>
            )}
          </Button>
          <Button className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press" disabled>
            <Share2 className="w-4 h-4 mr-2" />
            Share gallery
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-poof-mist hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-poof-base border-white/10">
              <DropdownMenuItem
                className="text-poof-mist hover:text-white cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 cursor-pointer"
                onClick={() => void handleDeleteGallery()}
              >
                Delete gallery
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {allImages.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {allImages.map((image, index) => {
            const canPreview = image.uploadStatus === 'CONFIRMED'

            return (
              <div
                key={image.id}
                className={cn(
                  'break-inside-avoid group relative rounded-lg overflow-hidden animate-fade-up',
                  canPreview ? 'cursor-pointer' : 'cursor-not-allowed',
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => {
                  if (canPreview) {
                    setLightboxPhoto(image.id)
                  }
                }}
              >
                {canPreview ? (
                  <img
                    src={image.r2Url}
                    alt={image.fileName}
                    className="w-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full min-h-48 bg-white/5 flex items-center justify-center p-4">
                    <span className="text-sm text-poof-mist text-center">
                      {image.uploadStatus === 'PENDING' ? 'Upload pending' : 'Upload failed'}
                    </span>
                  </div>
                )}

                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/50 text-[10px] text-white">
                  {image.uploadStatus}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    disabled={!canPreview}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    disabled
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    disabled={!canPreview}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleDeleteImage(image.id)
                    }}
                    className="p-2 rounded-full bg-white/10 text-red-400 hover:bg-white/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <GlassCard className="p-8 text-center" hover={false}>
          <p className="text-white font-medium">No photos yet</p>
          <p className="text-poof-mist text-sm mt-2">
            Upload images to start building your gallery.
          </p>
          <Button
            className="mt-4 bg-poof-accent hover:bg-poof-accent/90 text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add photos
          </Button>
        </GlassCard>
      )}

      <Dialog open={Boolean(lightboxPhoto)} onOpenChange={() => setLightboxPhoto(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-white/10">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {currentPhotoIndex > 0 && (
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  goToPrevPhoto()
                }}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {currentPhotoIndex < confirmedImages.length - 1 && (
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  goToNextPhoto()
                }}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {lightboxPhoto && (
              <img
                src={confirmedImages.find((image) => image.id === lightboxPhoto)?.r2Url}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="text-white text-sm">
                {confirmedImages.find((image) => image.id === lightboxPhoto)?.fileName}
              </span>
              <span className="text-poof-mist text-sm">
                {currentPhotoIndex + 1} / {confirmedImages.length}
              </span>
            </div>

            {lightboxPhoto && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    void handleDeleteImage(lightboxPhoto)
                  }}
                  className="p-2 rounded-full bg-white/10 text-red-400 hover:bg-white/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
