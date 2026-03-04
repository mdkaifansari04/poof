import { Twitter, Instagram, Github } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Cookie policy', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-white/[0.015] py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div>
            <h3 className="font-syne font-extrabold text-3xl tracking-[-2px] bg-gradient-to-br from-poof-white to-poof-violet bg-clip-text text-transparent mb-3">
              poof
            </h3>
            <p className="text-poof-mist mb-6">Share it. Poof. Gone.</p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-poof-mist hover:border-poof-violet hover:text-poof-violet hover:bg-white/[0.06] transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-poof-mist hover:border-poof-violet hover:text-poof-violet hover:bg-white/[0.06] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-poof-mist hover:border-poof-violet hover:text-poof-violet hover:bg-white/[0.06] transition-all duration-300"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-[13px] tracking-[3px] uppercase text-poof-white font-medium mb-5">
              Product
            </h4>
            <ul className="space-y-3 list-none">
              {footerLinks.product.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-poof-mist hover:text-poof-white transition-colors duration-200 text-sm no-underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-[13px] tracking-[3px] uppercase text-poof-white font-medium mb-5">
              Company
            </h4>
            <ul className="space-y-3 list-none">
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-poof-mist hover:text-poof-white transition-colors duration-200 text-sm no-underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-[13px] tracking-[3px] uppercase text-poof-white font-medium mb-5">
              Legal
            </h4>
            <ul className="space-y-3 list-none">
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-poof-mist hover:text-poof-white transition-colors duration-200 text-sm no-underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/[0.07] flex flex-col md:flex-row justify-between items-center gap-3 text-poof-mist text-[13px]">
          <div>© 2025 poof. All rights reserved.</div>
          <div>Made with 💨</div>
        </div>
      </div>
    </footer>
  );
}
