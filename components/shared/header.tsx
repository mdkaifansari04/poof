'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Logo } from '@/components/poof/logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Settings, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/galleries': 'My Galleries',
  '/links': 'Share Links',
  '/settings': 'Settings',
}

export function AppHeader() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: session } = authClient.useSession()

  const title = pageTitles[pathname] || 'Dashboard'
  const initials =
    session?.user?.name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'PU'

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    try {
      await authClient.signOut()
      queryClient.clear()
      router.push('/signin')
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-poof-base/95 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Mobile logo */}
        <div className="lg:hidden">
          <Logo size="md" showWordmark />
        </div>

        {/* Page title (desktop) */}
        <h1 className="hidden lg:block font-heading font-bold text-xl text-white">
          {title}
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="lg:hidden p-1 rounded-full hover:bg-white/5 transition-colors">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-poof-accent text-white text-sm">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-poof-base border-white/10">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer text-poof-mist hover:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:text-red-300"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isSigningOut ? 'Signing out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
