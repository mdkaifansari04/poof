import Link from "next/link";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-poof-base text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-white/6 py-4">
          <Link
            href="/docs"
            className="text-sm font-medium tracking-tight text-white"
          >
            Poof <span className="text-poof-mist">Docs</span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-poof-mist">
            <Link href="/llms.txt" className="transition hover:text-white">
              llms.txt
            </Link>
            <Link
              href="/api/v1/openapi"
              className="transition hover:text-white"
            >
              OpenAPI
            </Link>
          </div>
        </header>

        <div className="grid gap-10 pt-8 pb-16 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-8">
              <DocsSidebar />
            </nav>
          </aside>
          <article className="min-w-0 max-w-3xl">{children}</article>
        </div>
      </div>
    </main>
  );
}
