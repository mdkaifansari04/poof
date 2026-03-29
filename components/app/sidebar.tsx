'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Logo, LogoIcon } from '@/components/poof/logo'
import {
  LayoutDashboard,
  ImageIcon,
  Link2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { authClient } from '@/lib/auth-client'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/galleries', icon: ImageIcon, label: 'My Galleries' },
  { href: '/links', icon: Link2, label: 'Share Links' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [collapsed, setCollapsed] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { data: session } = authClient.useSession()

  const displayName = session?.user?.name ?? 'Poof User'
  const displayEmail = session?.user?.email ?? 'No email'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2)

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
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col border-r border-white/5 bg-poof-base/95 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex items-center h-16 px-6 border-b border-white/5',
          collapsed && 'justify-center px-4',
        )}
      >
        {collapsed ? (
          <Link href="/dashboard">
            <LogoIcon size={32} />
          </Link>
        ) : (
          <Logo size="md" />
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive ? 'text-white bg-white/5' : 'text-poof-mist hover:text-white hover:bg-white/5',
                collapsed && 'justify-center px-0',
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-poof-violet rounded-full" />
              )}
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-poof-violet')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={cn('border-t border-white/5 p-3', collapsed && 'p-2')}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors',
                collapsed && 'justify-center',
              )}
            >
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-poof-accent text-white text-sm">{initials || 'PU'}</AvatarFallback>
              </Avatar>

              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-white truncate">{displayName}</div>
                  <div className="text-xs text-poof-mist truncate">{displayEmail}</div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-poof-base border-white/10">
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium text-white">{displayName}</div>
              <div className="text-xs text-poof-mist">{displayEmail}</div>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
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
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-poof-base border border-white/10 flex items-center justify-center text-poof-mist hover:text-white hover:border-white/20 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
