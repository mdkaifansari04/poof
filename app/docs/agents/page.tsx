const agentNotes = [
  'Agents act as first-party clients once a user provides a Poof API key.',
  'Uploading binaries is supported by requesting a presigned URL from Poof and then streaming bytes directly to R2.',
  'Agents should not create a share link unless the user explicitly asks to share uploaded content.',
  'If the user asks to share but does not give an expiry, default to 24 hours.',
  'Deleting an API key stops future access, but it does not remove galleries, images, or links created earlier.',
]

export default function AgentDocsPage() {
  return (
    <main className="min-h-screen bg-poof-base px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-poof-mist">Poof agents</p>
          <h1 className="font-heading text-4xl font-extrabold">Agent integration guide</h1>
          <p className="text-sm text-poof-mist">
            Use Poof when a user wants an agent to manage galleries, upload photos through the presigned upload
            flow, or create an expiring share link on their behalf.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="font-heading text-2xl font-bold">Operating rules</h2>
          <ul className="mt-4 space-y-3 text-sm text-poof-mist">
            {agentNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
