'use client'

import { Upload, Link2, Timer, Ghost } from 'lucide-react'

const steps = [
  {
    icon: <Upload className="w-8 h-8" />,
    number: '01',
    title: 'Upload your photos',
    description: 'Drag, drop, done. Create galleries in seconds. Organize however you want.',
  },
  {
    icon: <Link2 className="w-8 h-8" />,
    number: '02',
    title: 'Generate a share link',
    description: 'Choose gallery, single image, or a custom image selection. Set expiry and create the link.',
  },
  {
    icon: <Timer className="w-8 h-8" />,
    number: '03',
    title: 'Share with anyone',
    description: 'Recipients can open the URL without an account while your ownership rules remain enforced.',
  },
  {
    icon: <Ghost className="w-8 h-8" />,
    number: '04',
    title: 'Watch it poof',
    description: 'After expiry or revoke, the shared URL becomes inaccessible and shows an expired or revoked state.',
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent via-poof-accent/5 to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Simple as 1, 2, 3...{' '}
            <span className="text-poof-violet">poof.</span>
          </h2>
          <p className="text-lg text-poof-mist max-w-2xl mx-auto">
            No complicated setup. No learning curve. Just share and forget.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative text-center animate-fade-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Step circle */}
                <div className="relative inline-flex mb-6">
                  {/* Glow */}
                  <div className="absolute inset-0 bg-poof-accent/20 rounded-full blur-xl" />
                  
                  {/* Circle */}
                  <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-poof-violet">
                    {step.icon}
                  </div>
                  
                  {/* Number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-poof-accent text-white text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </div>
                </div>

                <h3 className="font-heading font-bold text-xl text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-poof-mist text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual demo */}
        <div className="mt-20">
          <div className="relative max-w-2xl mx-auto">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-poof-violet/10 via-poof-accent/10 to-poof-violet/10 rounded-2xl blur-2xl" />
            
            {/* URL demonstration */}
            <div className="relative rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="p-8 text-center">
                <p className="text-poof-mist text-sm mb-4">Your share link looks like this:</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {/* Gallery link */}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-poof-violet/10 border border-poof-violet/30">
                    <span className="text-poof-mist text-sm">poof.k04.tech/shared/clxabc123</span>
                  </div>
                  
                  <span className="text-poof-mist text-sm">or</span>
                  
                  {/* Photo link */}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-poof-peach/10 border border-poof-peach/30">
                    <span className="text-poof-mist text-sm">poof.k04.tech/shared/clxxyz789</span>
                  </div>
                </div>
                
                <p className="text-poof-mist/60 text-xs mt-4">
                  Same URL shape for gallery, single image, and multi-image links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
