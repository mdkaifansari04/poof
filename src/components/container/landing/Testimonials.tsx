const testimonials = [
  {
    quote: "I use poof for client previews. They see it, love it, and then it's gone. Perfect.",
    author: 'Maya Chen',
    handle: '@maya.shoots'
  },
  {
    quote: "Finally a share tool that respects privacy. No awkward 'delete this now' texts.",
    author: 'James K.',
    handle: '@jk.creates'
  },
  {
    quote: "Set it to expire after the event. Guests saw the photos, then they vanished. Chef's kiss.",
    author: 'Lena Rodriguez',
    handle: '@eventsbylena'
  },
  {
    quote: "The countdown timer on the share page is such a nice touch. Feels premium.",
    author: 'Dan Taylor',
    handle: '@designr_dan'
  },
];

export function Testimonials() {
  return (
    <section className="py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[5px] uppercase text-poof-mist mb-5 flex items-center gap-3">
          04 — People love it
          <div className="w-20 h-px bg-white/[0.07]" />
        </div>
        
        <h2 className="font-syne font-extrabold text-4xl md:text-5xl tracking-[-2px] mb-16 leading-tight">
          Don't take our word for it.
        </h2>
        
        <div className="flex gap-6 overflow-x-auto pb-5 snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((testimonial, idx) => (
            <div 
              key={idx}
              className="flex-shrink-0 w-[340px] bg-white/[0.03] border border-white/[0.07] rounded-[20px] p-8 snap-start hover:border-poof-violet/30 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-poof-violet/40 to-poof-mint/30 mb-5" />
              
              <p className="font-light text-poof-white leading-relaxed text-[15px] mb-5">
                "{testimonial.quote}"
              </p>
              
              <div className="font-medium text-poof-white mb-1">
                {testimonial.author}
              </div>
              <div className="text-[13px] text-poof-mist">
                {testimonial.handle}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
