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
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">API Reference</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-poof-mist">
          Endpoint map for <code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">/api/v1</code>. See the{' '}
          <a href="/api/v1/openapi" className="font-medium text-poof-violet hover:underline">OpenAPI spec</a>{' '}
          for machine-readable contracts.
        </p>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/6 text-xs text-poof-mist/60">
              <th className="pb-2 pr-4 font-medium">Method</th>
              <th className="pb-2 pr-4 font-medium">Path</th>
              <th className="pb-2 font-medium">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {referenceRows.map(([method, path, purpose]) => (
              <tr key={`${method}-${path}`} className="group">
                <td className="py-2.5 pr-4 font-mono text-xs text-poof-violet">{method}</td>
                <td className="py-2.5 pr-4 font-mono text-xs text-white/80">{path}</td>
                <td className="py-2.5 text-poof-mist">{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
