import { EarlyAccessForm } from './EarlyAccessForm';

export function FinalCTA() {
  return (
    <section
      id="early-access"
      className="relative overflow-hidden px-6 py-24 md:px-16 md:py-32"
    >
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 40%, rgba(255,255,255,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 60%, rgba(255,255,255,0.04) 0%, transparent 70%)
          `,
          animation: 'breathe 8s ease-in-out infinite alternate'
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-white/[0.04] px-6 py-10 text-center backdrop-blur-2xl md:px-12 md:py-14">
        <p className="text-xs uppercase tracking-[0.34em] text-poof-mint">
          Early access
        </p>
        <h2 className="mt-4 font-syne text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">
          Join the list now.
          <span className="block text-poof-mist">
            Email the moment Poof is ready.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-poof-smoke">
          This is the one clear action on the page because it is the one action
          that makes sense before launch.
        </p>

        <div className="mx-auto mt-10 max-w-2xl text-left">
          <EarlyAccessForm source="final-cta" compact />
        </div>
      </div>
    </section>
  );
}
