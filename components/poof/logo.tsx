'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  showWordmark?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ showWordmark = true, className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
  }

  const { icon, text } = sizes[size]

  return (
    <Link href="/" className={cn('flex items-center gap-2 group', className)}>
      {/* Poof cloud icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105"
      >
        <circle
          cx="20"
          cy="22"
          r="10"
          fill="url(#cloudGradient)"
          className="opacity-80"
        />
        <circle
          cx="13"
          cy="24"
          r="7"
          fill="url(#cloudGradient)"
          className="opacity-70"
        />
        <circle
          cx="27"
          cy="24"
          r="7"
          fill="url(#cloudGradient)"
          className="opacity-70"
        />
        <circle
          cx="16"
          cy="18"
          r="6"
          fill="url(#cloudGradient)"
          className="opacity-60"
        />
        <circle
          cx="24"
          cy="18"
          r="6"
          fill="url(#cloudGradient)"
          className="opacity-60"
        />
        {/* Sparkle */}
        <path
          d="M30 10L31 13L34 14L31 15L30 18L29 15L26 14L29 13L30 10Z"
          fill="#c8b8ff"
          className="animate-pulse"
        />
        <defs>
          <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c8b8ff" />
            <stop offset="100%" stopColor="#7c5cfc" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && (
        <span className={cn('font-heading font-extrabold text-white', text)}>
          poof
        </span>
      )}
    </Link>
  )
}

export function LogoIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="20" cy="22" r="10" fill="url(#cloudGradientIcon)" className="opacity-80" />
      <circle cx="13" cy="24" r="7" fill="url(#cloudGradientIcon)" className="opacity-70" />
      <circle cx="27" cy="24" r="7" fill="url(#cloudGradientIcon)" className="opacity-70" />
      <circle cx="16" cy="18" r="6" fill="url(#cloudGradientIcon)" className="opacity-60" />
      <circle cx="24" cy="18" r="6" fill="url(#cloudGradientIcon)" className="opacity-60" />
      <path d="M30 10L31 13L34 14L31 15L30 18L29 15L26 14L29 13L30 10Z" fill="#c8b8ff" />
      <defs>
        <linearGradient id="cloudGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8b8ff" />
          <stop offset="100%" stopColor="#7c5cfc" />
        </linearGradient>
      </defs>
    </svg>
  )
}
