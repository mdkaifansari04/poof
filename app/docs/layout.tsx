import Link from 'next/link'
import { DocsSidebar } from '@/components/docs/docs-sidebar'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-poof-base text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-sm text-poof-mist">Poof docs hub</p>
          <div className="flex items-center gap-3 text-xs text-poof-mist">
            <Link href="/llms.txt" className="hover:text-white">
              llms.txt
            </Link>
            <Link href="/api/v1/openapi" className="hover:text-white">
              OpenAPI
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <DocsSidebar />
          </aside>
          <section className="space-y-6">{children}</section>
        </div>
      </div>
    </main>
  )
}
