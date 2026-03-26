import { cn } from '@/lib/utils'
import { Lock, X } from 'lucide-react'

type BadgeVariant = 'active' | 'expiring' | 'expired' | 'revoked' | 'gallery' | 'photo'

interface StatusBadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  className?: string
  showIcon?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-poof-mint/20 text-poof-mint border-poof-mint/30',
  expiring: 'bg-poof-peach/20 text-poof-peach border-poof-peach/30 pulse-badge',
  expired: 'bg-white/5 text-poof-mist border-white/10 line-through',
  revoked: 'bg-white/5 text-poof-mist border-white/10',
  gallery: 'bg-poof-violet/20 text-poof-violet border-poof-violet/30',
  photo: 'bg-poof-peach/20 text-poof-peach border-poof-peach/30',
}

export function StatusBadge({ variant, children, className, showIcon = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        variantStyles[variant],
        className
      )}
    >
      {showIcon && variant === 'revoked' && <X className="w-3 h-3" />}
      {children}
    </span>
  )
}

interface ExpiryBadgeProps {
  expiresAt: Date | null
  className?: string
}

export function ExpiryBadge({ expiresAt, className }: ExpiryBadgeProps) {
  if (!expiresAt) {
    return (
      <StatusBadge variant="active" className={className}>
        No expiry
      </StatusBadge>
    )
  }

  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()

  if (diff <= 0) {
    return (
      <StatusBadge variant="expired" className={className}>
        Poofed
      </StatusBadge>
    )
  }

  const hours = diff / (1000 * 60 * 60)

  if (hours < 24) {
    return (
      <StatusBadge variant="expiring" className={className}>
        Expiring soon
      </StatusBadge>
    )
  }

  return (
    <StatusBadge variant="active" className={className}>
      Active
    </StatusBadge>
  )
}

interface PasswordBadgeProps {
  hasPassword: boolean
  className?: string
}

export function PasswordBadge({ hasPassword, className }: PasswordBadgeProps) {
  if (!hasPassword) return null

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-poof-mist',
        className
      )}
    >
      <Lock className="w-3 h-3" />
    </span>
  )
}
