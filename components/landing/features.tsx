'use client'

import { GlassCard } from '@/components/poof/glass-card'
import { 
  Clock, 
  Image, 
  Images, 
  Link2,
  ShieldCheck, 
  Zap,
  ImageIcon
} from 'lucide-react'

const features = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Expiring Links',
    description: 'Set a precise expiry timestamp. Once it expires, the shared URL returns an expired state.',
    color: 'text-poof-peach',
    bgColor: 'bg-poof-peach/10',
  },
  {
    icon: <Images className="w-6 h-6" />,
    title: 'Share Full Galleries',
    description: 'Generate links for an entire gallery and let recipients browse the full photo set.',
    color: 'text-poof-mint',
    bgColor: 'bg-poof-mint/10',
  },
  {
    icon: <Image className="w-6 h-6" />,
    title: 'Single Image Sharing',
    description: 'Create a dedicated share link for one image when you only need to send one asset.',
    color: 'text-poof-violet',
    bgColor: 'bg-poof-violet/10',
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: 'Multi-Image Links',
    description: 'Select a custom subset of images and generate one link to share only those files.',
    color: 'text-poof-accent',
    bgColor: 'bg-poof-accent/10',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Protected Ownership Checks',
    description: 'Server-side validation ensures links can be created only for content you own.',
    color: 'text-poof-mint',
    bgColor: 'bg-poof-mint/10',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Revoke',
    description: 'Changed your mind? Kill any link instantly. Gone in one click.',
    color: 'text-poof-peach',
    bgColor: 'bg-poof-peach/10',
  },
]

const quickFeatures = [
  { icon: <ImageIcon className="w-5 h-5" />, text: 'Up to 3 galleries per account' },
  { icon: <Link2 className="w-5 h-5" />, text: 'Multiple independent links per gallery' },
  { icon: <ShieldCheck className="w-5 h-5" />, text: 'Auth sessions with secure cookies' },
]

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Built for privacy.{' '}
            <span className="text-poof-violet">Designed for control.</span>
          </h2>
          <p className="text-lg text-poof-mist max-w-2xl mx-auto">
            Every feature exists to give you complete control over what you share, 
            how long it stays available, and when it gets revoked.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, i) => (
            <GlassCard
              key={feature.title}
              className="p-6 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} ${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-poof-mist text-sm leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Quick features bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-white/10">
          {quickFeatures.map((feature) => (
            <div
              key={feature.text}
              className="flex items-center gap-2 text-poof-mist"
            >
              <span className="text-poof-violet">{feature.icon}</span>
              <span className="text-sm">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
