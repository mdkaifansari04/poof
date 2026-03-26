import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/poof/logo'
import { AnimatedBackground } from '@/components/poof/animated-background'
import { GlassCard } from '@/components/poof/glass-card'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the Poof terms of service for account rules, acceptable use, expiring links, and termination policies.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Poof Terms of Service',
    description: 'The legal terms that govern using Poof photo sharing.',
    url: '/terms',
    type: 'article',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-poof-base p-4 sm:p-6 lg:p-8">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <Link href="/signin" className="text-sm text-poof-violet hover:underline">
            Back to sign in
          </Link>
        </div>

        <GlassCard className="p-6 sm:p-8" hover={false}>
          <article className="space-y-6 text-sm leading-relaxed text-poof-mist">
            <header className="space-y-2">
              <h1 className="font-heading text-3xl font-extrabold text-white">Terms of Service</h1>
              <p><strong>Poof</strong> · Last updated: March 2026</p>
            </header>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">1. Who We Are</h2>
              <p>
                Poof is a photo-sharing platform that lets you create galleries, generate expiring share links, and
                share content with others. When a link expires, the content becomes inaccessible.
              </p>
              <p>By using Poof, you agree to these terms. If you do not agree, please do not use the service.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">2. Your Account</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>You must be at least 13 years old to use Poof.</li>
                <li>You are responsible for keeping your account credentials secure.</li>
                <li>You are responsible for everything that happens under your account.</li>
                <li>One person, one account. Do not share accounts.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">3. What You Can Upload</h2>
              <p>You can upload photos you own or have rights to share. You cannot upload:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Content that sexualizes minors in any way</li>
                <li>Content that promotes violence, hate, or discrimination</li>
                <li>Content that infringes on someone else&apos;s copyright or intellectual property</li>
                <li>Malicious files, spam, or anything designed to harm others</li>
                <li>Content that is illegal in your jurisdiction</li>
              </ul>
              <p>
                We do not actively moderate uploaded content, but we will remove content and terminate accounts if
                violations are reported and confirmed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">4. Your Content</h2>
              <p>You own your photos. We do not claim ownership over content you upload to Poof.</p>
              <p>
                By uploading, you grant us a limited license to store and serve your content only as needed to operate
                the service. We do not sell your photos, use them for advertising, or share them beyond required
                infrastructure providers.
              </p>
              <p>
                When you delete a gallery or image, it is soft-deleted immediately and permanently removed from storage
                within 24 hours.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">5. Expiring Links</h2>
              <p>Expiring share links are a core feature of Poof. Once a link expires:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>The link becomes inaccessible</li>
                <li>We do not guarantee timing precision beyond minute-level granularity</li>
                <li>We are not responsible for content accessed before expiry</li>
                <li>We do not restore expired links under any circumstance</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">6. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Attempt to bypass, hack, or exploit any part of the platform</li>
                <li>Scrape, crawl, or extract data from Poof at scale</li>
                <li>Use Poof to distribute malware or phishing content</li>
                <li>Impersonate Poof or our team</li>
                <li>Attempt to access other users&apos; content without authorization</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">7. Service Availability</h2>
              <p>
                We do our best to keep Poof reliable, but we do not guarantee 100% uptime. The service is provided
                &quot;as is&quot; and we are not liable for data loss, missed access to shared links, or damages from use.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">8. Termination</h2>
              <p>
                You can delete your account at any time from account settings. All content is permanently deleted
                within 24 hours of account deletion.
              </p>
              <p>
                We may suspend or terminate your account at any time if you violate these terms, with or without
                notice.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">9. Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. We will update the &quot;Last updated&quot; date above. Continued
                use of Poof after changes means you accept the updated terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">10. Contact</h2>
              <p>
                Questions about these terms? Reach us at <a href="mailto:legal@poof.app" className="text-poof-violet hover:underline">legal@poof.app</a>
              </p>
            </section>
          </article>
        </GlassCard>
      </div>
    </div>
  )
}
