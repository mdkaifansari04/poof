"use client";

import Link from "next/link";
import { useState } from "react";

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
- Next optional step`;

export default function DocsQuickStartPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Quick Start
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-poof-mist">
          Connect an agent to Poof in one prompt. This mirrors the starter pack.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-medium text-white">1. Create an API key</h2>
        <p className="mt-2 text-sm leading-relaxed text-poof-mist">
          Open{" "}
          <Link
            href="/settings"
            className="font-medium text-poof-violet hover:underline"
          >
            Settings
          </Link>{" "}
          and create an Agent API key. Copy it immediately &mdash; the raw
          secret is shown only once.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-white">
          2. Paste this into your agent
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-poof-mist">
          Replace the API key placeholder, then send this as a single prompt to
          your agent runtime.
        </p>
      <PromptBlock prompt={starterPrompt} />
    </section>

      <section>
        <h2 className="text-lg font-medium text-white">
          3. Optional plain file
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-poof-mist">
          The same starter content is available as a raw markdown file at{" "}
          <Link
            href="/starter.md"
            className="font-medium text-poof-violet hover:underline"
          >
            /starter.md
          </Link>
          .
        </p>
      </section>
    </div>
  );
}

function PromptBlock({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative mt-4 rounded-lg border border-white/6 bg-white/2">
      {/* Copy button */}
      <button
        onClick={copy}
        className="absolute top-3 right-3 z-10 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-poof-mist backdrop-blur-sm transition hover:border-white/20 hover:text-white"
      >
        {copied ? "Copied" : "Copy"}
      </button>

      {/* Scrollable content with fade edges */}
      <div className="relative max-h-140 overflow-auto">
        {/* Top fade */}
        <div className="pointer-events-none sticky top-0 z-1 h-8 bg-linear-to-b from-[#0d0d0d] to-transparent" />

        <pre className="px-4 pb-4 font-mono text-xs leading-relaxed text-poof-mist whitespace-pre-wrap">
          {prompt}
        </pre>

        {/* Bottom fade */}
        <div className="pointer-events-none sticky bottom-0 z-1 h-8 bg-linear-to-t from-[#0d0d0d] to-transparent" />
      </div>
    </div>
  );
}
