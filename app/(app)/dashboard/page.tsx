'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/poof/glass-card'
import { EmptyState } from '@/components/poof/empty-state'
import { StatusBadge } from '@/components/poof/status-badge'
import { SkeletonDashboard } from '@/components/poof/skeletons'
import { Button } from '@/components/ui/button'
import { useGalleries, useSharedResources } from '@/hooks/queries'
import {
  ImageIcon,
  Link2,
  Eye,
  ArrowRight,
  FolderOpen,
  Share2,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return days === 1 ? 'yesterday' : `${days} days ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export default function DashboardPage() {
  const galleriesQuery = useGalleries()
  const sharedResourcesQuery = useSharedResources()

  const stats = useMemo(() => {
    const galleries = galleriesQuery.data ?? []
    const links = sharedResourcesQuery.data ?? []

    const activeLinks = links.filter((link) => link.status === 'ACTIVE')
    const expiringToday = activeLinks.filter((link) => {
      const diff = new Date(link.expiresAt).getTime() - Date.now()
      return diff > 0 && diff < 24 * 60 * 60 * 1000
    }).length

    return {
      totalGalleries: galleries.length,
      totalPhotos: galleries.reduce((sum, gallery) => sum + gallery.imageCount, 0),
      activeLinks: activeLinks.length,
      expiringToday,
      totalViews: links.reduce((sum, link) => sum + link.viewCount, 0),
    }
  }, [galleriesQuery.data, sharedResourcesQuery.data])

  if (galleriesQuery.isPending || sharedResourcesQuery.isPending) {
    return <SkeletonDashboard />
  }

  if (galleriesQuery.isError || sharedResourcesQuery.isError) {
    return (
      <GlassCard className="p-8 text-center" hover={false}>
        <p className="text-white font-medium">Could not load dashboard</p>
        <p className="text-poof-mist text-sm mt-2">
          {galleriesQuery.error?.message || sharedResourcesQuery.error?.message}
        </p>
        <Button
          onClick={() => {
            void galleriesQuery.refetch()
            void sharedResourcesQuery.refetch()
          }}
          className="mt-4 bg-poof-accent hover:bg-poof-accent/90 text-white"
        >
          Retry
        </Button>
      </GlassCard>
    )
  }

  const galleries = galleriesQuery.data ?? []
  const links = sharedResourcesQuery.data ?? []

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ImageIcon className="w-5 h-5" />}
          label="Total Galleries"
          value={stats.totalGalleries}
          subtext={`${stats.totalPhotos} photos`}
          color="violet"
        />
        <StatCard
          icon={<Link2 className="w-5 h-5" />}
          label="Active Share Links"
          value={stats.activeLinks}
          subtext={
            stats.expiringToday > 0 ? `${stats.expiringToday} expiring today` : 'All good'
          }
          subtextColor={stats.expiringToday > 0 ? 'peach' : undefined}
          color="peach"
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Total Link Views"
          value={stats.totalViews}
          subtext={`${links.length} total links`}
          color="accent"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Recent Links"
          value={Math.min(links.length, 10)}
          subtext="Last 10 records"
          color="mint"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-white">Recent Galleries</h2>
            <Link
              href="/galleries"
              className="text-sm text-poof-violet hover:underline inline-flex items-center gap-1 group"
            >
              View all
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {galleries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {galleries.slice(0, 3).map((gallery, index) => (
                <GlassCard
                  key={gallery.id}
                  className="group overflow-hidden animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-poof-violet/20 to-poof-accent/20 flex items-center justify-center">
                      <span className="font-heading font-bold text-2xl text-white/40">
                        {gallery.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-white truncate">{gallery.name}</h3>
                    <p className="text-poof-mist text-sm">{gallery.imageCount} photos</p>
                    <Button asChild size="sm" className="mt-3 bg-white/10 hover:bg-white/20 text-white">
                      <Link href={`/galleries/${gallery.id}`}>
                        <FolderOpen className="w-4 h-4 mr-1" />
                        Open
                      </Link>
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <EmptyState type="galleries" />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-white">Recent Share Links</h2>
          </div>
          <GlassCard className="p-4" hover={false}>
            {links.length > 0 ? (
              <div className="space-y-3">
                {links.slice(0, 10).map((link) => (
                  <div key={link.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={link.shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-poof-violet hover:underline break-all"
                      >
                        {link.shareUrl}
                      </a>
                      <StatusBadge
                        variant={
                          link.status === 'ACTIVE'
                            ? 'active'
                            : link.status === 'REVOKED'
                              ? 'revoked'
                              : 'expired'
                        }
                        className="text-[10px]"
                      >
                        {link.status}
                      </StatusBadge>
                    </div>
                    <div className="mt-2 text-xs text-poof-mist flex items-center justify-between">
                      <span className="inline-flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {link.type}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {link.viewCount}
                      </span>
                      <span>{formatRelativeTime(link.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-poof-mist text-sm">No share links yet</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  subtext?: string
  subtextColor?: 'peach' | 'mint' | 'violet'
  color: 'violet' | 'mint' | 'peach' | 'accent'
}

function StatCard({ icon, label, value, subtext, subtextColor, color }: StatCardProps) {
  const colorClasses = {
    violet: 'text-poof-violet bg-poof-violet/10',
    mint: 'text-poof-mint bg-poof-mint/10',
    peach: 'text-poof-peach bg-poof-peach/10',
    accent: 'text-poof-accent bg-poof-accent/10',
  }

  const subtextColorClasses = {
    peach: 'text-poof-peach',
    mint: 'text-poof-mint',
    violet: 'text-poof-violet',
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', colorClasses[color])}>{icon}</div>
      </div>
      <div className="font-heading font-bold text-3xl text-white mb-1">{value.toLocaleString()}</div>
      <div className="flex items-center justify-between">
        <p className="text-poof-mist text-sm">{label}</p>
        {subtext && (
          <p
            className={cn(
              'text-xs',
              subtextColor ? subtextColorClasses[subtextColor] : 'text-poof-mist/60',
            )}
          >
            {subtext}
          </p>
        )}
      </div>
    </GlassCard>
  )
}
