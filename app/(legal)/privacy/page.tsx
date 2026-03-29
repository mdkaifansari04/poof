import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/poof/logo";
import { AnimatedBackground } from "@/components/poof/animated-background";
import { GlassCard } from "@/components/poof/glass-card";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://poof.k04.tech";
const ogImagePath = "/images/og-image.png";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn what Poof collects, how data is used, retention timelines, cookies, and your privacy rights.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Poof Privacy Policy",
    description: "How Poof collects, uses, stores, and protects your data.",
    url: `${appUrl}/privacy`,
    type: "article",
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "Poof privacy policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poof Privacy Policy",
    description: "How Poof collects, uses, stores, and protects your data.",
    images: [ogImagePath],
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-poof-base">
      <AnimatedBackground />
      <LandingNav />
      <div className="relative z-10 mx-auto max-w-5xl py-24">
        <div className="p-6 sm:p-8">
          <article className="space-y-6 text-sm leading-relaxed text-poof-mist">
            <header className="space-y-2">
              <h1 className="font-heading text-3xl font-extrabold text-white">
                Privacy Policy
              </h1>
              <p>
                <strong>Poof</strong> · Last updated: March 2026
              </p>
            </header>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                What This Is
              </h2>
              <p>
                This policy explains what data we collect, why we collect it,
                and what we do with it. Short version: we collect only what we
                need and we do not sell your data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                1. What We Collect
              </h2>
              <h3 className="font-semibold text-white">Account Information</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Email address</li>
                <li>Display name</li>
                <li>Profile photo (when signing in with Google)</li>
              </ul>

              <h3 className="font-semibold text-white">Content You Upload</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Photos uploaded to galleries</li>
                <li>Gallery names and descriptions</li>
                <li>Share-link settings (such as expiry)</li>
              </ul>

              <h3 className="font-semibold text-white">Usage Data</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Basic usage logs (route calls, timestamps)</li>
                <li>Error logs for debugging</li>
                <li>IP address for abuse prevention and rate limiting</li>
              </ul>

              <h3 className="font-semibold text-white">Session Data</h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>Secure, httpOnly session token cookie</li>
                <li>Session metadata (IP, user agent, created time)</li>
              </ul>

              <h3 className="font-semibold text-white">
                What We Do Not Collect
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>No tracking pixels</li>
                <li>No third-party advertising trackers</li>
                <li>No advertising profiles</li>
                <li>No data sales</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                2. How We Use Your Data
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-white">
                      <th className="py-2 pr-4">Data</th>
                      <th className="py-2">Why we use it</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Email</td>
                      <td className="py-2">
                        Login, password reset, important service messages
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Display name + avatar</td>
                      <td className="py-2">Shown in your account UI</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Uploaded photos</td>
                      <td className="py-2">
                        Stored and served as part of product functionality
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Session data</td>
                      <td className="py-2">Keeps you logged in securely</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Usage logs</td>
                      <td className="py-2">
                        Debugging, abuse prevention, uptime monitoring
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">IP address</td>
                      <td className="py-2">
                        Rate limiting and fraud prevention
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                We do not use your data for advertising and we do not send
                marketing emails.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                3. Who We Share Data With
              </h2>
              <p>We share data only with providers required to run Poof:</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-white">
                      <th className="py-2 pr-4">Service</th>
                      <th className="py-2 pr-4">Purpose</th>
                      <th className="py-2">Data shared</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Neon (PostgreSQL)</td>
                      <td className="py-2 pr-4">Database</td>
                      <td className="py-2">
                        Account info, gallery metadata, share links
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Cloudflare R2</td>
                      <td className="py-2 pr-4">Photo storage</td>
                      <td className="py-2">Uploaded photos</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Google OAuth</td>
                      <td className="py-2 pr-4">Sign-in</td>
                      <td className="py-2">
                        Email, name, profile photo (OAuth only)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Cloudflare Worker ,ages</td>
                      <td className="py-2 pr-4">Hosting/serverless</td>
                      <td className="py-2">Request logs, IP addresses</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                4. Data Retention
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-white">
                      <th className="py-2 pr-4">Data type</th>
                      <th className="py-2">How long we keep it</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Account + content</td>
                      <td className="py-2">Until account deletion</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Deleted galleries/images</td>
                      <td className="py-2">
                        Removed from storage within 24 hours
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Expired share links</td>
                      <td className="py-2">
                        Records kept indefinitely for dashboard history
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2 pr-4">Session records</td>
                      <td className="py-2">
                        Deleted on expiry (30 days inactivity)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Usage logs</td>
                      <td className="py-2">90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                5. Your Rights
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>Access your data from your dashboard</li>
                <li>Delete photos, galleries, or your full account</li>
                <li>Export your data by emailing privacy@poof.app</li>
                <li>Correct your data in account settings</li>
              </ul>
              <p>
                If you are in the EU/UK, GDPR rights include erasure,
                portability, restriction, and objection. Requests:{" "}
                <a
                  href="mailto:privacy@poof.app"
                  className="text-poof-violet hover:underline"
                >
                  privacy@poof.app
                </a>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                6. Cookies
              </h2>
              <p>
                We use one cookie: a secure, httpOnly, SameSite=Lax session
                cookie for login state.
              </p>
              <p>
                No analytics cookies, advertising cookies, or third-party
                tracking cookies.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                7. Security
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>HTTPS/TLS encryption in transit</li>
                <li>Passwords hashed (never stored in plaintext)</li>
                <li>Randomly generated secure session tokens</li>
                <li>Restricted access keys for R2 storage</li>
                <li>Presigned upload URLs with 5-minute expiry</li>
              </ul>
              <p>
                Security issues:{" "}
                <a
                  href="mailto:security@poof.app"
                  className="text-poof-violet hover:underline"
                >
                  security@poof.app
                </a>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                8. Children&apos;s Privacy
              </h2>
              <p>
                Poof is not directed to children under 13. If you believe a
                child created an account, contact
                <a
                  href="mailto:privacy@poof.app"
                  className="text-poof-violet hover:underline"
                >
                  {" "}
                  privacy@poof.app
                </a>{" "}
                and we will delete it promptly.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                9. Changes to This Policy
              </h2>
              <p>
                If we make significant changes, we will update the &quot;Last
                updated&quot; date and may email registered users.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl font-bold text-white">
                10. Contact
              </h2>
              <p>
                Privacy:{" "}
                <a
                  href="mailto:privacy@poof.app"
                  className="text-poof-violet hover:underline"
                >
                  privacy@poof.app
                </a>
              </p>
              <p>
                Security:{" "}
                <a
                  href="mailto:security@poof.app"
                  className="text-poof-violet hover:underline"
                >
                  security@poof.app
                </a>
              </p>
              <p>
                Legal:{" "}
                <a
                  href="mailto:legal@poof.app"
                  className="text-poof-violet hover:underline"
                >
                  legal@poof.app
                </a>
              </p>
            </section>
          </article>
        </div>
      </div>
    <LandingFooter />
    </div>
  );
}
