const scopeRows = [
  ['Read', 'Allows read-only endpoints for account resources.'],
  ['Write', 'Allows mutation endpoints (create/update/delete/revoke/confirm/fail).'],
  ['Agent-owned only', 'Restricts access to resources created by the same API key.'],
]

export default function DocsScopesPage() {
  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-poof-mist">Scopes</p>
        <h2 className="mt-2 font-heading text-4xl font-extrabold">Permissions and ownership</h2>
        <p className="mt-3 text-sm text-poof-mist">
          API keys can be constrained by capability and ownership. This lets users safely run automation without
          granting unrestricted account access.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">Permission toggles</h3>
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-poof-mist">
              <tr>
                <th className="px-4 py-3">Toggle</th>
                <th className="px-4 py-3">Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-sm">
              {scopeRows.map(([scope, behavior]) => (
                <tr key={scope}>
                  <td className="px-4 py-3 font-medium text-white">{scope}</td>
                  <td className="px-4 py-3 text-poof-mist">{behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">Agent-owned-only enforcement</h3>
        <ul className="mt-4 space-y-3 text-sm text-poof-mist">
          <li>Resources created via API key are tagged with that key identifier.</li>
          <li>Restricted keys cannot view or mutate resources created by another key or by direct user sessions.</li>
          <li>If a gallery contains mixed ownership, restricted keys cannot perform destructive cross-owner actions.</li>
        </ul>
      </section>
    </>
  )
}
