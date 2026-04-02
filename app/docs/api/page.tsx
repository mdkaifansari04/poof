const apiSections = [
  {
    title: 'Authentication',
    body: 'Create a long-lived API key from Settings → Agent API keys. Send it as `Authorization: Bearer <key>` or `X-API-Key: <key>` on Poof API requests.',
  },
  {
    title: 'Supported account actions',
    body: 'Agent-authenticated clients can call the same gallery, image, upload-presign, banner-presign, and shared-resource endpoints that the web app uses today.',
  },
  {
    title: 'Upload flow',
    body: 'Poof returns a short-lived presigned R2 `PUT` URL. The agent uploads binary data directly to R2, then calls the confirm or fail endpoint so Poof can finalize state.',
  },
  {
    title: 'Share link defaults',
    body: 'If an agent creates a share link without a user-specified expiry, clients should default to a 24 hour expiry in their own UX before calling Poof.',
  },
]

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-poof-base px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-poof-mist">Poof API</p>
          <h1 className="font-heading text-4xl font-extrabold">API overview</h1>
          <p className="text-sm text-poof-mist">
            Poof exposes authenticated JSON endpoints for gallery CRUD, direct-to-R2 uploads, and expiring share
            links. The current external surface is the same as the app surface and is intended for first-party
            agents.
          </p>
        </div>

        <div className="space-y-4">
          {apiSections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="font-heading text-2xl font-bold">{section.title}</h2>
              <p className="mt-3 text-sm text-poof-mist">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
