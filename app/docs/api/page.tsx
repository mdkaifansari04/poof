export default function ApiDocsPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">API Overview</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-poof-mist">
          Use <code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">/api/v1</code> for
          stable integrations. The API supports account-scoped actions for galleries, uploads, and
          share links.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-medium text-white">Request conventions</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-poof-mist">
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />JSON requests and responses for all application endpoints.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Authenticate with <code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">Authorization: Bearer &lt;key&gt;</code> or <code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">X-API-Key</code>.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Read and write capability is enforced per API key.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" /><code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">agentResourcesOnly</code> keys can only access resources they created.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Upload binaries via presigned R2 <code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">PUT</code> URLs, then call confirm/fail endpoints.</li>
        </ul>
      </section>

      <hr className="border-white/6" />

      <section>
        <h2 className="text-lg font-medium text-white">Lifecycle guarantees</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-poof-mist">
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Share links can be active, revoked, or expired.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Expired or revoked public resources return HTTP 410.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Cleanup cron marks stale pending uploads and removes aged soft-deleted records.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Deleting API keys revokes future access but does not delete existing resources.</li>
        </ul>
      </section>
    </div>
  )
}
