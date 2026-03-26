'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/poof/logo'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
]

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-poof-base/80 backdrop-blur-xl border-b border-white/5" />
      <nav className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-poof-mist hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild className="text-poof-mist hover:text-white hover:bg-white/5">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press">
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-poof-mist hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            'md:hidden absolute top-full left-0 right-0 bg-poof-base/95 backdrop-blur-xl border-b border-white/5 overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'block text-poof-mist hover:text-white transition-colors animate-fade-up',
                  `stagger-${i + 1}`
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Button variant="ghost" asChild className="w-full justify-center text-poof-mist hover:text-white hover:bg-white/5">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="w-full bg-poof-accent hover:bg-poof-accent/90 text-white">
                <Link href="/signup">Get started free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
