import Link from 'next/link'

const sections = [
  {
    title: 'API',
    href: '/docs/api',
    description:
      'Authenticate agents with account API keys, manage galleries, request upload URLs, and create expiring share links.',
  },
  {
    title: 'Agents',
    href: '/docs/agents',
    description:
      'Operational guidance for first-party agents using Poof on behalf of an authenticated user.',
  },
]

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-poof-base px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl space-y-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-poof-mist">Poof docs</p>
          <h1 className="font-heading text-4xl font-extrabold">Consumer app with automation</h1>
          <p className="max-w-2xl text-sm text-poof-mist">
            Poof lets users manage private galleries, upload to Cloudflare R2 with presigned URLs, and create
            expiring share links. Agents can authenticate with user-generated API keys and operate on the same
            account resources.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
            >
              <p className="font-heading text-2xl font-bold">{section.title}</p>
              <p className="mt-3 text-sm text-poof-mist">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
