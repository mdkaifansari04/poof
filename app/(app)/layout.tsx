import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app/sidebar'
import { AppHeader } from '@/components/app/header'
import { AppMobileNav } from '@/components/app/mobile-nav'
import { auth } from '@/lib/auth'

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

  return (
    <div className="min-h-screen bg-poof-base">
      {/* Desktop sidebar */}
      <AppSidebar />
      
      {/* Main content area */}
      <div className="lg:pl-64">
        <AppHeader />
        <main className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      
      {/* Mobile bottom nav */}
      <AppMobileNav />
    </div>
  )
}
