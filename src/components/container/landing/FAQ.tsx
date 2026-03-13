import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Can I use Poof right now?',
    answer: 'Not yet. The product is still being built, and the landing page now points people to early access instead of fake signup flows.'
  },
  {
    question: 'What do you save when I join early access?',
    answer: 'Just your email address and the page source so the team can notify you when Poof is ready.'
  },
  {
    question: 'Will I get marketing emails?',
    answer: 'The form is positioned for launch updates, not a generic newsletter blast.'
  },
  {
    question: 'What is the first release focused on?',
    answer: 'Private photo galleries, expiring access, and a tighter sharing experience. Pricing and broader marketing can come after the product is real.'
  },
  {
    question: 'What happens if I enter my email twice?',
    answer: 'The API handles duplicates safely and keeps one record per email.'
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[5px] uppercase text-poof-mist mb-5 flex items-center gap-3">
          03 — Questions
          <div className="w-20 h-px bg-white/[0.07]" />
        </div>
        
        <h2 className="font-syne font-extrabold text-4xl md:text-5xl tracking-[-2px] mb-16 leading-tight">
          Direct answers for a product that is not live yet.
        </h2>
        
        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-white/[0.07]">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex justify-between items-center py-7 text-left text-poof-white font-syne font-bold text-lg hover:text-poof-violet transition-colors duration-200"
              >
                {faq.question}
                <ChevronDown 
                  className={`transition-transform duration-300 text-poof-mist ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                  size={20}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === idx ? 'max-h-64 pb-7' : 'max-h-0'
                }`}
              >
                <p className="text-poof-smoke font-light leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
