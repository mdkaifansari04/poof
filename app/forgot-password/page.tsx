'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/poof/logo'
import { GlassCard } from '@/components/poof/glass-card'
import { AnimatedBackground } from '@/components/poof/animated-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSubmitted(true)
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    
    // Start cooldown
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Detect email provider for quick links
  const emailProvider = email.includes('@gmail') 
    ? 'gmail' 
    : email.includes('@outlook') || email.includes('@hotmail')
      ? 'outlook'
      : null

  return (
    <div className="min-h-screen bg-poof-base flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <GlassCard className="p-8" hover={false}>
          {/* Back button */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-poof-mist hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to login</span>
          </Link>

          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-heading font-extrabold text-3xl text-white mb-2">
                  Forgot your password?
                </h1>
                <p className="text-poof-mist text-sm">
                  {"No worries. We'll send you a reset link."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-poof-mist">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={cn(
                      'bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50 focus-ring',
                      error && 'border-red-500 shake'
                    )}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-sm animate-fade-up">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-poof-accent hover:bg-poof-accent/90 btn-press"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center animate-fade-up">
              {/* Animated checkmark */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-poof-mint/20 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-10 h-10 text-poof-mint"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 6L9 17l-5-5"
                      className="animate-draw-check"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="font-heading font-extrabold text-2xl text-white mb-2">
                Check your email.
              </h2>
              <p className="text-poof-mist text-sm mb-6">
                We sent a reset link to{' '}
                <span className="text-white font-medium">{email}</span>.
                <br />
                It expires in 15 minutes.
              </p>

              {/* Quick email links */}
              {emailProvider && (
                <div className="flex justify-center gap-3 mb-6">
                  {emailProvider === 'gmail' && (
                    <Button
                      asChild
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    >
                      <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                        <Mail className="w-4 h-4 mr-2" />
                        Open Gmail
                      </a>
                    </Button>
                  )}
                  {emailProvider === 'outlook' && (
                    <Button
                      asChild
                      variant="outline"
                      className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    >
                      <a href="https://outlook.live.com" target="_blank" rel="noopener noreferrer">
                        <Mail className="w-4 h-4 mr-2" />
                        Open Outlook
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {/* Resend link */}
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className={cn(
                  'text-sm transition-colors',
                  resendCooldown > 0 || loading
                    ? 'text-poof-mist/50 cursor-not-allowed'
                    : 'text-poof-violet hover:underline'
                )}
              >
                {loading ? (
                  'Sending...'
                ) : resendCooldown > 0 ? (
                  `Resend link (${resendCooldown}s)`
                ) : (
                  'Resend link'
                )}
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
