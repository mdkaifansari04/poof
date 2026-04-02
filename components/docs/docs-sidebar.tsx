'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { docsNav } from '@/app/docs/_nav'
import { cn } from '@/lib/utils'

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-poof-mist">Poof docs</p>
        <h1 className="mt-2 font-heading text-xl font-bold text-white">Automation & API</h1>
      </div>

      {docsNav.map((section) => (
        <section key={section.title} className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.14em] text-poof-mist">{section.title}</p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = !item.external && pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                  className={cn(
                    'block rounded-xl border px-3 py-2 transition',
                    isActive
                      ? 'border-poof-violet/40 bg-poof-violet/15 text-white'
                      : 'border-white/10 bg-white/5 text-poof-mist hover:border-white/20 hover:text-white',
                  )}
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs opacity-80">{item.description}</p>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
