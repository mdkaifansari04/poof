'use client'

import { GlassCard } from '@/components/poof/glass-card'
import { 
  Clock, 
  Eye, 
  Lock, 
  Download, 
  BarChart3, 
  Zap,
  ImageIcon,
  Link2,
  Shield
} from 'lucide-react'

const features = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Expiring Links',
    description: 'Set precise expiration times. Hours, days, or custom dates. When time is up, the link dies.',
    color: 'text-poof-peach',
    bgColor: 'bg-poof-peach/10',
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: 'View Limits',
    description: 'Limit how many times a link can be viewed. After the limit hits, poof.',
    color: 'text-poof-mint',
    bgColor: 'bg-poof-mint/10',
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Password Protection',
    description: 'Add an extra layer with password-protected links. Only those who know get in.',
    color: 'text-poof-violet',
    bgColor: 'bg-poof-violet/10',
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'Download Control',
    description: 'Choose whether recipients can download your photos or just view them.',
    color: 'text-poof-accent',
    bgColor: 'bg-poof-accent/10',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Link Analytics',
    description: 'Track views, unique visitors, and engagement. Know exactly who is looking.',
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
  { icon: <ImageIcon className="w-5 h-5" />, text: 'Unlimited galleries' },
  { icon: <Link2 className="w-5 h-5" />, text: 'Multiple links per gallery' },
  { icon: <Shield className="w-5 h-5" />, text: 'End-to-end encryption' },
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
            who sees it, and for how long.
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
