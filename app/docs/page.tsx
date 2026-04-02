export default function DocsPage() {
  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-poof-mist">Overview</p>
        <h2 className="mt-2 font-heading text-4xl font-extrabold">Poof: consumer app with automation</h2>
        <p className="mt-3 max-w-3xl text-sm text-poof-mist">
          Poof supports human-first gallery sharing and agent-assisted operations through account API keys. Agents
          can manage galleries, upload binaries through presigned URLs, and create expiring links under explicit
          user intent.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="font-heading text-2xl font-bold">Human product</h3>
          <p className="mt-2 text-sm text-poof-mist">
            Signed-in users create galleries, upload photos to R2, and share resources using revocable expiring links.
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="font-heading text-2xl font-bold">Agent platform</h3>
          <p className="mt-2 text-sm text-poof-mist">
            First-party agents authenticate with long-lived account keys and can be scoped by read/write capability and
            agent-owned-only isolation.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">Core flows</h3>
        <ol className="mt-4 space-y-3 text-sm text-poof-mist">
          <li>1. User or agent creates/selects a gallery.</li>
          <li>2. Client requests a presigned `PUT` upload URL from Poof.</li>
          <li>3. Binary is streamed directly to R2.</li>
          <li>4. Client confirms or fails the upload state in Poof.</li>
          <li>5. Share links are created with explicit expiry policy (default 24h in agent UX).</li>
        </ol>
      </section>
    </>
  )
}
