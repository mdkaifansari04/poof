export function LandingFooter() {
  return (
    <footer className="bg-white/[0.015] py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <h3 className="font-syne font-extrabold text-3xl tracking-[-2px] bg-gradient-to-br from-poof-white to-poof-violet bg-clip-text text-transparent mb-3">
              poof
            </h3>
            <p className="max-w-xl text-poof-mist leading-7">
              Pre-launch landing page for a product that is still in progress.
              The one conversion path is early access, backed by the database.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-poof-mist md:justify-end">
            <a href="#top" className="transition-colors duration-200 hover:text-poof-white no-underline">
              Top
            </a>
            <a href="#features" className="transition-colors duration-200 hover:text-poof-white no-underline">
              What&apos;s coming
            </a>
            <a href="#launch-plan" className="transition-colors duration-200 hover:text-poof-white no-underline">
              Launch plan
            </a>
            <a href="#early-access" className="transition-colors duration-200 hover:text-poof-white no-underline">
              Early access
            </a>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/[0.07] flex flex-col md:flex-row justify-between items-center gap-3 text-poof-mist text-[13px]">
          <div>© 2026 poof. All rights reserved.</div>
          <div>Built for a smaller, sharper launch.</div>
        </div>
      </div>
    </footer>
  );
}
