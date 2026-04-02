const scopeRows = [
  ["Read", "Allows read-only endpoints for account resources."],
  [
    "Write",
    "Allows mutation endpoints (create, update, delete, revoke, confirm, fail).",
  ],
  [
    "Agent-owned only",
    "Restricts access to resources created by the same API key.",
  ],
];

export default function DocsScopesPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Scopes & Ownership
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-poof-mist">
          API keys can be constrained by capability and ownership, letting users
          run automation without granting unrestricted account access.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-medium text-white">Permission toggles</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-xs text-poof-mist/60">
                <th className="pb-2 pr-6 font-medium">Toggle</th>
                <th className="pb-2 font-medium">Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {scopeRows.map(([scope, behavior]) => (
                <tr key={scope}>
                  <td className="py-2.5 pr-6 font-medium text-white">
                    {scope}
                  </td>
                  <td className="py-2.5 text-poof-mist">{behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="border-white/6" />

      <section>
        <h2 className="text-lg font-medium text-white">
          Agent-owned-only enforcement
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-poof-mist">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />
            Resources created via API key are tagged with that key identifier.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />
            Restricted keys cannot view or mutate resources created by another
            key or by direct user sessions.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />
            Mixed-ownership galleries prevent destructive cross-owner actions
            from restricted keys.
          </li>
        </ul>
      </section>
    </div>
  );
}
