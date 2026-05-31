import Link from "next/link";
import { Logo } from "@/components/poof/logo";

const securityItems = [
  "Authentication uses Better Auth with database-backed sessions.",
  "Upload URLs are presigned and expire quickly to reduce risk.",
  "Deleted galleries and images are removed from object storage within 24 hours.",
  "Pending uploads older than 30 minutes are marked failed automatically.",
  "Session cookies are httpOnly, secure, and SameSite=Lax.",
];

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "Sign in", href: "/signin" },
    { label: "Create account", href: "/signup" },
    { label: "Support", href: "mailto:poof-support@k04.tech" },
    { label: "Contact", href: "mailto:hello-poof@k04.tech" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2">
            <Logo size="md" className="mb-4" />
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
              Share photos with expiring links. When time is up, access ends.
              Your original content stays in your account until you delete it.
            </p>

            <div className="flex flex-wrap gap-2">
              <a
                href="https://peerlist.io/mdkaifansari04/project/poof"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="https://peerlist.io/api/v1/projects/embed/PRJHLKLRKAKR6A8O7C7RK9BNN9GOEJ?showUpvote=true&theme=dark"
                  alt="Peerlist"
                  className="h-[45px] w-auto opacity-60 hover:opacity-100 transition-opacity"
                />
              </a>
              <a
                href="https://www.producthunt.com/products/poof-8"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  alt="Product Hunt"
                  className="h-[45px] w-auto opacity-60 hover:opacity-100 transition-opacity"
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1110030&theme=dark&t=1774863389651"
                />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground text-sm mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground text-sm mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("mailto:") ? (
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground text-sm mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
            {securityItems.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 text-xs text-foreground/25"
              >
                <span className="h-1 w-1 rounded-full bg-poof-violet/40" />
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Poof. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Made with care for your privacy.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
