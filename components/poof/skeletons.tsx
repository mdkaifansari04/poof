import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function SkeletonBox({ className, style }: SkeletonProps) {
  return (
    <div className={cn('skeleton-shimmer rounded-lg', className)} style={style} />
  )
}

export function SkeletonText({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton-shimmer h-4 rounded', className)} />
  )
}

export function SkeletonGalleryCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden', className)}>
      {/* Cover image skeleton */}
      <SkeletonBox className="aspect-video w-full" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <SkeletonText className="w-3/4" />
        <div className="flex gap-2">
          <SkeletonText className="w-16" />
          <SkeletonText className="w-20" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonStatsCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/[0.04] p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <SkeletonBox className="w-10 h-10 rounded-lg" />
        <SkeletonText className="w-12" />
      </div>
      <SkeletonText className="h-8 w-20 mb-2" />
      <SkeletonText className="w-32" />
    </div>
  )
}

export function SkeletonLinkRow({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.04]', className)}>
      <SkeletonBox className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText className="w-40" />
        <SkeletonText className="w-24" />
      </div>
      <SkeletonText className="w-20" />
      <div className="flex gap-2">
        <SkeletonBox className="w-8 h-8 rounded" />
        <SkeletonBox className="w-8 h-8 rounded" />
      </div>
    </div>
  )
}

export function SkeletonPhotoGrid({ count = 6, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBox
          key={i}
          className="aspect-square w-full"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

export function SkeletonActivityItem({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <SkeletonBox className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonText className="w-full max-w-xs" />
        <SkeletonText className="w-16" />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8 animate-fade-up">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Recent galleries */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <SkeletonText className="w-32 h-6" />
          <SkeletonText className="w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonGalleryCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
