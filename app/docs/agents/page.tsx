export default function AgentDocsPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Agent Guide</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-poof-mist">
          Poof agents are first-party clients operating on behalf of a signed-in user. Keep
          actions explicit and narrow: upload, organize, and share only when asked.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-medium text-white">Operating rules</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-poof-mist">
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Agents act as first-party clients once a user provides a Poof API key.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Upload binaries by requesting a presigned URL then streaming bytes directly to R2.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Do not create a share link unless the user explicitly asks to share.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Default to 24-hour expiry if the user asks to share but gives no duration.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Deleting an API key stops future access but does not remove existing resources.</li>
        </ul>
      </section>

      <hr className="border-white/6" />

      <section>
        <h2 className="text-lg font-medium text-white">Recommended prompt behavior</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-poof-mist">
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Ask clarifying questions when gallery target or sharing intent is ambiguous.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Use batch-safe upload handling and report per-file outcomes on partial failures.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-poof-mist/40" />Never infer permission to share unless the user explicitly requests a share link.</li>
        </ul>
      </section>
    </div>
  )
}
