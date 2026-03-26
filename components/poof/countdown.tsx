'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CountdownProps {
  expiresAt: Date | null
  className?: string
  onExpire?: () => void
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Expired'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export function Countdown({ expiresAt, className, onExpire }: CountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!expiresAt) return

    const updateTime = () => {
      const diff = expiresAt.getTime() - Date.now()
      setTimeRemaining(diff)
      if (diff <= 0 && onExpire) {
        onExpire()
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  if (!expiresAt) {
    return (
      <span className={cn('text-poof-mist', className)}>
        No expiry
      </span>
    )
  }

  if (timeRemaining === null) return null

  const isExpiring = timeRemaining > 0 && timeRemaining < 24 * 60 * 60 * 1000 // < 24h
  const isCritical = timeRemaining > 0 && timeRemaining < 60 * 60 * 1000 // < 1h
  const isExpired = timeRemaining <= 0

  return (
    <span
      className={cn(
        'font-mono tabular-nums transition-colors duration-300',
        isExpired && 'text-poof-mist line-through',
        isCritical && 'text-poof-peach animate-pulse',
        isExpiring && !isCritical && 'text-poof-peach',
        !isExpiring && !isExpired && 'text-white',
        className
      )}
    >
      {formatTimeRemaining(timeRemaining)}
    </span>
  )
}

interface CountdownBadgeProps extends CountdownProps {
  showLabel?: boolean
}

export function CountdownBadge({ expiresAt, className, onExpire, showLabel = false }: CountdownBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!expiresAt) return

    const updateTime = () => {
      const diff = expiresAt.getTime() - Date.now()
      setTimeRemaining(diff)
      if (diff <= 0 && onExpire) {
        onExpire()
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  if (!expiresAt) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-poof-mint/20 text-poof-mint border border-poof-mint/30', className)}>
        {showLabel && 'Expires: '}Never
      </span>
    )
  }

  if (timeRemaining === null) return null

  const isExpiring = timeRemaining > 0 && timeRemaining < 24 * 60 * 60 * 1000
  const isExpired = timeRemaining <= 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border font-mono tabular-nums',
        isExpired && 'bg-white/5 text-poof-mist border-white/10',
        isExpiring && !isExpired && 'bg-poof-peach/20 text-poof-peach border-poof-peach/30 pulse-badge',
        !isExpiring && !isExpired && 'bg-poof-mint/20 text-poof-mint border-poof-mint/30',
        className
      )}
    >
      {showLabel && !isExpired && 'Expires: '}
      {formatTimeRemaining(timeRemaining)}
    </span>
  )
}
