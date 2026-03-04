import { useState, useEffect } from 'react';

export function Demo() {
  const [countdownSeconds, setCountdownSeconds] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const resetDemo = () => {
    setCountdownSeconds(300);
    setIsExpired(false);
  };

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <section id="demo" className="py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[5px] uppercase text-poof-mist mb-5 flex items-center gap-3">
          03 — See it in action
          <div className="w-20 h-px bg-white/[0.07]" />
        </div>
        
        <h2 className="font-syne font-extrabold text-4xl md:text-5xl tracking-[-2px] mb-16 leading-tight">
          Watch a link expire.<br />Right now.
        </h2>
        
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-16 text-center relative overflow-hidden">
          <div 
            className={`max-w-2xl mx-auto mb-8 bg-white/[0.04] border border-white/[0.07] rounded-[20px] p-8 transition-all duration-600 ${
              isExpired ? 'opacity-30 blur-sm scale-95' : ''
            }`}
          >
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-poof-violet/20 to-poof-mint/15 rounded-lg" />
              ))}
            </div>
            
            <div className="font-syne font-extrabold text-5xl text-poof-peach tracking-tight mb-4">
              {timeString}
            </div>
            
            <div className="text-[13px] text-poof-mist tracking-[2px] uppercase">
              Time until gallery expires
            </div>
          </div>
          
          {isExpired && (
            <div className="font-syne font-bold text-3xl text-poof-mist mt-10">
              💨 This gallery has poofed.
            </div>
          )}
          
          <button 
            onClick={resetDemo}
            className="px-8 py-4 rounded-full bg-gradient-to-br from-poof-accent to-[#a48cff] hover:opacity-90 transition-all duration-200 text-poof-white text-[15px] font-medium tracking-wide mb-6"
          >
            Reset demo
          </button>
          
          <p className="text-poof-smoke text-[15px] mt-6">
            This is exactly what your recipients see. Beautiful. Temporary.
          </p>
        </div>
      </div>
    </section>
  );
}
