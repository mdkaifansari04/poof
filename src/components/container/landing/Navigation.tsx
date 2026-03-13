import { useState, useEffect } from 'react';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-16 py-6 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'bg-poof-void/70 backdrop-blur-2xl border-b border-white/[0.07]' : ''
        }`}
      >
        <a href="#" className="flex items-center gap-3 no-underline">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 drop-shadow-[0_0_12px_rgba(200,184,255,0.4)]">
            <defs>
              <radialGradient id="poofGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e8d8ff"/>
                <stop offset="60%" stopColor="#c8b8ff"/>
                <stop offset="100%" stopColor="#7c5cfc"/>
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="62" rx="28" ry="16" fill="url(#poofGrad)" opacity="0.7"/>
            <circle cx="36" cy="55" r="14" fill="url(#poofGrad)" opacity="0.85"/>
            <circle cx="52" cy="48" r="18" fill="url(#poofGrad)"/>
            <circle cx="67" cy="55" r="13" fill="url(#poofGrad)" opacity="0.85"/>
            <circle cx="44" cy="28" r="3" fill="#c8b8ff" opacity="0.5"/>
            <circle cx="55" cy="22" r="2" fill="#e8d8ff" opacity="0.35"/>
            <circle cx="62" cy="30" r="2.5" fill="#c8b8ff" opacity="0.4"/>
          </svg>
          <span className="font-syne font-extrabold text-2xl tracking-[-1.5px] text-poof-white">
            poof
          </span>
        </a>

        <ul className="hidden md:flex gap-10 list-none">
          <li><a href="#features" className="text-poof-mist hover:text-poof-white transition-colors duration-200 no-underline">What&apos;s coming</a></li>
          <li><a href="#launch-plan" className="text-poof-mist hover:text-poof-white transition-colors duration-200 no-underline">Launch plan</a></li>
          <li><a href="#faq" className="text-poof-mist hover:text-poof-white transition-colors duration-200 no-underline">FAQ</a></li>
        </ul>

        <div className="hidden md:flex gap-3 items-center">
          <a href="#early-access" className="px-7 py-3 rounded-full border border-poof-accent/70 bg-poof-accent hover:border-poof-violet hover:bg-poof-violet active:translate-y-0 transition-all duration-200 text-poof-white text-sm font-semibold tracking-wide no-underline shadow-[0_12px_30px_rgba(124,92,252,0.18)]">
            Request early access
          </a>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="w-6 h-0.5 bg-poof-white transition-transform"></span>
          <span className="w-6 h-0.5 bg-poof-white transition-transform"></span>
          <span className="w-6 h-0.5 bg-poof-white transition-transform"></span>
        </button>
      </nav>

      <div
        className={`fixed top-0 w-full h-screen bg-poof-void z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 ${
          isMobileMenuOpen ? 'right-0' : '-right-full'
        }`}
      >
        <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-poof-white text-2xl font-syne font-bold no-underline">What&apos;s coming</a>
        <a href="#launch-plan" onClick={() => setIsMobileMenuOpen(false)} className="text-poof-white text-2xl font-syne font-bold no-underline">Launch plan</a>
        <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-poof-white text-2xl font-syne font-bold no-underline">FAQ</a>
        <a href="#early-access" onClick={() => setIsMobileMenuOpen(false)} className="text-poof-white text-2xl font-syne font-bold no-underline">Request early access</a>
      </div>
    </>
  );
}
