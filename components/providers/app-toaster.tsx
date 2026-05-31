'use client'

import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

export function AppToaster() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)')
    const sync = () => setIsMobile(media.matches)

    sync()
    media.addEventListener('change', sync)

    return () => media.removeEventListener('change', sync)
  }, [])

  return (
    <Toaster
      position={isMobile ? 'top-center' : 'bottom-right'}
      duration={3500}
      toastOptions={{
        style: {
          background: 'var(--card)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        },
      }}
    />
  )
}
