'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/poof/glass-card'
import { EmptyState } from '@/components/poof/empty-state'
import { StatusBadge } from '@/components/poof/status-badge'
import { SkeletonGalleryCard } from '@/components/poof/skeletons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
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
  Link2
} from 'lucide-react'
import { mockGalleries, mockShareLinks } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'expiring' | 'viewed' | 'az'
type FilterOption = 'all' | 'active' | 'expiring' | 'expired' | 'no-expiry'

export default function GalleriesPage() {
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredGalleries = useMemo(() => {
    let galleries = [...mockGalleries]

    // Search filter
    if (searchQuery) {
      galleries = galleries.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterBy !== 'all') {
      galleries = galleries.filter(g => {
        const links = mockShareLinks.filter(l => l.galleryId === g.id)
        switch (filterBy) {
          case 'active':
            return links.some(l => l.status === 'active')
          case 'expiring':
            return links.some(l => {
              if (!l.expiresAt || l.status !== 'active') return false
              const diff = l.expiresAt.getTime() - Date.now()
              return diff > 0 && diff < 24 * 60 * 60 * 1000
            })
          case 'expired':
            return links.every(l => l.status === 'expired')
          case 'no-expiry':
            return links.some(l => !l.expiresAt && l.status === 'active')
          default:
            return true
        }
      })
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        galleries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      case 'az':
        galleries.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest':
      default:
        galleries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    return galleries
  }, [searchQuery, sortBy, filterBy])

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedGalleries)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedGalleries(newSelected)
  }

  const clearSelection = () => {
    setSelectedGalleries(new Set())
  }

  const isSelecting = selectedGalleries.size > 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="skeleton-shimmer h-10 w-64 rounded-lg" />
          <div className="skeleton-shimmer h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonGalleryCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-poof-mist" />
            <Input
              type="search"
              placeholder="Search galleries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
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

          {/* View toggle */}
          <div className="hidden sm:flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-poof-mist hover:text-white'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-poof-mist hover:text-white'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'active', 'expiring', 'expired', 'no-expiry'] as FilterOption[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterBy(filter)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
                filterBy === filter
                  ? 'bg-poof-violet/20 border-poof-violet/30 text-poof-violet'
                  : 'border-white/10 text-poof-mist hover:text-white hover:border-white/20'
              )}
            >
              {filter === 'all' ? 'All' : 
               filter === 'active' ? 'Active' :
               filter === 'expiring' ? 'Expiring Soon' :
               filter === 'expired' ? 'Expired' : 'No Expiry'}
            </button>
          ))}
        </div>

        {/* New gallery button */}
        <Button asChild className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press">
          <Link href="/galleries/new">
            <Plus className="w-4 h-4 mr-2" />
            New Gallery
          </Link>
        </Button>
      </div>

      {/* Bulk selection bar */}
      {isSelecting && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-poof-violet/30 bg-poof-violet/10 animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">
              {selectedGalleries.size} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-poof-mist hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-poof-mist hover:text-white">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="text-poof-mist hover:text-white">
              <Clock className="w-4 h-4 mr-1" />
              Extend
            </Button>
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Gallery grid/list */}
      {filteredGalleries.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGalleries.map((gallery, i) => (
              <GalleryGridCard
                key={gallery.id}
                gallery={gallery}
                index={i}
                isSelected={selectedGalleries.has(gallery.id)}
                onToggleSelect={() => toggleSelection(gallery.id)}
                isSelecting={isSelecting}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGalleries.map((gallery, i) => (
              <GalleryListRow
                key={gallery.id}
                gallery={gallery}
                index={i}
                isSelected={selectedGalleries.has(gallery.id)}
                onToggleSelect={() => toggleSelection(gallery.id)}
                isSelecting={isSelecting}
              />
            ))}
          </div>
        )
      ) : searchQuery ? (
        <EmptyState type="search" />
      ) : (
        <EmptyState type="galleries" />
      )}
    </div>
  )
}

// Gallery grid card
interface GalleryCardProps {
  gallery: typeof mockGalleries[0]
  index: number
  isSelected: boolean
  onToggleSelect: () => void
  isSelecting: boolean
}

function GalleryGridCard({ gallery, index, isSelected, onToggleSelect, isSelecting }: GalleryCardProps) {
  const links = mockShareLinks.filter(l => l.galleryId === gallery.id)
  const activeLinks = links.filter(l => l.status === 'active')
  const hasExpiring = activeLinks.some(l => {
    if (!l.expiresAt) return false
    const diff = l.expiresAt.getTime() - Date.now()
    return diff > 0 && diff < 24 * 60 * 60 * 1000
  })

  return (
    <GlassCard
      className={cn(
        'group overflow-hidden animate-fade-up',
        isSelected && 'ring-2 ring-poof-violet'
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Cover image */}
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
        
        {/* Checkbox */}
        <div className={cn(
          'absolute top-3 left-3 transition-opacity',
          isSelecting || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="w-5 h-5 border-white/50 bg-black/50 data-[state=checked]:bg-poof-violet data-[state=checked]:border-poof-violet"
          />
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {hasExpiring ? (
            <StatusBadge variant="expiring">Expiring soon</StatusBadge>
          ) : activeLinks.length > 0 ? (
            <StatusBadge variant="active">{activeLinks.length} active</StatusBadge>
          ) : null}
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" asChild className="btn-press">
            <Link href={`/galleries/${gallery.id}`}>
              <FolderOpen className="w-4 h-4 mr-1" />
              Open
            </Link>
          </Button>
          <Button size="sm" variant="secondary" className="btn-press">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-white truncate">
              {gallery.name}
            </h3>
            <div className="flex items-center gap-2 text-poof-mist text-sm mt-1">
              <span>{gallery.photos.length} photos</span>
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
              <Button variant="ghost" size="icon" className="h-8 w-8 text-poof-mist hover:text-white flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
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
              <DropdownMenuItem className="text-red-400 hover:text-red-300 cursor-pointer">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </GlassCard>
  )
}

// Gallery list row
function GalleryListRow({ gallery, index, isSelected, onToggleSelect, isSelecting }: GalleryCardProps) {
  const links = mockShareLinks.filter(l => l.galleryId === gallery.id)
  const activeLinks = links.filter(l => l.status === 'active')

  return (
    <GlassCard
      className={cn(
        'flex items-center gap-4 p-4 animate-fade-up',
        isSelected && 'ring-2 ring-poof-violet'
      )}
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelect}
        className={cn(
          'w-5 h-5 border-white/30 data-[state=checked]:bg-poof-violet data-[state=checked]:border-poof-violet',
          !isSelecting && 'opacity-0 group-hover:opacity-100'
        )}
      />

      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        {gallery.coverPhoto ? (
          <img
            src={gallery.coverPhoto}
            alt={gallery.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-poof-violet/20 to-poof-accent/20 flex items-center justify-center">
            <span className="font-heading font-bold text-xs text-white/40">
              {gallery.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-bold text-white truncate">
          {gallery.name}
        </h3>
        {gallery.description && (
          <p className="text-poof-mist text-sm truncate">
            {gallery.description}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-6 text-sm text-poof-mist">
        <span>{gallery.photos.length} photos</span>
        <span>{gallery.createdAt.toLocaleDateString()}</span>
      </div>

      {/* Status */}
      <div className="hidden md:block">
        {activeLinks.length > 0 ? (
          <StatusBadge variant="active">{activeLinks.length} links</StatusBadge>
        ) : (
          <span className="text-sm text-poof-mist/50">No links</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-poof-mist hover:text-white">
          <Share2 className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-poof-mist hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
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
            <DropdownMenuItem className="text-red-400 hover:text-red-300 cursor-pointer">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </GlassCard>
  )
}
