'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/poof/glass-card'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out Poof',
    features: [
      '5 galleries',
      '100 MB storage',
      'Expiring links',
      'View limits',
      'Basic analytics',
    ],
    cta: 'Get started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Creator',
    price: '$9',
    period: '/month',
    description: 'For photographers and creatives',
    features: [
      '50 galleries',
      '10 GB storage',
      'Password protection',
      'Custom expiry times',
      'Full analytics',
      'Download controls',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/signup?plan=creator',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For teams and agencies',
    features: [
      'Unlimited galleries',
      '100 GB storage',
      'Everything in Creator',
      'Geographic analytics',
      'Custom branding',
      'API access',
      'Team members',
      'White-label options',
    ],
    cta: 'Contact sales',
    href: '/signup?plan=pro',
    highlighted: false,
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Simple pricing.{' '}
            <span className="text-poof-violet">No surprises.</span>
          </h2>
          <p className="text-lg text-poof-mist max-w-2xl mx-auto">
            Start free, upgrade when you need more. No credit card required.
          </p>
        </div>

        {/* Pricing cards */}
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
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-poof-accent text-white text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Most popular
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6 pt-2">
                <h3 className="font-heading font-bold text-xl text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-heading font-extrabold text-4xl text-white">
                    {plan.price}
                  </span>
                  <span className="text-poof-mist text-sm">{plan.period}</span>
                </div>
                <p className="text-poof-mist text-sm mt-2">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-poof-mint flex-shrink-0" />
                    <span className="text-poof-mist">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
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

        {/* FAQ teaser */}
        <div className="mt-16 text-center">
          <p className="text-poof-mist text-sm">
            Questions? Check out our{' '}
            <a href="#" className="text-poof-violet hover:underline">
              FAQ
            </a>{' '}
            or{' '}
            <a href="#" className="text-poof-violet hover:underline">
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
