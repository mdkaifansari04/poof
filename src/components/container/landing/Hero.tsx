import { useEffect, useRef } from 'react';

export function Hero() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;
    
    const colors = ['#c8b8ff', '#ffcba4', '#b6f0d8', '#e8d8ff', '#ffffff'];
    const container = particlesRef.current;
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const top = 40 + Math.random() * 50;
      const duration = 4 + Math.random() * 5;
      const delay = Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        top: ${top}%;
        background: ${color};
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        animation: floatUp ${duration}s ease-in ${delay}s infinite;
      `;
      
      container.appendChild(particle);
    }
  }, []);

  return (
    <section className="min-h-screen flex items-center px-6 md:px-16 pt-36 pb-20 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 40%, rgba(200,184,255,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 75% 60%, rgba(255,203,164,0.14) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 55% 20%, rgba(182,240,216,0.10) 0%, transparent 70%)
          `,
          animation: 'breathe 8s ease-in-out infinite alternate'
        }}
      />
      
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full flex justify-between gap-20 items-center">
        <div className="animate-[fadeUp_0.9s_ease_both]">
          <div className="inline-flex items-center gap-2 bg-poof-violet/12 border border-poof-violet/25 px-4 py-2 rounded-full text-xs tracking-[2px] uppercase text-poof-violet font-medium mb-8">
            ✦ Photo sharing, reimagined
          </div>
          
          <h1 className="font-syne font-extrabold text-5xl md:text-7xl leading-[0.95] tracking-[-3px] mb-7">
            Share it.<br />
            <span className="bg-gradient-to-br from-poof-white/100 via-poof-white/95 to-poof-violet bg-clip-text text-transparent">
              Poof.
            </span><br />
            Gone.
          </h1>
          
          <p className="text-lg text-poof-mist font-light leading-relaxed mb-9 max-w-xl">
            Create beautiful galleries. Set an expiry. Share the link. When time's up — it vanishes like it never existed.
          </p>
          
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <a href="#" className="px-8 py-4 rounded-full bg-gradient-to-br from-poof-accent to-[#a48cff] hover:opacity-90 transition-all duration-200 text-poof-white text-[15px] font-medium tracking-wide no-underline">
              Start sharing free →
            </a>
            <a href="#how-it-works" className="px-8 py-4 rounded-full border border-white/15 hover:border-poof-violet/50 hover:bg-poof-violet/6 transition-all duration-200 text-poof-white text-[15px] font-medium tracking-wide no-underline">
              See how it works
            </a>
          </div>
          
          <div className="text-[13px] text-poof-mist flex items-center gap-2">
            ✦ Loved by 12,000+ creators · No credit card needed
          </div>
        </div>
        
        <div className="relative h-[500px] animate-[fadeUp_1.1s_0.2s_ease_both]">
          <div 
            className="absolute w-[400px] h-[400px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px] animate-[breathe_6s_ease-in-out_infinite_alternate]"
            style={{ background: 'radial-gradient(circle, rgba(200,184,255,0.3), transparent 60%)' }}
          />
          
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 bg-poof-mint/95 text-poof-void px-5 py-2.5 rounded-full text-[13px] font-semibold shadow-[0_8px_32px_rgba(182,240,216,0.4)] z-30"
               style={{ animation: 'floatBadge 3s ease-in-out infinite' }}>
            Link copied 💨
          </div>
          
          <div className="absolute w-[360px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white/6 backdrop-blur-xl border border-white/[0.07] rounded-[20px] p-6"
               style={{ animation: 'cardFloat 4s ease-in-out infinite' }}>
            <div className="w-full h-[180px] bg-gradient-to-br from-poof-violet/30 to-poof-mint/20 rounded-xl mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.3),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(200,184,255,0.2),transparent_50%)]" />
            </div>
            <div className="font-syne font-bold text-base mb-2">Summer Memories</div>
            <div className="inline-flex items-center gap-1.5 bg-poof-peach/15 text-poof-peach px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide">
              ⏱ Expires in 2d 14h
            </div>
          </div>
          
          <div className="absolute w-[340px] left-1/2 top-[55%] -translate-x-[45%] -translate-y-[45%] rotate-[-4deg] z-10 opacity-70 bg-white/6 backdrop-blur-xl border border-white/[0.07] rounded-[20px] p-6"
               style={{ animation: 'cardFloat 4s 0.5s ease-in-out infinite' }}>
            <div className="w-full h-[180px] bg-gradient-to-br from-poof-violet/30 to-poof-mint/20 rounded-xl mb-4" />
            <div className="font-syne font-bold text-base">Client Preview</div>
          </div>
        </div>
      </div>
    </section>
  );
}
