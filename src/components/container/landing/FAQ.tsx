import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What happens when a link expires?',
    answer: "It's gone. The URL returns nothing. No redirect, no cached version. It poofed."
  },
  {
    question: 'Can I extend an expiry after sharing?',
    answer: "Yes — as long as the link hasn't expired yet, you can extend it from your dashboard."
  },
  {
    question: 'Do viewers need an account?',
    answer: 'Nope. Just a link. That\'s it.'
  },
  {
    question: 'Is my content stored permanently on your servers?',
    answer: "Only until the expiry. After that, it's deleted from our servers within 24 hours."
  },
  {
    question: 'Can I password-protect my galleries?',
    answer: 'Yes — on the Creator and Pro plans.'
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[5px] uppercase text-poof-mist mb-5 flex items-center gap-3">
          06 — Questions
          <div className="w-20 h-px bg-white/[0.07]" />
        </div>
        
        <h2 className="font-syne font-extrabold text-4xl md:text-5xl tracking-[-2px] mb-16 leading-tight">
          You asked. We answered.
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
