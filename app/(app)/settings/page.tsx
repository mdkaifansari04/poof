import Link from 'next/link'
import { headers } from 'next/headers'
import { GlassCard } from '@/components/poof/glass-card'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { ExternalLink, ShieldCheck, UserRound } from 'lucide-react'

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = (session as { user?: { name?: string | null; email?: string | null } } | null)?.user
  const displayName = user?.name ?? 'Poof user'
  const email = user?.email ?? 'No email available'

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading font-extrabold text-3xl text-white">Settings</h1>
        <p className="text-poof-mist mt-1">Minimal account settings for now. We will expand this soon.</p>
      </div>

      <GlassCard className="p-5" hover={false}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-poof-violet/20 text-poof-violet">
            <UserRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-white">Account</h2>
            <p className="text-poof-mist text-sm mt-1">Signed in as:</p>
            <p className="text-white mt-2">{displayName}</p>
            <p className="text-poof-mist text-sm">{email}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5" hover={false}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-poof-mint/20 text-poof-mint">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-white">Privacy & legal</h2>
            <p className="text-poof-mist text-sm">
              Review legal and privacy docs, or contact support at{' '}
              <a href="mailto:poof-support@k04.tech" className="text-poof-violet hover:underline">
                poof-support@k04.tech
              </a>{' '}
              and{' '}
              <a href="mailto:hello-poof@k04.tech" className="text-poof-violet hover:underline">
                hello-poof@k04.tech
              </a>
              .
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
              >
                <Link href="/terms">
                  Terms of Service
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
              >
                <Link href="/privacy">
                  Privacy Policy
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5" hover={false}>
        <h2 className="font-heading font-bold text-xl text-white">Coming next</h2>
        <ul className="mt-3 space-y-2 text-sm text-poof-mist">
          <li>Password change and reset from settings</li>
          <li>Session management and device logout</li>
          <li>Account deletion and data export actions</li>
          <li>Notification preferences</li>
        </ul>
      </GlassCard>
    </div>
  )
}
