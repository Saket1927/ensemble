import React from 'react';
import { Layers, Check, Sparkles, Shield, Zap } from 'lucide-react';

export const PlansTab: React.FC = () => {
  const plans = [
    {
      name: 'Starter Tier',
      price: '₹3,999',
      period: '/ month',
      description: 'Ideal for boutique cafes and intimate bistros up to 15 tables.',
      activeTenants: 28,
      features: [
        'Up to 15 Table QR Standees',
        'Dynamic Menu Management',
        'Guest Reviews Collection',
        'Standard Spin & Win (3 prizes)',
        'Basic Social Proof Uploads',
        'Email Support',
      ],
      popular: false,
    },
    {
      name: 'Growth Tier',
      price: '₹7,999',
      period: '/ month',
      description: 'For thriving casual dining and multi-room establishments.',
      activeTenants: 64,
      features: [
        'Up to 35 Table QR Standees',
        'Full Customer CRM Master',
        'Unlimited Spin & Win Configurator',
        'Google Review Bridge Redirection',
        'Staff Moderation for Social Shares',
        'Automated Birthday & Win-Back SMS',
        'Dedicated Priority Hospitality Agent',
      ],
      popular: true,
    },
    {
      name: 'Enterprise Royal',
      price: '₹14,999',
      period: '/ month',
      description: 'High-volume luxury dining hotels and fine-dining franchises.',
      activeTenants: 21,
      features: [
        'Unlimited Physical Tables & Standees',
        'Bespoke Brand Theme & CSS Tuning',
        'Multi-Unit POS & Billing Integration',
        'VIP Diner Segment Intelligence',
        'Custom Domain Binding (e.g. menu.heritagegrand.com)',
        'SLA 99.99% Uptime Guarantee',
        '24/7 Dedicated Account Director',
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <div>
        <h2 className="text-lg font-bold text-white">
          SaaS Subscription Plans & Pricing Strategy
        </h2>
        <p className="text-xs text-slate-400">
          Manage tier limits, pricing matrices, and restaurant distribution across tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-6 relative ${
              plan.popular
                ? 'bg-gradient-to-b from-slate-900 to-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Most Popular Choice</span>
              </span>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white">{plan.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {plan.activeTenants} Restaurants
                </span>
              </div>

              <p className="text-xs text-slate-400 min-h-[32px]">
                {plan.description}
              </p>

              <div className="flex items-baseline space-x-1 pt-2">
                <span className="text-3xl font-serif font-bold text-white">{plan.price}</span>
                <span className="text-xs text-slate-500 font-mono">{plan.period}</span>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                plan.popular
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              Configure Plan Limits
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
