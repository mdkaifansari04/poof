'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo, LogoIcon } from '@/components/poof/logo'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  ImageIcon, 
  Link2, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockUser } from '@/lib/mock-data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/galleries', icon: ImageIcon, label: 'My Galleries' },
  { href: '/links', icon: Link2, label: 'Share Links' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

const planBadges = {
  free: { label: 'Free', className: 'bg-white/10 text-poof-mist' },
  creator: { label: 'Creator', className: 'bg-poof-violet/20 text-poof-violet' },
  pro: { label: 'Pro', className: 'bg-poof-accent/20 text-poof-accent' },
}

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col border-r border-white/5 bg-poof-base/95 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-6 border-b border-white/5',
        collapsed && 'justify-center px-4'
      )}>
        {collapsed ? (
          <Link href="/dashboard">
            <LogoIcon size={32} />
          </Link>
        ) : (
          <Logo size="md" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-white bg-white/5'
                  : 'text-poof-mist hover:text-white hover:bg-white/5',
                collapsed && 'justify-center px-0'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-poof-violet rounded-full" />
              )}
              
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-poof-violet')} />
              
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* New Gallery button */}
      <div className={cn('px-3 pb-4', collapsed && 'px-2')}>
        <Button
          asChild
          className={cn(
            'w-full bg-poof-accent hover:bg-poof-accent/90 text-white btn-press',
            collapsed && 'px-0'
          )}
        >
          <Link href="/galleries/new">
            <Plus className="w-4 h-4" />
            {!collapsed && <span className="ml-2">New Gallery</span>}
          </Link>
        </Button>
      </div>

      {/* User menu */}
      <div className={cn(
        'border-t border-white/5 p-3',
        collapsed && 'p-2'
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors',
                collapsed && 'justify-center'
              )}
            >
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-poof-accent text-white text-sm">
                  {mockUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-white truncate">
                    {mockUser.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      planBadges[mockUser.plan].className
                    )}>
                      {planBadges[mockUser.plan].label}
                    </span>
                  </div>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-poof-base border-white/10">
            <div className="px-2 py-1.5">
              <div className="text-sm font-medium text-white">{mockUser.name}</div>
              <div className="text-xs text-poof-mist">{mockUser.email}</div>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer text-poof-mist hover:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link href="/login" className="cursor-pointer text-red-400 hover:text-red-300">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-poof-base border border-white/10 flex items-center justify-center text-poof-mist hover:text-white hover:border-white/20 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
