import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Cloud, Image, Link2, Bell, Search, Ghost, BarChart3 } from 'lucide-react'

type EmptyStateType = 
  | 'galleries' 
  | 'gallery-empty' 
  | 'links' 
  | 'notifications' 
  | 'search' 
  | 'expired' 
  | 'analytics'

interface EmptyStateProps {
  type: EmptyStateType
  className?: string
}

const emptyStates: Record<EmptyStateType, {
  icon: React.ReactNode
  heading: string
  subtext: string
  cta?: { label: string; href: string }
}> = {
  galleries: {
    icon: <Cloud className="w-16 h-16" />,
    heading: 'Nothing here yet.',
    subtext: 'Your photos deserve a home.',
    cta: { label: 'Create first gallery', href: '/galleries/new' },
  },
  'gallery-empty': {
    icon: <Image className="w-16 h-16" />,
    heading: 'This gallery is empty.',
    subtext: 'Drop some photos in.',
    cta: { label: 'Add photos', href: '#' },
  },
  links: {
    icon: <Link2 className="w-16 h-16" />,
    heading: 'No links yet.',
    subtext: 'Share a gallery to get started.',
    cta: { label: 'Go to galleries', href: '/galleries' },
  },
  notifications: {
    icon: <Bell className="w-16 h-16" />,
    heading: 'All quiet.',
    subtext: 'Nothing to see here.',
  },
  search: {
    icon: <Search className="w-16 h-16" />,
    heading: 'No matches.',
    subtext: 'Try a different search.',
    cta: { label: 'Clear search', href: '#' },
  },
  expired: {
    icon: <Ghost className="w-16 h-16" />,
    heading: 'This one poofed.',
    subtext: 'This link has expired.',
    cta: { label: 'Try Poof free', href: '/signup' },
  },
  analytics: {
    icon: <BarChart3 className="w-16 h-16" />,
    heading: 'No views yet.',
    subtext: 'Share a link to start tracking.',
    cta: { label: 'Share a gallery', href: '/galleries' },
  },
}

export function EmptyState({ type, className }: EmptyStateProps) {
  const state = emptyStates[type]

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {/* Illustration */}
      <div className="relative mb-6">
        {/* Glow behind icon */}
        <div className="absolute inset-0 blur-2xl opacity-30">
          <div className="w-full h-full bg-poof-violet rounded-full" />
        </div>
        <div className="relative text-poof-violet/60">
          {state.icon}
        </div>
      </div>

      {/* Text content */}
      <h3 className="font-heading font-bold text-2xl text-white mb-2">
        {state.heading}
      </h3>
      <p className="text-poof-mist text-sm mb-6 max-w-xs">
        {state.subtext}
      </p>

      {/* CTA */}
      {state.cta && (
        <Button asChild className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press">
          <Link href={state.cta.href}>
            {state.cta.label}
            <span className="ml-1 transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </Button>
      )}
    </div>
  )
}
