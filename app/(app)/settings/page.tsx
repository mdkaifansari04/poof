import Link from "next/link";
import { headers } from "next/headers";
import { AgentApiKeysCard } from "@/components/settings/agent-api-keys-card";
import { auth } from "@/lib/auth";
import { ExternalLink } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = (
    session as { user?: { name?: string | null; email?: string | null } } | null
  )?.user;
  const displayName = user?.name ?? "Poof user";
  const email = user?.email ?? "No email available";

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-2 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-poof-mist">
          Manage your account, API keys, and preferences.
        </p>
      </div>

      {/* Account section */}
      <section>
        <h2 className="mb-4 text-xs font-medium tracking-wide text-poof-mist/60 uppercase">
          Account
        </h2>
        <div className="rounded-lg border border-white/6 bg-white/2 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-poof-violet/10 text-sm font-semibold text-poof-violet">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[15px] font-medium text-white">
                {displayName}
              </p>
              <p className="text-sm text-poof-mist">{email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* API Keys section */}
      <section>
        <AgentApiKeysCard />
      </section>

      {/* Legal section */}
      <section>
        <h2 className="mb-4 text-xs font-medium tracking-wide text-poof-mist/60 uppercase">
          Legal
        </h2>
        <div className="rounded-lg border border-white/6 bg-white/2 p-5">
          <p className="text-sm text-poof-mist">
            Questions? Reach us at{" "}
            <a
              href="mailto:poof-support@k04.tech"
              className="text-poof-violet hover:underline"
            >
              poof-support@k04.tech
            </a>
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/terms"
              className="inline-flex items-center gap-1.5 text-sm text-poof-mist transition hover:text-white"
            >
              Terms of Service
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-sm text-poof-mist transition hover:text-white"
            >
              Privacy Policy
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
