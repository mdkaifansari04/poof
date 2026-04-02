export default function DocsAuthenticationPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Authentication</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-poof-mist">
          Poof supports cookie-backed browser sessions for the web app and long-lived API keys
          for first-party automation.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-medium text-white">Session auth</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-poof-mist">
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Used by browser users through Better Auth session cookies.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Protected app routes resolve the session server-side before rendering.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Normal user actions run with full account privileges.</li>
        </ul>
      </section>

      <hr className="border-white/6" />

      <section>
        <h2 className="text-lg font-medium text-white">API-key auth</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-poof-mist">
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Created and revoked in Settings by signed-in users.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Send key via <code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">Authorization: Bearer &lt;key&gt;</code> or <code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">X-API-Key</code>.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Keys support read/write toggles and optional agent-owned-only isolation.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Revoking a key blocks future requests immediately.</li>
        </ul>
      </section>
    </div>
  )
}
