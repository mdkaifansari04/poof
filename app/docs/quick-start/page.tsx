import Link from 'next/link'

const starterPrompt = `You are my Poof automation assistant.

Set up and use a skill named "poof" for all Poof actions.

Configuration:
- POOF_BASE_URL=https://poof.k04.tech
- POOF_API_KEY={{POOF_API_KEY}}
- API base path: /api/v1
- Auth header: Authorization: Bearer <POOF_API_KEY>
- Fallback auth header: X-API-Key: <POOF_API_KEY>
- OpenAPI URL: https://poof.k04.tech/api/v1/openapi
- LLM metadata URL: https://poof.k04.tech/llms.txt

Skill bootstrapping:
- If your runtime supports OpenAPI tools/connectors, import:
  https://poof.k04.tech/api/v1/openapi
  and optionally read:
  https://poof.k04.tech/llms.txt
  and register it as tool/skill name: poof.
- If OpenAPI import is unavailable, call HTTP endpoints directly using the same auth headers.

Capabilities to support:
1) Galleries
- List: GET /api/v1/galleries
- Create: POST /api/v1/galleries
- Read: GET /api/v1/galleries/{id}
- Update: PATCH /api/v1/galleries/{id}
- Delete: DELETE /api/v1/galleries/{id}

2) Upload images to a gallery
- Presign: POST /api/v1/upload/presign with:
  { fileName, mimeType, fileSize, galleryId }
- Upload binary: PUT to returned presignedUrl (raw bytes, correct Content-Type)
- Confirm: POST /api/v1/images/{imageId}/confirm
- If upload fails: POST /api/v1/images/{imageId}/fail

3) Upload gallery banner
- Presign: POST /api/v1/galleries/{id}/banner/presign
- Upload binary: PUT to returned presignedUrl
- Patch gallery banner fields using PATCH /api/v1/galleries/{id}

4) Share links
- List: GET /api/v1/shared-resources
- Create: POST /api/v1/shared-resources
- Revoke: POST /api/v1/shared-resources/{resourceId}/revoke
- Update expiry/reactivate: PATCH /api/v1/shared-resources/{resourceId}
- Delete link: DELETE /api/v1/shared-resources/{resourceId}

Required behavior rules:
- Do NOT create share links unless user explicitly asks to share.
- If user says only "upload", only upload and stop.
- If user says "upload and share" but gives no expiry, default expiry = 24 hours from now.
- If user gives time like 12h / 24h / 48h, use that duration.
- If gallery target is unclear, ask a clarifying question before mutating.
- For multiple files, return per-file status (success/fail + reason).
- Be concise and action-first in responses.

Error handling rules:
- If API returns 401: tell user the key is invalid/revoked.
- If API returns 403: tell user key permissions likely block this action (read/write or ownership scope).
- If API returns 422: show exactly which input field is invalid and ask for corrected input.

Output format after every action:
- Action performed
- Resource IDs touched
- Share URL (only when sharing was explicitly requested)
- Next optional step`

export default function DocsQuickStartPage() {
  return (
    <>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-poof-mist">Quick Start</p>
        <h2 className="mt-2 font-heading text-4xl font-extrabold">Connect an agent in one prompt</h2>
        <p className="mt-3 text-sm text-poof-mist">
          This section mirrors the starter pack and keeps the full onboarding flow inside docs.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">1. Create API key</h3>
        <p className="mt-3 text-sm text-poof-mist">
          Open{' '}
          <Link href="/settings" className="text-poof-violet hover:underline">
            Settings
          </Link>{' '}
          and create an Agent API key. Copy it immediately because the raw secret is shown once.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">2. Paste this into your agent</h3>
        <p className="mt-3 text-sm text-poof-mist">
          Replace only the API key placeholder, then send this as a single prompt to your agent runtime.
        </p>
        <pre className="mt-4 max-h-[560px] overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-5 text-poof-mist whitespace-pre-wrap">
          {starterPrompt}
        </pre>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-6">
        <h3 className="font-heading text-2xl font-bold">3. Optional plain file</h3>
        <p className="mt-3 text-sm text-poof-mist">
          The same starter content is also available as a raw markdown file at{' '}
          <Link href="/starter.md" className="text-poof-violet hover:underline">
            /starter.md
          </Link>
          .
        </p>
      </section>
    </>
  )
}
