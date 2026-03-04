import { Upload, CalendarClock, Send } from 'lucide-react';

const steps = [
  { 
    icon: Upload, 
    title: 'Upload', 
    desc: 'Drop your photos. Build your gallery in seconds.' 
  },
  { 
    icon: CalendarClock, 
    title: 'Set expiry', 
    desc: 'Pick when it disappears. Hours, days, or weeks.' 
  },
  { 
    icon: Send, 
    title: 'Share', 
    desc: 'Send the link. They see it. Then — poof.' 
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[5px] uppercase text-poof-mist mb-5 flex items-center gap-3">
          02 — Dead simple
          <div className="w-20 h-px bg-white/[0.07]" />
        </div>
        
        <h2 className="font-syne font-extrabold text-4xl md:text-5xl tracking-[-2px] mb-16 leading-tight">
          Three steps. Then poof.
        </h2>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-16 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex-1 relative">
                <div className="font-syne font-extrabold text-[120px] text-poof-violet/[0.08] leading-none absolute -top-10 left-0 pointer-events-none">
                  {idx + 1}
                </div>
                
                <div className="relative z-10 pt-20">
                  <div className="w-14 h-14 rounded-2xl bg-poof-violet/12 flex items-center justify-center text-poof-violet mb-6">
                    <Icon size={28} />
                  </div>
                  
                  <h3 className="font-syne font-bold text-2xl mb-3 tracking-[-0.5px]">
                    {step.title}
                  </h3>
                  
                  <p className="font-light text-poof-smoke leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-32 -right-8 w-16 h-0.5 border-t-2 border-dashed border-white/[0.07]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
