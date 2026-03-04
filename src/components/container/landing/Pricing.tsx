import { useState } from 'react';

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    interval: 'Forever free',
    features: [
      '5 galleries',
      '7-day max expiry',
      '50 photos per gallery',
      'Basic sharing'
    ]
  },
  {
    name: 'Creator',
    price: { monthly: 9, yearly: 7 },
    interval: { monthly: 'Billed monthly', yearly: 'Billed yearly' },
    features: [
      'Unlimited galleries',
      'Custom expiry (up to 90 days)',
      '500 photos per gallery',
      'Custom domain',
      'Advanced analytics'
    ],
    recommended: true
  },
  {
    name: 'Pro',
    price: { monthly: 24, yearly: 19 },
    interval: { monthly: 'Billed monthly', yearly: 'Billed yearly' },
    features: [
      'Everything in Creator',
      'Password-protected links',
      'Advanced analytics',
      'Priority support',
      'API access'
    ]
  },
];

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="py-32 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-[5px] uppercase text-poof-mist mb-5 flex items-center gap-3">
          05 — Simple pricing
          <div className="w-20 h-px bg-white/[0.07]" />
        </div>
        
        <h2 className="font-syne font-extrabold text-4xl md:text-5xl tracking-[-2px] mb-16 leading-tight">
          Free to start.<br />Powerful when you grow.
        </h2>
        
        <div className="flex justify-center mb-16">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-full p-1 flex gap-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-br from-poof-accent to-[#a48cff] text-poof-white'
                  : 'text-poof-mist'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                billingPeriod === 'yearly'
                  ? 'bg-gradient-to-br from-poof-accent to-[#a48cff] text-poof-white'
                  : 'text-poof-mist'
              }`}
            >
              Yearly <small>(save 20%)</small>
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`bg-white/[0.03] border rounded-3xl p-10 transition-all duration-300 relative ${
                plan.recommended 
                  ? 'border-poof-accent md:scale-105 shadow-[0_0_40px_rgba(124,92,252,0.2)]' 
                  : 'border-white/[0.07]'
              }`}
            >
              {plan.recommended && (
                <span className="absolute top-5 right-5 bg-poof-violet/15 text-poof-violet px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide uppercase">
                  Most popular
                </span>
              )}
              
              <div className="font-syne font-bold text-2xl mb-3">{plan.name}</div>
              
              <div className="font-syne font-extrabold text-5xl tracking-[-2px] mb-2">
                ${typeof plan.price === 'object' ? plan.price[billingPeriod] : plan.price}
                {plan.name !== 'Free' && <span className="text-lg text-poof-mist font-normal">/mo</span>}
              </div>
              
              <div className="text-poof-mist text-sm mb-8">
                {typeof plan.interval === 'object' ? plan.interval[billingPeriod] : plan.interval}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-poof-smoke">
                    <span className="text-poof-mint font-bold flex-shrink-0">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-full font-medium text-sm tracking-wide transition-all duration-200 ${
                  plan.recommended
                    ? 'bg-gradient-to-br from-poof-accent to-[#a48cff] text-poof-white hover:opacity-90'
                    : 'border border-white/15 text-poof-white hover:border-poof-violet/50 hover:bg-poof-violet/6'
                }`}
              >
                {plan.name === 'Free' ? 'Get started' : 'Start free trial'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
