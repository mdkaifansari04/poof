import { Timer, LayoutGrid, Link, ShieldOff, Clock, Sparkles } from 'lucide-react';

const features = [
  { 
    icon: Timer, 
    title: 'Expiring Links', 
    desc: 'Set a custom expiry date on any share. When it hits — the link dies. Gone.', 
    size: 'large' 
  },
  { 
    icon: LayoutGrid, 
    title: 'Gallery Builder', 
    desc: 'Drop your photos in. Arrange them. Make it yours.', 
    size: 'medium' 
  },
  { 
    icon: Link, 
    title: 'One-click Share', 
    desc: 'One URL. Works everywhere. No account needed to view.', 
    size: 'medium' 
  },
  { 
    icon: ShieldOff, 
    title: 'No Trace', 
    desc: 'Expired links leave nothing. No cache, no redirect.', 
    size: 'small' 
  },
  { 
    icon: Clock, 
    title: 'Custom Timers', 
    desc: 'Hours, days, weeks — you set the clock.', 
    size: 'small' 
  },
  { 
    icon: Sparkles, 
    title: 'Built for Creators', 
    desc: 'Whether it\'s client work, private drops, or just moments you want to share briefly — poof handles it.', 
    size: 'large' 
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[5px] uppercase text-poof-mist mb-5 flex items-center gap-3">
          01 — What poof does
          <div className="w-20 h-px bg-white/[0.07]" />
        </div>
        
        <h2 className="font-syne font-extrabold text-4xl md:text-5xl tracking-[-2px] mb-16 leading-tight">
          Everything you need.<br />Nothing you don't.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const gridClass = feature.size === 'large' 
              ? 'md:col-span-2 md:row-span-2' 
              : feature.size === 'medium' 
              ? 'md:col-span-2' 
              : 'md:col-span-1';
            
            return (
              <div
                key={idx}
                className={`${gridClass} bg-white/[0.03] border border-white/[0.07] rounded-[20px] p-8 hover:border-poof-violet/30 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}
              >
                <div className={`${feature.size === 'large' ? 'w-16 h-16' : 'w-12 h-12'} rounded-xl bg-poof-violet/12 flex items-center justify-center text-poof-violet mb-6`}>
                  <Icon size={feature.size === 'large' ? 32 : 24} />
                </div>
                
                <h3 className={`font-syne font-bold ${feature.size === 'large' ? 'text-3xl' : 'text-xl'} mb-3 tracking-[-0.5px]`}>
                  {feature.title}
                </h3>
                
                <p className={`font-light text-poof-smoke leading-relaxed ${feature.size === 'large' ? 'text-base' : 'text-[15px]'}`}>
                  {feature.desc}
                </p>
                
                {feature.size === 'large' && (
                  <div className="absolute w-52 h-52 bg-[radial-gradient(circle,rgba(200,184,255,0.15),transparent_70%)] rounded-full blur-[40px] -bottom-12 -right-12 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
