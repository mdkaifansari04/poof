import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Poof account.',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect('/dashboard')
  }

  return <LoginForm />
}
