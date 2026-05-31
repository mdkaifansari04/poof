"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "for now",
    description: "Temporary free plan with strict limits",
    features: [
      "Up to 3 galleries per account",
      "Up to 10 images per gallery",
      "Maximum 10 MB per image",
      "Allowed types: JPEG, PNG, WEBP, HEIC",
      "Share gallery, single image, or multi-image link",
    ],
    cta: "Create account",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Sharing Rules",
    price: "Included",
    period: "behavior",
    description: "How link creation and expiry work",
    features: [
      "Gallery, single-image, and multi-image sharing",
      "Up to 100 images in one multi-image link",
      "Up to 20 active links per gallery",
      "Expiry range: 1 hour to 1 year",
      "Unlimited independent links per resource",
      "Manual revoke at any time",
    ],
    cta: "Start sharing",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Lifecycle",
    price: "Included",
    period: "operations",
    description: "Upload, session, and cleanup timelines",
    features: [
      "Presigned upload URLs expire after 5 minutes",
      "Pending uploads older than 30 minutes become failed",
      "Failed uploads are purged after 24 hours",
      "Soft-deleted images are removed from storage within 24 hours",
      "Session duration: 30 days with sliding refresh",
    ],
    cta: "Read privacy policy",
    href: "/privacy",
    highlighted: false,
  },
];

const limits = [
  ["Max file size", "10 MB per image"],
  ["Allowed MIME types", "JPEG · PNG · WEBP · HEIC"],
  ["Max galleries per user", "3"],
  ["Max images per gallery", "10"],
  ["Max images in multi-image link", "100"],
  ["Max active links per gallery", "20"],
  ["Expiry window", "1 hour to 1 year"],
  ["Presigned upload URL TTL", "5 minutes"],
];

export function LandingPricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-poof-accent/[0.02] to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16 animate-fade-up">
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.05] tracking-tight mb-6">
            Free plan.{" "}
            <span className="text-poof-violet">Clear limits.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Poof is currently free. Limits are enforced server-side for
            predictable performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-24">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-6 lg:p-8 animate-fade-up flex flex-col",
                plan.highlighted
                  ? "border-poof-violet/40 bg-card shadow-[0_0_40px_-12px_rgba(124,92,252,0.2)]"
                  : "border-border bg-card"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-poof-accent text-white text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    Active plan
                  </div>
                </div>
              )}

              <div className="mb-8 pt-2">
                <h3 className="font-heading font-extrabold text-xl text-foreground mb-3">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-heading font-extrabold text-4xl text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-poof-mint flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "w-full btn-press",
                  plan.highlighted
                    ? "bg-gradient-to-r from-poof-accent to-poof-violet hover:opacity-90 text-white shadow-lg shadow-poof-accent/20"
                    : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                )}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="animate-fade-up">
          <p className="text-[11px] tracking-[0.2em] uppercase text-foreground/25 font-medium mb-8">
            Platform limits · v1
          </p>
          <div className="rounded-2xl border border-border overflow-hidden">
            {limits.map(([rule, value], i) => (
              <div
                key={rule}
                className={cn(
                  "grid grid-cols-2 sm:grid-cols-[1fr_auto] items-center px-6 py-4 gap-4",
                  i % 2 === 0 ? "bg-muted/30" : "bg-transparent",
                  i !== limits.length - 1 ? "border-b border-border" : ""
                )}
              >
                <span className="text-sm text-foreground/40">{rule}</span>
                <span className="text-sm text-foreground font-medium text-right sm:text-left tabular-nums">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
            Need higher limits?{" "}
            <a
              href="mailto:poof-support@k04.tech"
              className="text-poof-violet hover:text-foreground transition-colors underline underline-offset-2"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
