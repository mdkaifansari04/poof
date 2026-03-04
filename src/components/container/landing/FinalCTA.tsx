import { useEffect, useRef } from 'react';

export function FinalCTA() {
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
    <section className="min-h-[70vh] flex items-center justify-center text-center px-6 md:px-16 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-50"
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
      
      <div className="relative z-10 max-w-3xl">
        <h2 className="font-syne font-extrabold text-5xl md:text-6xl tracking-[-2px] mb-6 leading-tight">
          Ready to share<br />and disappear?
        </h2>
        
        <p className="text-lg text-poof-mist font-light leading-relaxed mb-10 max-w-2xl mx-auto">
          Join 12,000+ creators. Free forever. No credit card.
        </p>
        
        <a href="#" className="inline-block px-10 py-4 rounded-full bg-gradient-to-br from-poof-accent to-[#a48cff] hover:opacity-90 transition-all duration-200 text-poof-white text-base font-medium tracking-wide no-underline mb-5">
          Get started free →
        </a>
        <br />
        <a href="#pricing" className="text-poof-mist text-sm hover:text-poof-white transition-colors duration-200 no-underline">
          See pricing first
        </a>
      </div>
    </section>
  );
}
