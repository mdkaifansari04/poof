import { createFileRoute } from '@tanstack/react-router';
import { Navigation } from '@/components/container/landing/Navigation';
import { Hero } from '@/components/container/landing/Hero';
import { Features } from '@/components/container/landing/Features';
import { HowItWorks } from '@/components/container/landing/HowItWorks';
import { FAQ } from '@/components/container/landing/FAQ';
import { FinalCTA } from '@/components/container/landing/FinalCTA';
import { LandingFooter } from '@/components/container/landing/LandingFooter';

export const Route = createFileRoute('/')({ component: LandingPage });

function LandingPage() {
  return (
    <div className="min-h-screen bg-poof-void text-poof-white">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
}
