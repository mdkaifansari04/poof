'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/poof/logo'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      <div
        className={cn(
          'absolute inset-0 transition-all duration-500',
          scrolled
            ? 'bg-background/70 backdrop-blur-2xl border-b border-border'
            : 'bg-transparent border-b border-transparent'
        )}
      />
      <nav className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Logo size="md" />

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors pb-0.5
                  after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-gradient-to-r after:from-poof-violet after:to-poof-accent
                  after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left
                  after:transition-transform after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press"
            >
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div
          className={cn(
            'md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'block text-muted-foreground hover:text-foreground transition-colors animate-fade-up',
                  `stagger-${i + 1}`
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-border space-y-3">
              <Button
                size="sm"
                variant="ghost"
                asChild
                className="w-full justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="w-full bg-poof-accent hover:bg-poof-accent/90 text-white"
              >
                <Link href="/signup">Get started free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
