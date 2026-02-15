
import React from 'react';

const TIERS = [
  {
    name: "Standard",
    price: "0",
    desc: "For small classroom demonstrations.",
    features: ["Standard 2-way sorting", "Real-time log viewer", "Max speed: 5m/s", "Local storage logs"],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Enterprise",
    price: "99",
    desc: "High-throughput industrial simulation.",
    features: ["Advanced 5-way sorting", "AI pattern recognition", "Unlimited speed cap", "Cloud telemetry sync", "API Access"],
    cta: "Contact Team",
    popular: true
  },
  {
    name: "Pro",
    price: "49",
    desc: "Advanced research & development.",
    features: ["3-way weighted sorting", "Predictive maintenance", "Custom sensor plugins", "CSV Data export"],
    cta: "Upgrade Now",
    popular: false
  }
];

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">Flexible <span className="text-gradient">Access</span> Tiers</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Scale your autonomous sorting needs from basic classroom prototypes to industrial-grade simulations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier, idx) => (
            <div key={idx} className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col ${
              tier.popular ? 'bg-slate-900 border-purple-500/50 scale-105 z-10 shadow-2xl shadow-purple-500/10' : 'bg-slate-900/50 border-slate-800'
            }`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                  Best Value
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-300 mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">${tier.price}</span>
                  <span className="text-slate-500 text-sm">/mo</span>
                </div>
                <p className="text-slate-500 text-sm mt-4">{tier.desc}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-400">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-xl font-bold transition-all ${
                tier.popular ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
