export function Marquee() {
  const items = [
    'Share privately', '·', 'Expiring links', '·', 'Auto-vanish', '·', 
    'Gallery builder', '·', 'Zero storage', '·', 'One-click share', '·', 
    'Built for creators', '·', 'No trace left', '·'
  ];

  return (
    <div className="py-6 bg-white/[0.015] border-t border-b border-white/[0.07] overflow-hidden relative">
      <div className="flex gap-16 animate-[scroll_30s_linear_infinite] whitespace-nowrap">
        <div className="flex gap-16">
          {items.concat(items).map((item, i) => (
            <span key={i} className="text-[13px] tracking-[4px] uppercase text-poof-mist font-normal">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
