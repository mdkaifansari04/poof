"use client";

import { Upload, Link2, Timer, Ghost } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload your photos",
    description:
      "Drag, drop, done. Create galleries in seconds. Organize however you want.",
  },
  {
    icon: Link2,
    number: "02",
    title: "Generate a share link",
    description:
      "Choose gallery, single image, or a custom image selection. Set expiry and create the link.",
  },
  {
    icon: Timer,
    number: "03",
    title: "Share with anyone",
    description:
      "Recipients can open the URL without an account while your ownership rules remain enforced.",
  },
  {
    icon: Ghost,
    number: "04",
    title: "Watch it poof",
    description:
      "After expiry or revoke, the shared URL becomes inaccessible and shows an expired or revoked state.",
  },
];

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-poof-accent/[0.03] to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-20 animate-fade-up">
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.05] tracking-tight mb-6">
            Simple as 1, 2, 3...{" "}
            <span className="bg-gradient-to-r from-poof-violet to-poof-accent bg-clip-text text-transparent">
              poof.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No complicated setup. No learning curve. Just share and forget.
          </p>
        </div>

        <div className="space-y-24 md:space-y-32">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative animate-fade-up"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div
                className={`flex flex-col gap-8 md:gap-16 ${
                  i % 2 === 0
                    ? "md:flex-row md:items-center"
                    : "md:flex-row-reverse md:items-center"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <span className="absolute inset-0 flex items-center justify-center font-heading font-extrabold text-[10rem] md:text-[14rem] leading-none text-poof-violet/[0.06] select-none pointer-events-none">
                    {step.number}
                  </span>
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-muted border border-border flex items-center justify-center text-poof-violet">
                    <step.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-foreground mb-3 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 animate-fade-up">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-6 bg-gradient-to-r from-poof-violet/10 via-poof-accent/10 to-poof-violet/10 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card p-8 md:p-10 text-center">
              <p className="text-muted-foreground text-sm mb-5 tracking-wide">
                Your share link looks like this:
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-poof-violet/[0.06] border border-poof-violet/20">
                  <span className="text-foreground/60 text-sm font-mono">
                    poof.k04.tech/shared/clxabc123
                  </span>
                </div>
                <span className="text-muted-foreground text-xs font-medium">or</span>
                <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-poof-peach/[0.06] border border-poof-peach/20">
                  <span className="text-foreground/60 text-sm font-mono">
                    poof.k04.tech/shared/clxxyz789
                  </span>
                </div>
              </div>
              <p className="mt-5 text-xs text-muted-foreground/60">
                Same URL shape for gallery, single image, and multi-image links.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
