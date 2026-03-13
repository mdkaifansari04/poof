import { BellRing, Clock3, GalleryHorizontal, LockKeyhole, Sparkles, WandSparkles } from 'lucide-react';

const features = [
  { 
    icon: GalleryHorizontal, 
    title: 'Private gallery delivery', 
    desc: 'Send a polished photo drop without sending a cluttered folder link or a public page.', 
    size: 'large' 
  },
  { 
    icon: Clock3, 
    title: 'Timed access', 
    desc: 'Decide how long a share stays open, then let it expire on its own.', 
    size: 'medium' 
  },
  { 
    icon: LockKeyhole, 
    title: 'Private by default', 
    desc: 'Built for launches, client previews, and sensitive work that should not linger.', 
    size: 'medium' 
  },
  { 
    icon: BellRing, 
    title: 'Launch updates', 
    desc: 'Everyone on the list gets notified when Poof opens up.', 
    size: 'small' 
  },
  { 
    icon: Sparkles, 
    title: 'Opinionated UX', 
    desc: 'Fewer knobs, faster sharing, and a cleaner recipient experience.', 
    size: 'small' 
  },
  { 
    icon: WandSparkles, 
    title: 'Built for the first real release', 
    desc: 'The landing page now reflects the actual state of the product: pre-launch, collecting interest, and focused on the core workflow first.', 
    size: 'large' 
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[5px] uppercase text-poof-mist mb-5 flex items-center gap-3">
          01 — What&apos;s coming
          <div className="w-20 h-px bg-white/[0.07]" />
        </div>
        
        <h2 className="font-syne font-extrabold text-4xl md:text-5xl tracking-[-2px] mb-16 leading-tight">
          The first release is focused.<br />That is intentional.
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
