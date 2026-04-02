import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/shared/sidebar'
import { AppHeader } from '@/components/shared/header'
import { AppMobileNav } from '@/components/shared/mobile-nav'
import { auth } from '@/lib/auth'

type AppSessionUser = {
  email: string | null
  name: string | null
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/signin')
  }

  const user: AppSessionUser = {
    name: (session as { user?: { name?: string | null } } | null)?.user?.name ?? null,
    email: (session as { user?: { email?: string | null } } | null)?.user?.email ?? null,
  }

  return (
    <div className="min-h-screen bg-poof-base">
      {/* Desktop sidebar */}
      <AppSidebar user={user} />
      
      {/* Main content area */}
      <div className="lg:pl-64">
        <AppHeader user={user} />
        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      
      {/* Mobile bottom nav */}
      <AppMobileNav />
    </div>
  )
}
