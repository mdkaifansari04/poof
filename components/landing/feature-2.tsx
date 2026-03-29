"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { ReactNode } from "react";

// ── Data ────────────────────────────────────────────────────────────────────

const primaryFeatures = [
  {
    icon: Clock,
    tag: "Expiring Links",
    heading:
      "Set a precise expiry timestamp. Once it expires, the URL returns an expired state.",
  },
  {
    icon: Images,
    tag: "Share Full Galleries",
    heading:
      "Generate one link for an entire gallery and let recipients browse every photo.",
  },
];

const microFeatures = [
  {
    icon: ImageIcon,
    label: "Single Image Sharing",
    sub: "One link, one image.",
  },
  {
    icon: Layers2,
    label: "Multi-Image Links",
    sub: "Pick a subset, share once.",
  },
  {
    icon: ShieldCheck,
    label: "Protected Ownership Checks",
    sub: "Server-validated, always.",
  },
  { icon: Zap, label: "Instant Revoke", sub: "Kill any link in one click." },
];

const statPills = [
  "Up to 3 galleries per account",
  "Multiple active links per gallery",
  "Auth sessions with secure cookies",
];

// ── Sub-components ───────────────────────────────────────────────────────────

interface FeatureCardProps {
  children: ReactNode;
  className?: string;
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
  <Card
    className={cn(
      "group relative rounded-2xl border border-white/[0.07] bg-white/[0.02] shadow-none",
      className,
    )}
  >
    <CardDecorator />
    {children}
  </Card>
);

const CardDecorator = () => (
  <>
    <span className="absolute -left-px -top-px block size-2 border-l-2 border-t-2 border-poof-violet/60 rounded-tl-sm" />
    <span className="absolute -right-px -top-px block size-2 border-r-2 border-t-2 border-poof-violet/60 rounded-tr-sm" />
    <span className="absolute -bottom-px -left-px block size-2 border-b-2 border-l-2 border-poof-violet/60 rounded-bl-sm" />
    <span className="absolute -bottom-px -right-px block size-2 border-b-2 border-r-2 border-poof-violet/60 rounded-br-sm" />
  </>
);

interface CardHeadingProps {
  icon: LucideIcon;
  tag: string;
  heading: string;
}

const CardHeading = ({ icon: Icon, tag, heading }: CardHeadingProps) => (
  <div className="p-7">
    <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-white/30 font-medium">
      <Icon className="size-3.5 text-poof-violet" strokeWidth={2} />
      {tag}
    </span>
    <p className="mt-6 text-xl font-semibold text-white leading-snug tracking-tight">
      {heading}
    </p>
  </div>
);

// ── Visual: expiry clock illustration ────────────────────────────────────────

const ExpiryVisual = () => (
  <div className="relative border-t border-dashed border-white/[0.06] px-7 pb-7 pt-6 flex flex-col gap-3">
    {[
      { label: "Expires in", value: "2d 14h 33m", color: "text-poof-mint" },
      { label: "Status", value: "Active", color: "text-poof-violet" },
      { label: "Views", value: "12", color: "text-white/60" },
    ].map(({ label, value, color }) => (
      <div
        key={label}
        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
      >
        <span className="text-xs text-white/30 tracking-wide">{label}</span>
        <span className={cn("text-sm font-semibold tabular-nums", color)}>
          {value}
        </span>
      </div>
    ))}
    <div className="mt-1 h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
      <div className="h-full w-[62%] rounded-full bg-poof-violet/50" />
    </div>
    <span className="text-[11px] text-white/20 text-right">
      62% of link lifetime remaining
    </span>
  </div>
);

// ── Visual: gallery share illustration ───────────────────────────────────────

const GalleryVisual = () => {
  const swatches = [
    "from-violet-500/30 to-violet-900/10",
    "from-rose-400/20 to-pink-900/10",
    "from-sky-400/20 to-blue-900/10",
    "from-amber-400/20 to-orange-900/10",
    "from-emerald-400/20 to-green-900/10",
    "from-purple-400/20 to-indigo-900/10",
  ];
  return (
    <div className="border-t border-dashed border-white/[0.06] px-7 pb-7 pt-6">
      <div className="grid grid-cols-3 gap-2">
        {swatches.map((g, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-xl bg-gradient-to-br border border-white/[0.06]",
              g,
              i === 0 && "col-span-2 row-span-2 rounded-2xl",
            )}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
        <span className="text-xs text-white/30">Share link</span>
        <span className="text-xs font-medium text-poof-violet tracking-wide">
          poof.k04.tech/s/g/••••••
        </span>
      </div>
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────

export default function Features() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-5xl">
        {/* Section label + headline */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Built for privacy.{" "}
            <span className="text-poof-violet">Designed for control.</span>
          </h2>
          <p className="text-lg text-poof-mist max-w-2xl mx-auto">
            Every feature exists to give you complete control over what you
            share, how long it stays available, and when it gets revoked.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* ── Primary feature cards ── */}
          {primaryFeatures.map((f, i) => (
            <FeatureCard key={f.tag}>
              <CardHeader className="pb-0">
                <CardHeading icon={f.icon} tag={f.tag} heading={f.heading} />
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {i === 0 ? <ExpiryVisual /> : <GalleryVisual />}
              </CardContent>
            </FeatureCard>
          ))}

          {/* ── Micro feature grid + stat pills ── */}
          <div className="lg:col-span-2">
            {/* 4-col micro feature grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {microFeatures.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="group/item rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3
                    hover:border-poof-violet/30 hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="size-8 rounded-lg bg-poof-violet/10 flex items-center justify-center">
                    <Icon
                      className="size-4 text-poof-violet"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-snug mb-0.5">
                      {label}
                    </p>
                    <p className="text-xs text-white/30 leading-relaxed">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
