import { LandingHero } from '@/components/landing/hero'
import { LandingFeatures } from '@/components/landing/features'
import { LandingHowItWorks } from '@/components/landing/how-it-works'
import { LandingPricing } from '@/components/landing/pricing'
import { LandingFooter } from '@/components/landing/footer'
import { LandingNav } from '@/components/landing/nav'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-poof-base">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
