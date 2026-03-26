'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/poof/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  X,
  Upload,
  Check,
  AlertCircle,
  Star,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import {
  useConfirmUpload,
  useCreateGallery,
  useFailUpload,
  useRequestPresignedUrl,
} from '@/hooks/mutations'
import {
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_IMAGE_MIME_TYPES,
} from '@/lib/limits'
import { api } from '@/lib/axios'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Step = 1 | 2 | 3

type UploadedPhoto = {
  id: string
  imageId: string | null
  file: File
  preview: string
  progress: number
  status: 'uploading' | 'complete' | 'error'
  errorMessage: string | null
}

const acceptedFormats = ['JPG', 'PNG', 'WEBP', 'HEIC']
const supportedMimeSet = new Set<string>(SUPPORTED_IMAGE_MIME_TYPES)

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const order = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** order
  return `${value.toFixed(order === 0 ? 0 : 1)} ${units[order]}`
}

function uploadWithPresignedUrl(
  file: File,
  presignedUrl: string,
  onProgress: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(file)
  })
}

export default function NewGalleryPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [creating, setCreating] = useState(false)
  const [galleryId, setGalleryId] = useState<string | null>(null)

  const createGallery = useCreateGallery()
  const requestPresign = useRequestPresignedUrl()
  const confirmUpload = useConfirmUpload()
  const failUpload = useFailUpload()

  const ensureGallery = useCallback(async (): Promise<string> => {
    if (galleryId) {
      return galleryId
    }

    const created = await createGallery.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
    })

    setGalleryId(created.id)
    return created.id
  }, [createGallery, description, galleryId, name])

  const setPhotoState = useCallback(
    (photoId: string, patch: Partial<UploadedPhoto>) => {
      setPhotos((previous) =>
        previous.map((photo) => (photo.id === photoId ? { ...photo, ...patch } : photo)),
      )
    },
    [],
  )

  const uploadPhoto = useCallback(
    async (photoId: string, file: File) => {
      if (!supportedMimeSet.has(file.type)) {
        setPhotoState(photoId, {
          status: 'error',
          progress: 0,
          errorMessage: 'Unsupported file type',
        })
        toast.error(`${file.name}: unsupported file type`)
        return
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setPhotoState(photoId, {
          status: 'error',
          progress: 0,
          errorMessage: 'Exceeds 10MB',
        })
        toast.error(`${file.name}: exceeds 10MB`)
        return
      }

      let uploadedImageId: string | null = null
      let ensuredGalleryId: string | null = null
      try {
        ensuredGalleryId = await ensureGallery()
        if (!ensuredGalleryId) {
          throw new Error('Failed to create gallery')
        }

        const presigned = await requestPresign.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          galleryId: ensuredGalleryId,
        })

        uploadedImageId = presigned.imageId
        if (!uploadedImageId) {
          throw new Error('Upload failed to initialize')
        }

        setPhotoState(photoId, { imageId: uploadedImageId })

        await uploadWithPresignedUrl(file, presigned.presignedUrl, (progress) => {
          setPhotoState(photoId, { progress })
        })

        await confirmUpload.mutateAsync({
          imageId: uploadedImageId,
          galleryId: ensuredGalleryId,
        })

        setPhotoState(photoId, {
          status: 'complete',
          progress: 100,
          errorMessage: null,
        })
      } catch (error) {
        if (uploadedImageId && ensuredGalleryId) {
          await failUpload
            .mutateAsync({
              imageId: uploadedImageId,
              galleryId: ensuredGalleryId,
            })
            .catch(() => undefined)
        }

        const message = error instanceof Error ? error.message : 'Upload failed'
        setPhotoState(photoId, {
          status: 'error',
          errorMessage: message,
        })
        toast.error(`${file.name}: ${message}`)
      }
    },
    [confirmUpload, ensureGallery, failUpload, requestPresign, setPhotoState],
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return
      }

      const incoming = Array.from(files).map<UploadedPhoto>((file) => ({
        id: crypto.randomUUID(),
        imageId: null,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading',
        errorMessage: null,
      }))

      setPhotos((previous) => [...previous, ...incoming])

      if (!coverPhotoId && incoming.length > 0) {
        setCoverPhotoId(incoming[0]?.id ?? null)
      }

      for (const photo of incoming) {
        void uploadPhoto(photo.id, photo.file)
      }
    },
    [coverPhotoId, uploadPhoto],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragOver(false)
      handleFiles(event.dataTransfer.files)
    },
    [handleFiles],
  )

  const removePhoto = async (photoId: string) => {
    const target = photos.find((photo) => photo.id === photoId)
    if (!target) return

    setPhotos((previous) => previous.filter((photo) => photo.id !== photoId))

    if (coverPhotoId === photoId) {
      const next = photos.find((photo) => photo.id !== photoId)
      setCoverPhotoId(next?.id ?? null)
    }

    URL.revokeObjectURL(target.preview)

    if (target.imageId) {
      await api.delete(`/images/${target.imageId}`).catch(() => undefined)
    }
  }

  const totalSize = useMemo(
    () => photos.reduce((sum, photo) => sum + photo.file.size, 0),
    [photos],
  )
  const allUploaded = photos.length > 0 && photos.every((photo) => photo.status === 'complete')

  const handleCreate = async () => {
    setCreating(true)

    try {
      const ensuredGalleryId = await ensureGallery()
      const coverImageId = photos.find((photo) => photo.id === coverPhotoId)?.imageId ?? null

      if (coverImageId) {
        await api.patch(`/galleries/${ensuredGalleryId}`, { coverImageId })
      }

      toast.success('Gallery created')
      router.push(`/galleries/${ensuredGalleryId}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create gallery'
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-poof-base/95 backdrop-blur-xl overflow-y-auto">
      <div className="min-h-full flex flex-col">
        <div className="sticky top-0 z-10 border-b border-white/5 bg-poof-base/95 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-poof-mist hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
              <span className="text-sm">Cancel</span>
            </button>

            <div className="flex items-center gap-2">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={cn(
                    'w-8 h-1 rounded-full transition-colors',
                    index <= step ? 'bg-poof-accent' : 'bg-white/10',
                  )}
                />
              ))}
            </div>

            <div className="w-20" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {step === 1 && (
              <div className="text-center space-y-8 animate-fade-up">
                <div>
                  <h2 className="font-heading font-extrabold text-3xl text-white mb-2">
                    Name your gallery
                  </h2>
                  <p className="text-poof-mist">Give it a memorable name</p>
                </div>

                <div className="space-y-4">
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value.slice(0, 60))}
                    placeholder="Gallery name..."
                    className="text-center text-2xl font-heading font-bold bg-transparent border-0 border-b-2 border-white/10 rounded-none focus:border-poof-accent px-4 py-6 text-white placeholder:text-poof-mist/30"
                    autoFocus
                  />
                  <p className="text-xs text-poof-mist">{name.length}/60 characters</p>
                </div>

                <div className="space-y-4">
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Add a description (optional)"
                    className="bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50 resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press px-8"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-up">
                <div className="text-center">
                  <h2 className="font-heading font-extrabold text-3xl text-white mb-2">
                    Add your photos
                  </h2>
                  <p className="text-poof-mist">Drag and drop or click to upload</p>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  className={cn(
                    'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
                    dragOver
                      ? 'border-poof-accent bg-poof-accent/10'
                      : 'border-white/20 hover:border-white/30',
                  )}
                >
                  <input
                    type="file"
                    accept={SUPPORTED_IMAGE_MIME_TYPES.join(',')}
                    multiple
                    onChange={(event) => handleFiles(event.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className={cn('transition-transform duration-300', dragOver && 'scale-110')}>
                    <Upload
                      className={cn(
                        'w-12 h-12 mx-auto mb-4 transition-colors',
                        dragOver ? 'text-poof-accent' : 'text-poof-mist',
                      )}
                    />
                    <p className="text-white font-medium mb-2">
                      Drop photos here or click to browse
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                      {acceptedFormats.map((format) => (
                        <span
                          key={format}
                          className="px-2 py-0.5 text-xs bg-white/5 rounded text-poof-mist"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-poof-mist">
                      Max {formatBytes(MAX_FILE_SIZE_BYTES)} per file
                    </p>
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-poof-mist">
                        {photos.length} photo{photos.length !== 1 ? 's' : ''} · {formatBytes(totalSize)}
                      </p>
                      <button
                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                        className="text-sm text-poof-violet hover:underline"
                      >
                        Add more
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {photos.map((photo) => (
                        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img
                            src={photo.preview}
                            alt={photo.file.name}
                            className="w-full h-full object-cover"
                          />

                          {photo.status === 'uploading' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <svg className="w-10 h-10" viewBox="0 0 36 36">
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="none"
                                  stroke="rgba(255,255,255,0.2)"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx="18"
                                  cy="18"
                                  r="16"
                                  fill="none"
                                  stroke="#7c5cfc"
                                  strokeWidth="2"
                                  strokeDasharray={100}
                                  strokeDashoffset={100 - photo.progress}
                                  strokeLinecap="round"
                                  transform="rotate(-90 18 18)"
                                  className="transition-all duration-200"
                                />
                              </svg>
                            </div>
                          )}

                          {photo.status === 'complete' && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Check className="w-6 h-6 text-poof-mint" />
                            </div>
                          )}

                          {photo.status === 'error' && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <AlertCircle className="w-6 h-6 text-red-400" />
                            </div>
                          )}

                          <button
                            onClick={() => void removePhoto(photo.id)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/80"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-white truncate">{photo.file.name}</p>
                            <p className="text-xs text-poof-mist">{formatBytes(photo.file.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-poof-mist hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!allUploaded}
                    className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fade-up">
                <div className="text-center">
                  <h2 className="font-heading font-extrabold text-3xl text-white mb-2">
                    Pick your cover photo
                  </h2>
                  <p className="text-poof-mist">This is what people will see first</p>
                </div>

                <div className="flex overflow-x-auto gap-3 pb-4 snap-x">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setCoverPhotoId(photo.id)}
                      className={cn(
                        'relative flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden transition-all snap-start',
                        coverPhotoId === photo.id
                          ? 'ring-2 ring-poof-violet scale-105'
                          : 'opacity-60 hover:opacity-100',
                      )}
                    >
                      <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                      {coverPhotoId === photo.id && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-poof-violet flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center">
                  <GlassCard className="w-64 overflow-hidden" hover={false}>
                    <div className="aspect-video">
                      {coverPhotoId ? (
                        <img
                          src={photos.find((photo) => photo.id === coverPhotoId)?.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-poof-violet/20 to-poof-accent/20" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-white truncate">{name}</h3>
                      <p className="text-poof-mist text-sm">{photos.length} photos</p>
                    </div>
                  </GlassCard>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="text-poof-mist hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={() => void handleCreate()}
                    disabled={creating}
                    className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press px-8"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create gallery
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
