export default function DocsAuthenticationPage() {
  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-poof-mist">Authentication</p>
        <h2 className="mt-2 font-heading text-4xl font-extrabold">Auth models</h2>
        <p className="mt-3 text-sm text-poof-mist">
          Poof supports cookie-backed browser sessions for the web app and long-lived API keys for first-party
          automation. API routes can accept either mode depending on endpoint requirements.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">Session auth</h3>
        <ul className="mt-4 space-y-3 text-sm text-poof-mist">
          <li>Used by browser users through Better Auth session cookies.</li>
          <li>Protected app routes resolve the session server-side before rendering.</li>
          <li>Normal user actions always run with full account privileges.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">API-key auth</h3>
        <ul className="mt-4 space-y-3 text-sm text-poof-mist">
          <li>Created and revoked in Settings by signed-in users.</li>
          <li>Send key via `Authorization: Bearer &lt;key&gt;` or `X-API-Key`.</li>
          <li>Keys support read/write toggles and optional agent-owned-only isolation.</li>
          <li>Revoking a key blocks future requests immediately.</li>
        </ul>
      </section>
    </>
  )
}
