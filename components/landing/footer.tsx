import Link from 'next/link'
import { Logo } from '@/components/poof/logo'
import { Mail } from 'lucide-react'

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Limits', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  company: [
    { label: 'Sign in', href: '/signin' },
    { label: 'Create account', href: '/signup' },
    { label: 'Contact', href: 'mailto:hello@poof.app' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const socialLinks = [
  { icon: <Mail className="w-5 h-5" />, href: 'mailto:hello@poof.app', label: 'Email' },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-poof-base">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Logo size="md" className="mb-4" />
            <p className="text-poof-mist text-sm max-w-xs leading-relaxed mb-6">
              Share photos with expiring links. When time is up, access ends.
              Your original content stays in your account until you delete it.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-poof-mist hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-poof-mist hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('mailto:') ? (
                    <a href={link.href} className="text-poof-mist hover:text-white text-sm transition-colors">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-poof-mist hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-heading font-bold text-white text-sm mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-poof-mist hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-poof-mist text-sm">
            &copy; {new Date().getFullYear()} Poof. All rights reserved.
          </p>
          <p className="text-poof-mist/60 text-xs">
            Made with care for your privacy.
          </p>
        </div>
      </div>
    </footer>
  )
}
