'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ImageIcon, 
  Link2, 
  Settings 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/galleries', icon: ImageIcon, label: 'Galleries' },
  { href: '/links', icon: Link2, label: 'Links' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function AppMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/5 bg-poof-base/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-poof-violet'
                  : 'text-poof-mist hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
