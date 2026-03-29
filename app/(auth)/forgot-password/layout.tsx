import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Poof account password.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
