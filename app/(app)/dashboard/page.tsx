'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/poof/glass-card'
import { EmptyState } from '@/components/poof/empty-state'
import { StatusBadge, ExpiryBadge } from '@/components/poof/status-badge'
import { SkeletonDashboard } from '@/components/poof/skeletons'
import { Button } from '@/components/ui/button'
import { 
  ImageIcon, 
  Link2, 
  Eye, 
  Upload, 
  Share2, 
  Clock, 
  TrendingUp,
  ArrowRight,
  MoreHorizontal,
  FolderOpen
} from 'lucide-react'
import { 
  mockGalleries, 
  mockActivities, 
  mockShareLinks,
  getStats, 
  formatBytes, 
  formatRelativeTime 
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Simple sparkline component
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 100 100" className={cn('w-20 h-8', className)} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const stats = getStats()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SkeletonDashboard />
  }

  const expiringLinks = mockShareLinks.filter(link => {
    if (!link.expiresAt || link.status !== 'active') return false
    const diff = link.expiresAt.getTime() - Date.now()
    return diff > 0 && diff < 24 * 60 * 60 * 1000
  })

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ImageIcon className="w-5 h-5" />}
          label="Total Galleries"
          value={stats.totalGalleries}
          subtext={`${stats.activeGalleries} active`}
          color="violet"
        />
        <StatCard
          icon={<Upload className="w-5 h-5" />}
          label="Photos Uploaded"
          value={stats.totalPhotos}
          subtext={`${formatBytes(stats.totalStorage)} used`}
          color="mint"
        />
        <StatCard
          icon={<Link2 className="w-5 h-5" />}
          label="Active Share Links"
          value={stats.activeLinks}
          subtext={stats.expiringToday > 0 ? `${stats.expiringToday} expiring today` : 'All good'}
          subtextColor={stats.expiringToday > 0 ? 'peach' : undefined}
          color="peach"
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Total Link Views"
          value={stats.totalViews}
          sparklineData={[12, 19, 15, 25, 32, 28, 47]}
          color="accent"
        />
      </div>

      {/* Expiring soon alert */}
      {expiringLinks.length > 0 && (
        <div className="rounded-xl border border-poof-peach/30 bg-poof-peach/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-poof-peach/20">
              <Clock className="w-5 h-5 text-poof-peach" />
            </div>
            <div>
              <p className="text-white font-medium">
                {expiringLinks.length} link{expiringLinks.length > 1 ? 's' : ''} expiring in the next 24 hours
              </p>
              <p className="text-poof-mist text-sm">Extend them to keep them active</p>
            </div>
          </div>
          <Button className="bg-poof-peach/20 hover:bg-poof-peach/30 text-poof-peach border border-poof-peach/30 btn-press">
            Extend all
          </Button>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent galleries */}
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

          {mockGalleries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockGalleries.slice(0, 3).map((gallery, i) => (
                <GalleryCard key={gallery.id} gallery={gallery} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState type="galleries" />
          )}
        </div>

        {/* Recent activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-white">Recent Activity</h2>
            <button className="text-sm text-poof-violet hover:underline">
              View all
            </button>
          </div>

          <GlassCard className="p-4" hover={false}>
            {mockActivities.length > 0 ? (
              <div className="divide-y divide-white/5">
                {mockActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-poof-mist text-sm">No activity yet</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

// Stat card component
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  subtext?: string
  subtextColor?: 'peach' | 'mint' | 'violet'
  sparklineData?: number[]
  color: 'violet' | 'mint' | 'peach' | 'accent'
}

function StatCard({ icon, label, value, subtext, subtextColor, sparklineData, color }: StatCardProps) {
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
        <div className={cn('p-2.5 rounded-xl', colorClasses[color])}>
          {icon}
        </div>
        {sparklineData && (
          <Sparkline data={sparklineData} className="text-poof-accent/60" />
        )}
      </div>
      <div className="font-heading font-bold text-3xl text-white mb-1">
        {value.toLocaleString()}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-poof-mist text-sm">{label}</p>
        {subtext && (
          <p className={cn(
            'text-xs',
            subtextColor ? subtextColorClasses[subtextColor] : 'text-poof-mist/60'
          )}>
            {subtext}
          </p>
        )}
      </div>
    </GlassCard>
  )
}

// Gallery card component
function GalleryCard({ gallery, index }: { gallery: typeof mockGalleries[0]; index: number }) {
  const activeLinks = mockShareLinks.filter(
    l => l.galleryId === gallery.id && l.status === 'active'
  ).length

  return (
    <GlassCard
      className="group overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
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
            <span className="font-heading font-bold text-2xl text-white/40">
              {gallery.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        
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

        {/* Links badge */}
        {activeLinks > 0 && (
          <div className="absolute top-2 right-2">
            <StatusBadge variant="active" className="text-[10px]">
              {activeLinks} link{activeLinks > 1 ? 's' : ''}
            </StatusBadge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-white truncate">
              {gallery.name}
            </h3>
            <p className="text-poof-mist text-sm">
              {gallery.photos.length} photo{gallery.photos.length !== 1 ? 's' : ''}
            </p>
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

// Activity item component
function ActivityItem({ activity }: { activity: typeof mockActivities[0] }) {
  const icons = {
    upload: <Upload className="w-4 h-4 text-poof-mint" />,
    share: <Share2 className="w-4 h-4 text-poof-violet" />,
    expire: <Clock className="w-4 h-4 text-poof-peach" />,
    milestone: <TrendingUp className="w-4 h-4 text-poof-accent" />,
  }

  const bgColors = {
    upload: 'bg-poof-mint/10',
    share: 'bg-poof-violet/10',
    expire: 'bg-poof-peach/10',
    milestone: 'bg-poof-accent/10',
  }

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn('p-2 rounded-lg', bgColors[activity.type])}>
        {icons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white leading-relaxed">
          {activity.message}
        </p>
        <p className="text-xs text-poof-mist mt-0.5">
          {formatRelativeTime(activity.createdAt)}
        </p>
      </div>
    </div>
  )
}
