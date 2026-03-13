import { ArrowRight, Sparkles, TimerReset, Zap } from 'lucide-react';
import { EarlyAccessForm } from './EarlyAccessForm';

const signals = [
  'Private galleries for launches and client drops',
  'Expiring access links with clean defaults',
  'A lighter way to share work before it is public',
];

const featurePills = [
  { label: 'Timed access', icon: TimerReset },
  { label: 'Fast sharing', icon: Zap },
  { label: 'Launch-ready soon', icon: Sparkles },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden px-6 pb-24 pt-32 md:px-16 md:pb-28 md:pt-40"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_58%)]" />
        <div className="absolute left-[-10%] top-28 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl animate-[orbFloat_18s_ease-in-out_infinite]" />
        <div className="absolute right-[-8%] top-40 h-72 w-72 rounded-full bg-white/[0.03] blur-3xl animate-[orbFloat_22s_ease-in-out_infinite_reverse]" />
        <div className="hero-grid absolute inset-x-0 top-0 h-full opacity-25" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="animate-[fadeUp_0.75s_ease_both]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-poof-white/78">
            Pre-launch build
          </div>

          <h1 className="mt-7 max-w-4xl font-syne text-5xl font-extrabold leading-[0.92] tracking-[-0.05em] md:text-7xl">
            Private photo drops.
            <span className="mt-4 inline-flex rounded-[20px] border border-poof-accent/80 bg-poof-accent px-4 py-2 text-poof-white shadow-[0_12px_30px_rgba(124,92,252,0.22)]">
              Gone when you say.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-poof-smoke md:text-xl">
            Poof is still in pre-launch. Join early access and get the email
            when timed private galleries are ready.
          </p>

          <div className="mt-10 max-w-2xl">
            <EarlyAccessForm source="hero" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {featurePills.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-poof-white/90 transition duration-300 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.05]"
              >
                <Icon size={16} className="text-poof-mint" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-[fadeUp_0.95s_0.12s_ease_both]">
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_32%)]" />

            <div className="relative rounded-[28px] border border-white/10 bg-[#121212]/95 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-poof-mist">
                    Launch board
                  </p>
                  <h2 className="mt-2 font-syne text-2xl font-bold tracking-[-0.04em]">
                    Current focus
                  </h2>
                </div>
                <div className="rounded-full border border-poof-mint/25 bg-poof-mint/10 px-3 py-1 text-xs font-medium text-poof-mint">
                  In progress
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="launch-card rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-poof-mist">Wave 01</p>
                      <p className="mt-1 text-lg font-semibold text-poof-white">
                        Private gallery delivery
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-poof-white/80">
                      Building now
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/6">
                    <div className="h-2 w-[68%] rounded-full bg-poof-white/80 animate-[pulseBar_3.2s_ease-in-out_infinite]" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {signals.map((item, index) => (
                    <div
                      key={item}
                      className="launch-card rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-poof-mint shadow-[0_0_18px_rgba(182,240,216,0.9)]" />
                        <p className="text-sm leading-6 text-poof-smoke">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="#early-access"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-poof-white no-underline transition hover:text-poof-white/75"
                >
                  Join the launch list
                  <ArrowRight
                    size={16}
                    className="transition duration-300 group-hover:translate-x-1"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-4 top-10 rounded-full border border-white/10 bg-[#151515] px-4 py-2 text-xs uppercase tracking-[0.22em] text-poof-white/80 shadow-[0_12px_50px_rgba(0,0,0,0.25)] animate-[badgeDrift_6s_ease-in-out_infinite]">
            Early access only
          </div>
          <div className="pointer-events-none absolute -left-4 bottom-10 rounded-full border border-white/10 bg-[#151515] px-4 py-2 text-xs uppercase tracking-[0.22em] text-poof-white/65 shadow-[0_12px_50px_rgba(0,0,0,0.25)] animate-[badgeDrift_7s_ease-in-out_infinite_reverse]">
            Timed links
          </div>
        </div>
      </div>
    </section>
  );
}
