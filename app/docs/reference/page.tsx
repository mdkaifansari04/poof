const referenceRows = [
  ['GET', '/api/v1/agent-api-keys', 'List API keys (session auth only)'],
  ['POST', '/api/v1/agent-api-keys', 'Create API key with permission toggles'],
  ['PATCH', '/api/v1/agent-api-keys/{keyId}', 'Update key name/permissions'],
  ['DELETE', '/api/v1/agent-api-keys/{keyId}', 'Revoke key'],
  ['GET', '/api/v1/galleries', 'List galleries'],
  ['POST', '/api/v1/galleries', 'Create gallery'],
  ['GET', '/api/v1/galleries/{id}', 'Get gallery details'],
  ['PATCH', '/api/v1/galleries/{id}', 'Update gallery metadata'],
  ['DELETE', '/api/v1/galleries/{id}', 'Soft-delete gallery'],
  ['POST', '/api/v1/upload/presign', 'Generate image upload URL'],
  ['POST', '/api/v1/galleries/{id}/banner/presign', 'Generate banner upload URL'],
  ['POST', '/api/v1/images/{imageId}/confirm', 'Confirm upload success'],
  ['POST', '/api/v1/images/{imageId}/fail', 'Mark upload failed'],
  ['DELETE', '/api/v1/images/{imageId}', 'Soft-delete image'],
  ['GET', '/api/v1/shared-resources', 'List share links'],
  ['POST', '/api/v1/shared-resources', 'Create share link'],
  ['GET', '/api/v1/shared-resources/{resourceId}', 'Resolve public share payload'],
  ['PATCH', '/api/v1/shared-resources/{resourceId}', 'Update expiry/reactivate'],
  ['DELETE', '/api/v1/shared-resources/{resourceId}', 'Delete share link'],
  ['POST', '/api/v1/shared-resources/{resourceId}/revoke', 'Revoke share link'],
]

export default function DocsReferencePage() {
  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-poof-mist">Reference</p>
        <h2 className="mt-2 font-heading text-4xl font-extrabold">API v1 endpoint map</h2>
        <p className="mt-3 text-sm text-poof-mist">
          Primary integration surface for automation clients. Use OpenAPI for machine-readable contracts and this page
          for a high-level route index.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-poof-mist">
            <tr>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm">
            {referenceRows.map(([method, path, purpose]) => (
              <tr key={`${method}-${path}`}>
                <td className="px-4 py-3 font-mono text-poof-violet">{method}</td>
                <td className="px-4 py-3 font-mono text-white">{path}</td>
                <td className="px-4 py-3 text-poof-mist">{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
