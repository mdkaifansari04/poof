'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/poof/glass-card'
import { EmptyState } from '@/components/poof/empty-state'
import { StatusBadge } from '@/components/poof/status-badge'
import { SkeletonGalleryCard } from '@/components/poof/skeletons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  Grid3X3,
  List,
  FolderOpen,
  Share2,
  MoreHorizontal,
  X,
  Trash2,
  Clock,
  Link2,
} from 'lucide-react'
import { useDeleteGallery } from '@/hooks/mutations'
import { useGalleries } from '@/hooks/queries'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'expiring' | 'viewed' | 'az'
type FilterOption = 'all' | 'active' | 'expiring' | 'expired' | 'no-expiry'

type GalleryView = {
  id: string
  name: string
  description: string | null
  coverPhoto: string | null
  photoCount: number
  createdAt: Date
}

type ShareLinkStub = {
  id: string
  galleryId: string
  status: 'active' | 'expired' | 'revoked'
  expiresAt: Date | null
}

const shareLinks: ShareLinkStub[] = []

export default function GalleriesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set())
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    ids: string[]
  }>({
    open: false,
    ids: [],
  })

  const galleriesQuery = useGalleries()
  const deleteGallery = useDeleteGallery()

  const galleries = useMemo<GalleryView[]>(() => {
    const rows = galleriesQuery.data ?? []

    return rows.map((gallery) => ({
      id: gallery.id,
      name: gallery.name,
      description: gallery.description,
      coverPhoto: gallery.coverImageUrl,
      photoCount: gallery.imageCount,
      createdAt: new Date(gallery.createdAt),
    }))
  }, [galleriesQuery.data])

  const filteredGalleries = useMemo(() => {
    let next = [...galleries]

    if (searchQuery) {
      const needle = searchQuery.toLowerCase()
      next = next.filter(
        (gallery) =>
          gallery.name.toLowerCase().includes(needle) ||
          gallery.description?.toLowerCase().includes(needle),
      )
    }

    if (filterBy !== 'all') {
      next = next.filter((gallery) => {
        const links = shareLinks.filter((link) => link.galleryId === gallery.id)

        switch (filterBy) {
          case 'active':
            return links.some((link) => link.status === 'active')
          case 'expiring':
            return links.some((link) => {
              if (!link.expiresAt || link.status !== 'active') return false
              const diff = link.expiresAt.getTime() - Date.now()
              return diff > 0 && diff < 24 * 60 * 60 * 1000
            })
          case 'expired':
            return links.length > 0 && links.every((link) => link.status === 'expired')
          case 'no-expiry':
            return links.some((link) => !link.expiresAt && link.status === 'active')
          default:
            return true
        }
      })
    }

    switch (sortBy) {
      case 'oldest':
        next.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'az':
        next.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
      default:
        next.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    return next
  }, [filterBy, galleries, searchQuery, sortBy])

  const toggleSelection = (id: string) => {
    const next = new Set(selectedGalleries)

    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }

    setSelectedGalleries(next)
  }

  const clearSelection = () => {
    setSelectedGalleries(new Set())
  }

  const deleteOneGallery = async (id: string) => {
    try {
      await deleteGallery.mutateAsync(id)
      setSelectedGalleries((previous) => {
        const next = new Set(previous)
        next.delete(id)
        return next
      })
      toast.success('Gallery deleted')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete gallery'
      toast.error(message)
    }
  }

  const openDeleteDialog = (ids: string[]) => {
    if (ids.length === 0) {
      return
    }

    setDeleteDialog({ open: true, ids })
  }

  const confirmDeleteDialog = async () => {
    const ids = [...deleteDialog.ids]
    setDeleteDialog({ open: false, ids: [] })

    for (const id of ids) {
      await deleteOneGallery(id)
    }

    if (ids.length > 1) {
      clearSelection()
    }
  }

  const isSelecting = selectedGalleries.size > 0

  if (galleriesQuery.isPending) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="skeleton-shimmer h-10 w-64 rounded-lg" />
          <div className="skeleton-shimmer h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <SkeletonGalleryCard key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (galleriesQuery.isError) {
    return (
      <GlassCard className="p-8 text-center" hover={false}>
        <p className="text-white font-medium">Could not load galleries</p>
        <p className="text-poof-mist text-sm mt-2">{galleriesQuery.error.message}</p>
        <Button
          onClick={() => galleriesQuery.refetch()}
          className="mt-4 bg-poof-accent hover:bg-poof-accent/90 text-white"
        >
          Retry
        </Button>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-poof-mist" />
            <Input
              type="search"
              placeholder="Search galleries..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50"
            />
          </div>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-poof-base border-white/10">
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="expiring">Expiring soon</SelectItem>
              <SelectItem value="viewed">Most viewed</SelectItem>
              <SelectItem value="az">A-Z</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden sm:flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-poof-mist hover:text-white',
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-poof-mist hover:text-white',
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'active', 'expiring', 'expired', 'no-expiry'] as FilterOption[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterBy(filter)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                filterBy === filter
                  ? 'bg-poof-violet/20 border-poof-violet/30 text-poof-violet'
                  : 'border-white/10 text-poof-mist hover:text-white hover:border-white/20',
              )}
            >
              {filter === 'all'
                ? 'All'
                : filter === 'active'
                  ? 'Active'
                  : filter === 'expiring'
                    ? 'Expiring Soon'
                    : filter === 'expired'
                      ? 'Expired'
                      : 'No Expiry'}
            </button>
          ))}
        </div>

        <Button asChild className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press">
          <Link href="/galleries/new">
            <Plus className="w-4 h-4 mr-2" />
            New Gallery
          </Link>
        </Button>
      </div>

      {isSelecting && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-poof-violet/30 bg-poof-violet/10 animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">{selectedGalleries.size} selected</span>
            <button
              onClick={clearSelection}
              className="text-poof-mist hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-poof-mist hover:text-white" disabled>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="text-poof-mist hover:text-white" disabled>
              <Clock className="w-4 h-4 mr-1" />
              Extend
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
              disabled={deleteGallery.isPending}
              onClick={() => openDeleteDialog([...selectedGalleries])}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {filteredGalleries.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGalleries.map((gallery, index) => (
              <GalleryGridCard
                key={gallery.id}
                gallery={gallery}
                index={index}
                isSelected={selectedGalleries.has(gallery.id)}
                onToggleSelect={() => toggleSelection(gallery.id)}
                isSelecting={isSelecting}
                onDelete={() => openDeleteDialog([gallery.id])}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGalleries.map((gallery, index) => (
              <GalleryListRow
                key={gallery.id}
                gallery={gallery}
                index={index}
                isSelected={selectedGalleries.has(gallery.id)}
                onToggleSelect={() => toggleSelection(gallery.id)}
                isSelecting={isSelecting}
                onDelete={() => openDeleteDialog([gallery.id])}
              />
            ))}
          </div>
        )
      ) : searchQuery ? (
        <EmptyState type="search" />
      ) : (
        <EmptyState type="galleries" />
      )}

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((previous) => ({
            ...previous,
            open,
          }))
        }
      >
        <AlertDialogContent className="bg-poof-base border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteDialog.ids.length > 1 ? `${deleteDialog.ids.length} galleries` : 'gallery'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-poof-mist">
              This action removes {deleteDialog.ids.length > 1 ? 'these galleries' : 'this gallery'} from your
              dashboard immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-500/90 text-white"
              onClick={() => void confirmDeleteDialog()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface GalleryCardProps {
  gallery: GalleryView
  index: number
  isSelected: boolean
  onToggleSelect: () => void
  isSelecting: boolean
  onDelete: () => void
}

function GalleryGridCard({
  gallery,
  index,
  isSelected,
  onToggleSelect,
  isSelecting,
  onDelete,
}: GalleryCardProps) {
  const links = shareLinks.filter((link) => link.galleryId === gallery.id)
  const activeLinks = links.filter((link) => link.status === 'active')
  const hasExpiring = activeLinks.some((link) => {
    if (!link.expiresAt) return false
    const diff = link.expiresAt.getTime() - Date.now()
    return diff > 0 && diff < 24 * 60 * 60 * 1000
  })

  return (
    <GlassCard
      className={cn('group overflow-hidden animate-fade-up', isSelected && 'ring-2 ring-poof-violet')}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative aspect-video overflow-hidden">
        {gallery.coverPhoto ? (
          <img
            src={gallery.coverPhoto}
            alt={gallery.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-poof-violet/20 to-poof-accent/20 flex items-center justify-center">
            <span className="font-heading font-bold text-3xl text-white/30">
              {gallery.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div
          className={cn(
            'absolute top-3 left-3 transition-opacity',
            isSelecting || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="w-5 h-5 border-white/50 bg-black/50 data-[state=checked]:bg-poof-violet data-[state=checked]:border-poof-violet"
          />
        </div>

        <div className="absolute top-3 right-3">
          {hasExpiring ? (
            <StatusBadge variant="expiring">Expiring soon</StatusBadge>
          ) : activeLinks.length > 0 ? (
            <StatusBadge variant="active">{activeLinks.length} active</StatusBadge>
          ) : null}
        </div>

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" asChild className="btn-press">
            <Link href={`/galleries/${gallery.id}`}>
              <FolderOpen className="w-4 h-4 mr-1" />
              Open
            </Link>
          </Button>
          <Button size="sm" variant="secondary" className="btn-press" disabled>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-white truncate">{gallery.name}</h3>
            <div className="flex items-center gap-2 text-poof-mist text-sm mt-1">
              <span>{gallery.photoCount} photos</span>
              {activeLinks.length > 0 && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    {activeLinks.length}
                  </span>
                </>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-poof-mist hover:text-white flex-shrink-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-poof-base border-white/10">
              <DropdownMenuItem className="text-poof-mist hover:text-white cursor-pointer" asChild>
                <Link href={`/galleries/${gallery.id}`}>Open</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400 hover:text-red-300 cursor-pointer" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </GlassCard>
  )
}

function GalleryListRow({
  gallery,
  index,
  isSelected,
  onToggleSelect,
  isSelecting,
  onDelete,
}: GalleryCardProps) {
  const links = shareLinks.filter((link) => link.galleryId === gallery.id)
  const activeLinks = links.filter((link) => link.status === 'active')

  return (
    <GlassCard
      className={cn('group flex items-center gap-4 p-4 animate-fade-up', isSelected && 'ring-2 ring-poof-violet')}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelect}
        className={cn(
          'w-5 h-5 border-white/30 data-[state=checked]:bg-poof-violet data-[state=checked]:border-poof-violet',
          !isSelecting && 'opacity-0 group-hover:opacity-100',
        )}
      />

      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        {gallery.coverPhoto ? (
          <img src={gallery.coverPhoto} alt={gallery.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-poof-violet/20 to-poof-accent/20 flex items-center justify-center">
            <span className="font-heading font-bold text-xs text-white/40">
              {gallery.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-bold text-white truncate">{gallery.name}</h3>
        {gallery.description && <p className="text-poof-mist text-sm truncate">{gallery.description}</p>}
      </div>

      <div className="hidden sm:flex items-center gap-6 text-sm text-poof-mist">
        <span>{gallery.photoCount} photos</span>
        <span>{gallery.createdAt.toLocaleDateString()}</span>
      </div>

      <div className="hidden md:block">
        {activeLinks.length > 0 ? (
          <StatusBadge variant="active">{activeLinks.length} links</StatusBadge>
        ) : (
          <span className="text-sm text-poof-mist/50">No links</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-poof-mist hover:text-white" disabled>
          <Share2 className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-poof-mist hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-poof-base border-white/10">
            <DropdownMenuItem className="text-poof-mist hover:text-white cursor-pointer" asChild>
              <Link href={`/galleries/${gallery.id}`}>Open</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-400 hover:text-red-300 cursor-pointer" onClick={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </GlassCard>
  )
}
