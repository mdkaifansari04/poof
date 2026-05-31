"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/poof/animated-background";
import { ArrowRight, Clock } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text content */}
          <div>
            <div className="mb-10 animate-fade-up">
              <div className="flex items-center gap-4 mb-6">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-poof-violet/40 to-transparent" />
                <span className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground font-medium">
                  Expiring photo sharing
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-poof-violet/40 to-transparent" />
              </div>
            </div>

            <h1 className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[0.92] tracking-tighter mb-6 animate-fade-up stagger-1">
              Share photos
              <br />
              <span className="bg-gradient-to-r from-poof-violet via-poof-accent to-poof-violet bg-clip-text text-transparent">
                on your terms.
              </span>
            </h1>

            <p className="text-lg text-foreground/40 font-light leading-relaxed max-w-md mb-10 animate-fade-up stagger-2">
              Galleries, single images, or hand-picked sets — each with a
              deadline you control. When time runs out, access ends. Simple.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-16 animate-fade-up stagger-3">
              <Button
                asChild
                size="lg"
                className="bg-foreground hover:bg-foreground/90 text-background px-8 py-5 text-base btn-press group"
              >
                <Link href="/signup">
                  Start sharing free
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-foreground px-8 py-5 text-base"
              >
                <a href="#how-it-works">How it works &rarr;</a>
              </Button>
            </div>

            {/* Stat row */}
            <div className="flex items-center gap-8 pt-8 border-t border-border animate-fade-up stagger-4">
              <div>
                <div className="font-heading font-extrabold text-2xl text-foreground tabular-nums">
                  3
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Galleries free
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="font-heading font-extrabold text-2xl text-foreground tabular-nums">
                  1yr
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Max expiry
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="font-heading font-extrabold text-2xl text-poof-accent tabular-nums">
                  Instant
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Revoke
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual mockup */}
          <div className="relative animate-fade-up stagger-3 hidden lg:block">
            {/* Glow behind */}
            <div className="absolute -inset-12 bg-gradient-to-br from-poof-accent/30 via-poof-violet/10 to-transparent rounded-full blur-3xl" />

            {/* Tilted card stack */}
            <div className="relative -rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Back layer */}
              <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl bg-muted border border-border" />

              {/* Front card */}
              <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
                </div>

                {/* Images */}
                <div className="grid grid-cols-2 gap-2 p-3">
                  <div className="col-span-2 aspect-[21/9] rounded-lg overflow-hidden bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src="https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* URL bar */}
                <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-muted flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-poof-mint flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground font-mono truncate">
                    poof.k04.tech/shared/clxabc123
                  </span>
                </div>
              </div>
            </div>

            {/* Floating countdown pill */}
            <div className="absolute -bottom-6 -left-6 animate-fade-up stagger-5">
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 bg-poof-peach" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-poof-peach" />
                  </span>
                  <span className="text-xs text-muted-foreground">Expires in</span>
                </div>
                <span className="font-heading font-extrabold text-xl text-poof-peach tabular-nums">
                  2d 14h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile mockup (shown below lg breakpoint) */}
        <div className="relative mt-16 lg:hidden animate-fade-up stagger-4">
          <div className="absolute -inset-6 bg-gradient-to-br from-poof-accent/20 to-transparent rounded-3xl blur-2xl" />
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">
              {[
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
                "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400",
              ].map((src, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-muted flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-poof-mint flex-shrink-0" />
              <span className="text-[10px] text-muted-foreground font-mono truncate">
                poof.k04.tech/shared/clxabc123
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-lg">
              <Clock className="w-4 h-4 text-poof-peach" strokeWidth={1.5} />
              <span className="text-xs text-muted-foreground">Expires in</span>
              <span className="font-heading font-extrabold text-lg text-poof-peach tabular-nums">
                2d 14h
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
