export default function ApiDocsPage() {
  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-poof-mist">API</p>
        <h2 className="mt-2 font-heading text-4xl font-extrabold">API overview</h2>
        <p className="mt-3 text-sm text-poof-mist">
          Use `/api/v1` for stable integrations. The API supports account-scoped actions for galleries, uploads, and
          share links while preserving the same core business rules used by the Poof web app.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">Request conventions</h3>
        <ul className="mt-4 space-y-3 text-sm text-poof-mist">
          <li>Use JSON requests/responses for all application endpoints.</li>
          <li>Authenticate with `Authorization: Bearer &lt;key&gt;` or `X-API-Key: &lt;key&gt;`.</li>
          <li>Read and write capability is enforced per API key.</li>
          <li>`agentResourcesOnly` keys can only access resources they created.</li>
          <li>Upload binaries via presigned R2 `PUT` URLs, then call confirm/fail endpoints.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">Lifecycle guarantees</h3>
        <ul className="mt-4 space-y-3 text-sm text-poof-mist">
          <li>Share links can be active, revoked, or expired.</li>
          <li>Expired/revoked public resources return a terminal HTTP 410 semantic path.</li>
          <li>Cleanup cron routes mark stale pending uploads and remove aged soft-deleted storage records.</li>
          <li>Deleting API keys revokes future access but does not delete existing account resources.</li>
        </ul>
      </section>
    </>
  )
}
