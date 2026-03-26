'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/poof/logo'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/galleries': 'My Galleries',
  '/links': 'Share Links',
  '/settings': 'Settings',
}

export function AppHeader() {
  const pathname = usePathname()

  const title = pageTitles[pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-poof-base/95 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Mobile logo */}
        <div className="lg:hidden">
          <Logo size="sm" showWordmark={false} />
        </div>

        {/* Page title (desktop) */}
        <h1 className="hidden lg:block font-heading font-bold text-xl text-white">
          {title}
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* New Gallery button (desktop) */}
          <Button
            asChild
            className="hidden sm:inline-flex bg-poof-accent hover:bg-poof-accent/90 text-white btn-press"
          >
            <Link href="/galleries/new">
              <Plus className="w-4 h-4 mr-2" />
              New Gallery
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
