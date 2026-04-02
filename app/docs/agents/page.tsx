const agentNotes = [
  'Agents act as first-party clients once a user provides a Poof API key.',
  'Uploading binaries is supported by requesting a presigned URL from Poof and then streaming bytes directly to R2.',
  'Agents should not create a share link unless the user explicitly asks to share uploaded content.',
  'If the user asks to share but does not give an expiry, default to 24 hours.',
  'Deleting an API key stops future access, but it does not remove galleries, images, or links created earlier.',
]

export default function AgentDocsPage() {
  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-poof-mist">Agents</p>
        <h2 className="mt-2 font-heading text-4xl font-extrabold">Agent integration guide</h2>
        <p className="mt-3 text-sm text-poof-mist">
          Poof agents are first-party clients operating on behalf of a signed-in user. Keep actions explicit and
          narrow: upload, organize, and share only when the prompt asks for it.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">Operating rules</h3>
        <ul className="mt-4 space-y-3 text-sm text-poof-mist">
          {agentNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">Recommended prompt behavior</h3>
        <ul className="mt-4 space-y-3 text-sm text-poof-mist">
          <li>Ask clarifying questions when gallery target or sharing intent is ambiguous.</li>
          <li>Default share expiry to 24 hours if user asks to share but gives no duration.</li>
          <li>Use batch-safe upload handling and report per-file outcomes when partial failures occur.</li>
          <li>Do not infer permission to share unless user explicitly asks for a share link.</li>
        </ul>
      </section>
    </>
  )
}
