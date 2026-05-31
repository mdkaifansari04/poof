"use client";

import { cn } from "@/lib/utils";
import {
  Clock,
  Images,
  ImageIcon,
  Layers2,
  ShieldCheck,
  Zap,
  LucideIcon,
} from "lucide-react";

const primaryFeatures = [
  {
    icon: Clock,
    tag: "Expiring Links",
    heading:
      "Set a precise expiry timestamp. Once it expires, the URL returns an expired state.",
    visual: "expiry",
  },
  {
    icon: Images,
    tag: "Share Full Galleries",
    heading:
      "Generate one link for an entire gallery and let recipients browse every photo.",
    visual: "gallery",
  },
];

const microFeatures = [
  { icon: ImageIcon, label: "Single Image Sharing", sub: "One link, one image." },
  { icon: Layers2, label: "Multi-Image Links", sub: "Pick a subset, share once." },
  { icon: ShieldCheck, label: "Protected Ownership Checks", sub: "Server-validated, always." },
  { icon: Zap, label: "Instant Revoke", sub: "Kill any link in one click." },
];

const statPills = [
  "Up to 3 galleries per account",
  "Multiple active links per gallery",
  "Auth sessions with secure cookies",
];

function CardCorner({ className }: { className?: string }) {
  return (
    <>
      <span className={cn("absolute -left-px -top-px block size-2 border-l-2 border-t-2 border-poof-violet/60 rounded-tl-sm", className)} />
      <span className="absolute -right-px -top-px block size-2 border-r-2 border-t-2 border-poof-violet/60 rounded-tr-sm" />
      <span className="absolute -bottom-px -left-px block size-2 border-b-2 border-l-2 border-poof-violet/60 rounded-bl-sm" />
      <span className="absolute -bottom-px -right-px block size-2 border-b-2 border-r-2 border-poof-violet/60 rounded-br-sm" />
    </>
  );
}

function ExpiryVisual() {
  return (
    <div className="border-t border-border px-7 pb-7 pt-6">
      <div className="space-y-3">
        {[
          { label: "Expires in", value: "2d 14h 33m", accent: "text-poof-mint" },
          { label: "Status", value: "Active", accent: "text-poof-violet" },
          { label: "Views", value: "12", accent: "text-foreground/60" },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3"
          >
            <span className="text-xs text-foreground/30 tracking-wide">{label}</span>
            <span className={cn("text-sm font-semibold tabular-nums", accent)}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-poof-accent to-poof-violet transition-all duration-1000" />
      </div>
      <span className="block mt-2 text-[11px] text-foreground/20 text-right">
        62% of link lifetime remaining
      </span>
    </div>
  );
}

function GalleryVisual() {
  const swatches = [
    "from-violet-500/30 to-violet-900/10",
    "from-rose-400/20 to-pink-900/10",
    "from-sky-400/20 to-blue-900/10",
    "from-amber-400/20 to-orange-900/10",
    "from-emerald-400/20 to-green-900/10",
    "from-purple-400/20 to-indigo-900/10",
  ];
  return (
    <div className="border-t border-border px-7 pb-7 pt-6">
      <div className="grid grid-cols-3 gap-2">
        {swatches.map((g, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-xl bg-gradient-to-br border border-border",
              g,
              i === 0 && "col-span-2 row-span-2 rounded-2xl",
            )}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
        <span className="text-xs text-foreground/30">Share link</span>
        <span className="text-xs font-medium text-poof-violet font-mono tracking-wide">
          poof.k04.tech/s/g/••••••
        </span>
      </div>
    </div>
  );
}

interface CardHeadingProps {
  icon: LucideIcon;
  tag: string;
  heading: string;
}

function CardHeading({ icon: Icon, tag, heading }: CardHeadingProps) {
  return (
    <div className="px-7 pt-7 pb-4">
      <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-foreground/30 font-medium mb-5">
        <Icon className="size-3.5 text-poof-violet" strokeWidth={2} />
        {tag}
      </span>
      <p className="text-xl font-semibold text-foreground leading-snug tracking-tight">
        {heading}
      </p>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16 animate-fade-up">
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.05] tracking-tight mb-6">
            Built for privacy.{" "}
            <span className="text-poof-violet">Designed for control.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every feature exists to give you complete control over what you
            share, how long it stays available, and when it gets revoked. Poof
            supports full galleries, single images, and custom multi-image
            selections with share links you can kill instantly.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-12">
          {primaryFeatures.map((f, i) => (
            <div
              key={f.tag}
              className="group relative rounded-2xl border border-border bg-card animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CardCorner />
              <CardHeading icon={f.icon} tag={f.tag} heading={f.heading} />
              {f.visual === "expiry" ? <ExpiryVisual /> : <GalleryVisual />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {microFeatures.map(({ icon: Icon, label, sub }, i) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3
                hover:border-poof-violet/30 hover:bg-muted/50 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="size-8 rounded-lg bg-poof-violet/10 flex items-center justify-center">
                <Icon className="size-4 text-poof-violet" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-snug mb-0.5">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-8 border-t border-border animate-fade-up">
          {statPills.map((text) => (
            <span
              key={text}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-full px-3.5 py-1"
            >
              <span className="h-1 w-1 rounded-full bg-poof-violet" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
