'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedBackground } from '@/components/poof/animated-background'
import { ArrowRight, Clock, Eye, Lock } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-poof-mist mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-poof-mint animate-pulse" />
          Share photos that disappear
        </div>

        {/* Headline */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 animate-fade-up stagger-1">
          Your photos.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-poof-violet to-poof-accent">
            Your timeline.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-poof-mist max-w-2xl mx-auto mb-10 animate-fade-up stagger-2 text-balance">
          Share photos with expiring links. When time is up, they poof. 
          No trace. No forever. Just moments that matter, for as long as you choose.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up stagger-3">
          <Button 
            asChild 
            size="lg" 
            className="bg-poof-accent hover:bg-poof-accent/90 text-white px-8 py-6 text-lg btn-press group"
          >
            <Link href="/signup">
              Start sharing free
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button 
            asChild 
            variant="ghost" 
            size="lg"
            className="text-poof-mist hover:text-white hover:bg-white/5 px-8 py-6 text-lg"
          >
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up stagger-4">
          <FeaturePill icon={<Clock className="w-4 h-4" />} text="Expiring links" />
          <FeaturePill icon={<Eye className="w-4 h-4" />} text="View limits" />
          <FeaturePill icon={<Lock className="w-4 h-4" />} text="Password protection" />
        </div>

        {/* Demo preview */}
        <div className="mt-20 animate-fade-up stagger-5">
          <div className="relative max-w-3xl mx-auto">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-poof-accent/20 via-poof-violet/20 to-poof-accent/20 rounded-2xl blur-2xl opacity-50" />
            
            {/* Browser frame */}
            <div className="relative rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              {/* Browser header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-xs mx-auto px-4 py-1.5 rounded-md bg-white/5 text-xs text-poof-mist font-mono">
                    poof.so/g/abc123
                  </div>
                </div>
              </div>
              
              {/* Content preview */}
              <div className="p-6 bg-gradient-to-b from-transparent to-poof-base/50">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
                    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400',
                  ].map((src, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg overflow-hidden bg-white/5"
                    >
                      <img
                        src={src}
                        alt={`Sample photo ${i + 1}`}
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Countdown badge */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-poof-peach/20 border border-poof-peach/30 text-poof-peach text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">Expires in 2d 14h 32m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-poof-mist">
      <span className="text-poof-violet">{icon}</span>
      {text}
    </div>
  )
}
