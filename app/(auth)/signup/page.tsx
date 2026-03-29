'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Logo } from '@/components/poof/logo'
import { GlassCard } from '@/components/poof/glass-card'
import { AnimatedBackground } from '@/components/poof/animated-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

function getPasswordStrength(password: string): { strength: PasswordStrength; score: number } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { strength: 'weak', score: 1 }
  if (score === 2) return { strength: 'fair', score: 2 }
  if (score === 3) return { strength: 'good', score: 3 }
  return { strength: 'strong', score: 4 }
}

const strengthColors: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-poof-mint',
}

const strengthLabels: Record<PasswordStrength, string> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
}

export default function SignupPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const passwordStrength = useMemo(() => {
    if (!password) return null
    return getPasswordStrength(password)
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!agreedToTerms) {
      setError('You must agree to the terms')
      return
    }

    setLoading(true)

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message ?? 'Unable to create account')
        return
      }

      setSuccess(true)
      
      // Redirect after success animation
      setTimeout(() => {
        queryClient.clear()
        router.push('/dashboard')
        router.refresh()
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError(null)
    setLoading(true)
    try {
      queryClient.clear()
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-up failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-poof-base flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <GlassCard className="p-8" hover={false}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading font-extrabold text-3xl text-white mb-2">
              Create your account.
            </h1>
            <p className="text-poof-mist text-sm">
              Free forever. No credit card.
            </p>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-gray-100 text-gray-900 border-0 btn-press mb-6"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-poof-mist">or</span>
            </div>
          </div>

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm text-poof-mist">
                Full name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className={cn(
                  'bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50 focus-ring',
                  error && !name && 'border-red-500 shake'
                )}
                disabled={loading || success}
              />
            </div>

            {/* Email */}
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
                  error && !email && 'border-red-500 shake'
                )}
                disabled={loading || success}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-poof-mist">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={cn(
                    'bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50 pr-10 focus-ring',
                    error && !password && 'border-red-500 shake'
                  )}
                  disabled={loading || success}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-poof-mist hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password strength meter */}
              {password && passwordStrength && (
                <div className="space-y-1.5 animate-fade-up">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((segment) => (
                      <div
                        key={segment}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          segment <= passwordStrength.score
                            ? strengthColors[passwordStrength.strength]
                            : 'bg-white/10'
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    'text-xs',
                    passwordStrength.strength === 'weak' && 'text-red-400',
                    passwordStrength.strength === 'fair' && 'text-orange-400',
                    passwordStrength.strength === 'good' && 'text-yellow-400',
                    passwordStrength.strength === 'strong' && 'text-poof-mint'
                  )}>
                    {strengthLabels[passwordStrength.strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Terms agreement */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-0.5 border-white/20 data-[state=checked]:bg-poof-accent data-[state=checked]:border-poof-accent"
              />
              <label htmlFor="terms" className="text-sm text-poof-mist cursor-pointer leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-poof-violet hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-poof-violet hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-400 text-sm animate-fade-up">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className={cn(
                'w-full btn-press transition-all duration-300',
                success
                  ? 'bg-poof-mint hover:bg-poof-mint'
                  : 'bg-poof-accent hover:bg-poof-accent/90'
              )}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Account created!
                </>
              ) : (
                <>Create account &rarr;</>
              )}
            </Button>
          </form>

          {/* Log in link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-poof-mist">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-poof-violet hover:underline inline-flex items-center gap-1 group"
              >
                Log in
                <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
