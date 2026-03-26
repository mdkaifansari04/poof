'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/poof/glass-card'
import { StatusBadge } from '@/components/poof/status-badge'
import { Countdown } from '@/components/poof/countdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Copy, 
  Download, 
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Link2,
  Eye,
  Lock,
  Check
} from 'lucide-react'
import { mockGalleries, mockShareLinks, formatRelativeTime } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function GalleryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [gallery, setGallery] = useState<typeof mockGalleries[0] | null>(null)
  const [links, setLinks] = useState<typeof mockShareLinks>([])
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  useEffect(() => {
    const found = mockGalleries.find((g) => g.id === id)
    if (found) {
      setGallery(found)
      setEditName(found.name)
      setLinks(mockShareLinks.filter((l) => l.galleryId === id))
    }
  }, [id])

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(`poof.so/g/${token}`)
    setCopiedLink(token)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const currentPhotoIndex = lightboxPhoto
    ? gallery?.photos.findIndex((p) => p.id === lightboxPhoto) ?? -1
    : -1

  const goToPrevPhoto = () => {
    if (!gallery || currentPhotoIndex <= 0) return
    setLightboxPhoto(gallery.photos[currentPhotoIndex - 1].id)
  }

  const goToNextPhoto = () => {
    if (!gallery || currentPhotoIndex >= gallery.photos.length - 1) return
    setLightboxPhoto(gallery.photos[currentPhotoIndex + 1].id)
  }

  if (!gallery) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-poof-mist">Gallery not found</p>
        </div>
      </div>
    )
  }

  const activeLinks = links.filter((l) => l.status === 'active')

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
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
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  setGallery({ ...gallery, name: editName })
                  setIsEditing(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setGallery({ ...gallery, name: editName })
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
            {gallery.description && (
              <p className="text-poof-mist mt-1">{gallery.description}</p>
            )}
            <p className="text-poof-mist/60 text-sm mt-2">
              {gallery.photos.length} photos · Created {formatRelativeTime(gallery.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="outline" className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5">
            <Plus className="w-4 h-4 mr-2" />
            Add photos
          </Button>
          <Button className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press">
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
              <DropdownMenuItem className="text-poof-mist hover:text-white cursor-pointer">
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className="text-poof-mist hover:text-white cursor-pointer">
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-poof-mist hover:text-white cursor-pointer">
                Download all
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 hover:text-red-300 cursor-pointer">
                Delete gallery
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active share links bar */}
      {activeLinks.length > 0 && (
        <GlassCard className="p-4" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Active share links</h3>
            <Button variant="ghost" size="sm" className="text-poof-violet hover:text-poof-violet/80 h-7">
              <Plus className="w-3 h-3 mr-1" />
              New link
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
              >
                <span className="font-mono text-sm text-white">
                  poof.so/g/{link.token}
                </span>
                <Countdown expiresAt={link.expiresAt} className="text-xs" />
                <span className="flex items-center gap-1 text-xs text-poof-mist">
                  <Eye className="w-3 h-3" />
                  {link.viewCount}
                </span>
                {link.password && <Lock className="w-3 h-3 text-poof-mist" />}
                <button
                  onClick={() => handleCopyLink(link.token)}
                  className="p-1 rounded hover:bg-white/10 transition-colors text-poof-mist hover:text-white"
                >
                  {copiedLink === link.token ? (
                    <Check className="w-4 h-4 text-poof-mint" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Photo grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {gallery.photos.map((photo, i) => (
          <div
            key={photo.id}
            className="break-inside-avoid group relative rounded-lg overflow-hidden animate-fade-up cursor-pointer"
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => setLightboxPhoto(photo.id)}
          >
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Maximize2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-white/10 text-red-400 hover:bg-white/20 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightboxPhoto} onOpenChange={() => setLightboxPhoto(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-white/10">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation */}
            {currentPhotoIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevPhoto() }}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {currentPhotoIndex < gallery.photos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goToNextPhoto() }}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            {lightboxPhoto && (
              <img
                src={gallery.photos.find((p) => p.id === lightboxPhoto)?.url}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Bottom info */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="text-white text-sm">
                {gallery.photos.find((p) => p.id === lightboxPhoto)?.filename}
              </span>
              <span className="text-poof-mist text-sm">
                {currentPhotoIndex + 1} / {gallery.photos.length}
              </span>
            </div>

            {/* Actions */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full bg-white/10 text-red-400 hover:bg-white/20 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
