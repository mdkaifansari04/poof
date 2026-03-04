import { createFileRoute } from '@tanstack/react-router';
import { Navigation } from '@/components/container/landing/Navigation';
import { Hero } from '@/components/container/landing/Hero';
import { Marquee } from '@/components/container/landing/Marquee';
import { Features } from '@/components/container/landing/Features';
import { HowItWorks } from '@/components/container/landing/HowItWorks';
import { Demo } from '@/components/container/landing/Demo';
import { Testimonials } from '@/components/container/landing/Testimonials';
import { Pricing } from '@/components/container/landing/Pricing';
import { FAQ } from '@/components/container/landing/FAQ';
import { FinalCTA } from '@/components/container/landing/FinalCTA';
import { LandingFooter } from '@/components/container/landing/LandingFooter';

export const Route = createFileRoute('/')({ component: LandingPage });

function LandingPage() {
  return (
    <div className="min-h-screen bg-poof-void text-poof-white">
      <Navigation />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <Demo />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}

