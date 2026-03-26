'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/poof/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Bell, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockNotifications } from '@/lib/mock-data'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatRelativeTime } from '@/lib/mock-data'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/galleries': 'My Galleries',
  '/links': 'Share Links',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function AppHeader() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const title = pageTitles[pathname] || 'Dashboard'
  const unreadCount = mockNotifications.filter(n => !n.read).length

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
          {/* Search */}
          <div className={cn(
            'flex items-center transition-all duration-300',
            searchOpen ? 'w-64' : 'w-auto'
          )}>
            {searchOpen ? (
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-poof-mist" />
                <Input
                  type="search"
                  placeholder="Search galleries, photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50 focus-ring"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false)
                    setSearchQuery('')
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-poof-mist hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="text-poof-mist hover:text-white hover:bg-white/5"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-poof-mist hover:text-white hover:bg-white/5"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-poof-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-0 bg-poof-base border-white/10"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-heading font-bold text-white">Notifications</h3>
                <button className="text-xs text-poof-violet hover:underline">
                  Mark all as read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.length > 0 ? (
                  mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b border-white/5 hover:bg-white/5 transition-colors',
                        !notification.read && 'bg-poof-accent/5'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          'w-2 h-2 mt-2 rounded-full flex-shrink-0',
                          notification.read ? 'bg-transparent' : 'bg-poof-accent'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-poof-mist mt-1">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-poof-mist/40 mx-auto mb-2" />
                    <p className="text-sm text-poof-mist">All quiet.</p>
                    <p className="text-xs text-poof-mist/60">Nothing to see here.</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

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
