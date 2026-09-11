import React from 'react';
import { PLATFORM_STATS } from '../../data/seedData';
import { TrendingUp, DollarSign, ArrowUpRight, CreditCard, ShieldCheck, PieChart } from 'lucide-react';

export const RevenueTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <div>
        <h2 className="text-lg font-bold text-white">
          Platform Revenue, Invoicing & Financial Health
        </h2>
        <p className="text-xs text-slate-400">
          Global SaaS metrics, billing collection efficiency, and restaurant ARR breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current MRR</span>
          <div className="text-2xl font-bold text-emerald-400">{PLATFORM_STATS.mrr}</div>
          <span className="text-[10px] text-slate-400">+14.2% MoM</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annualized Run Rate</span>
          <div className="text-2xl font-bold text-white">₹2,21,40,000</div>
          <span className="text-[10px] text-emerald-400">Target ₹3.0 Cr ARR</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Revenue / Tenant</span>
          <div className="text-2xl font-bold text-white">₹16,327</div>
          <span className="text-[10px] text-slate-400">Subscription + add-ons</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collection Success</span>
          <div className="text-2xl font-bold text-emerald-400">99.4%</div>
          <span className="text-[10px] text-slate-400">Automated Razorpay/Stripe</span>
        </div>
      </div>

      {/* Revenue Breakdown by Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white">Enterprise Royal</span>
            <span className="text-xs font-mono font-bold text-amber-400">54% MRR</span>
          </div>
          <div className="text-xl font-bold text-white">₹9,97,434 / mo</div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '54%' }} />
          </div>
          <p className="text-[11px] text-slate-400">Hotel Heritage Grand and luxury chains</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white">Growth Tier</span>
            <span className="text-xs font-mono font-bold text-indigo-400">38% MRR</span>
          </div>
          <div className="text-xl font-bold text-white">₹7,01,112 / mo</div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '38%' }} />
          </div>
          <p className="text-[11px] text-slate-400">Mid-sized regional dining tenants</p>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white">Starter Tier</span>
            <span className="text-xs font-mono font-bold text-emerald-400">8% MRR</span>
          </div>
          <div className="text-xl font-bold text-white">₹1,46,454 / mo</div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
          </div>
          <p className="text-[11px] text-slate-400">Boutique cafes & entry restaurants</p>
        </div>
      </div>
    </div>
  );
};
