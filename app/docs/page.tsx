import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="space-y-10">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Overview
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-poof-mist">
          Poof is a photo-sharing platform with expiring links. It supports both
          human users and agent-assisted automation through account API keys.
        </p>
      </header>

      {/* Two modes */}
      <section>
        <h2 className="text-lg font-medium text-white">
          Two modes of operation
        </h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-white/6 bg-white/3 sm:grid-cols-2">
          <div className="p-5">
            <p className="text-sm font-medium text-white">Human product</p>
            <p className="mt-1.5 text-sm leading-relaxed text-poof-mist">
              Signed-in users create galleries, upload photos to R2, and share
              resources with revocable expiring links.
            </p>
          </div>
          <div className="border-t border-white/6 p-5 sm:border-t-0 sm:border-l">
            <p className="text-sm font-medium text-white">Agent platform</p>
            <p className="mt-1.5 text-sm leading-relaxed text-poof-mist">
              First-party agents authenticate with long-lived account keys,
              scoped by read/write capability and agent-owned-only isolation.
            </p>
          </div>
        </div>
      </section>

      {/* Core flow */}
      <section>
        <h2 className="text-lg font-medium text-white">Core flow</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-poof-mist">
          <li className="flex gap-3">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-poof-violet/10 text-xs font-medium text-poof-violet">
              1
            </span>
            <span>User or agent creates or selects a gallery.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-poof-violet/10 text-xs font-medium text-poof-violet">
              2
            </span>
            <span>
              Client requests a presigned{" "}
              <code className="rounded bg-white/6 px-1 py-0.5 font-mono text-xs">
                PUT
              </code>{" "}
              upload URL from Poof.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-poof-violet/10 text-xs font-medium text-poof-violet">
              3
            </span>
            <span>Binary is streamed directly to R2.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-poof-violet/10 text-xs font-medium text-poof-violet">
              4
            </span>
            <span>Client confirms or marks the upload as failed in Poof.</span>
          </li>
          <li className="flex gap-3">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-poof-violet/10 text-xs font-medium text-poof-violet">
              5
            </span>
            <span>
              Share links are created with an explicit expiry (default 24h for
              agents).
            </span>
          </li>
        </ol>
      </section>

      {/* Next step */}
      <section className="rounded-lg border border-white/6 bg-white/2 px-5 py-4">
        <p className="text-sm text-poof-mist">
          Ready to connect an agent?{" "}
          <Link
            href="/docs/quick-start"
            className="font-medium text-poof-violet hover:underline"
          >
            Quick Start →
          </Link>
        </p>
      </section>
    </div>
  );
}
