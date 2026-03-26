'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/poof/glass-card'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Account Limits',
    price: 'V1',
    period: 'constraints',
    description: 'Server-enforced limits for predictable usage',
    features: [
      'Up to 50 galleries per account',
      'Up to 500 images per gallery',
      'Maximum 10 MB per image',
      'Allowed types: JPEG, PNG, WEBP, HEIC',
      'One account per user',
    ],
    cta: 'Create account',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Share Rules',
    price: 'V1',
    period: 'behavior',
    description: 'How link creation and expiry work',
    features: [
      'Gallery, single-image, and multi-image sharing',
      'Up to 100 images in one multi-image link',
      'Up to 20 active links per gallery',
      'Expiry range: 1 hour to 1 year',
      'Unlimited independent links per resource',
      'Manual revoke at any time',
    ],
    cta: 'Start sharing',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Lifecycle',
    price: 'V1',
    period: 'operations',
    description: 'Upload, session, and cleanup timelines',
    features: [
      'Presigned upload URLs expire after 5 minutes',
      'Pending uploads older than 30 minutes become failed',
      'Failed uploads are purged after 24 hours',
      'Soft-deleted images are removed from storage within 24 hours',
      'Session duration: 30 days with sliding refresh',
    ],
    cta: 'Read privacy policy',
    href: '/privacy',
    highlighted: false,
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Product constraints. <span className="text-poof-violet">Clearly defined.</span>
          </h2>
          <p className="text-lg text-poof-mist max-w-2xl mx-auto">
            The platform enforces these limits server-side so behavior is consistent and predictable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <GlassCard
              key={plan.name}
              className={cn(
                'relative p-6 lg:p-8 animate-fade-up',
                plan.highlighted && 'border-poof-accent/50 bg-poof-accent/5'
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
              hover={!plan.highlighted}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-poof-accent text-white text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Core link behavior
                  </div>
                </div>
              )}

              <div className="text-center mb-6 pt-2">
                <h3 className="font-heading font-bold text-xl text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-heading font-extrabold text-4xl text-white">{plan.price}</span>
                  <span className="text-poof-mist text-sm">{plan.period}</span>
                </div>
                <p className="text-poof-mist text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-poof-mint flex-shrink-0" />
                    <span className="text-poof-mist">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  'w-full btn-press',
                  plan.highlighted
                    ? 'bg-poof-accent hover:bg-poof-accent/90 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                )}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </GlassCard>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-poof-mist text-sm">
            Need implementation details? Visit the <a href="#faq" className="text-poof-violet hover:underline">FAQ</a>{' '}
            or read our <Link href="/terms" className="text-poof-violet hover:underline">Terms</Link>.
          </p>
        </div>
      </div>
    </section>
  )
}
