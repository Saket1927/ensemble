import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { PLATFORM_STATS } from '../../data/seedData';
import { MasterTab } from './MasterLayout';
import {
  UtensilsCrossed,
  Users,
  QrCode,
  Star,
  Gift,
  Tag,
  TrendingUp,
  ArrowUpRight,
  Plus,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

interface MasterOverviewProps {
  onNavigate: (tab: MasterTab) => void;
  onOpenOnboard: () => void;
}

export const MasterOverview: React.FC<MasterOverviewProps> = ({ onNavigate, onOpenOnboard }) => {
  const { restaurants, setActiveRestaurantSlug, setRole } = useTenant();

  const metrics = [
    {
      label: 'Total Restaurants',
      value: PLATFORM_STATS.totalRestaurants.toString(),
      sub: `${PLATFORM_STATS.activeRestaurants} active restaurants`,
      icon: UtensilsCrossed,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Monthly Recurring Revenue',
      value: PLATFORM_STATS.mrr,
      sub: '+14.2% MoM growth',
      icon: TrendingUp,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Platform Customers',
      value: PLATFORM_STATS.totalCustomers.toLocaleString(),
      sub: 'Across all restaurants',
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Total Table QR Scans',
      value: PLATFORM_STATS.totalQrScans,
      sub: 'All-time platform scans',
      icon: QrCode,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Total Reviews Generated',
      value: PLATFORM_STATS.totalReviews.toLocaleString(),
      sub: '4.8 ★ network avg',
      icon: Star,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    },
    {
      label: 'Total Rewards Won',
      value: PLATFORM_STATS.totalRewards.toLocaleString(),
      sub: 'Spin & Win vouchers',
      icon: Gift,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Table Redemptions',
      value: PLATFORM_STATS.totalRedemptions.toLocaleString(),
      sub: '25.4% redemption velocity',
      icon: Tag,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
    {
      label: 'Platform Health',
      value: '99.98%',
      sub: 'Zero downtime across restaurants',
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* Platform Executive Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            ENSEMBLE SaaS Multi-Restaurant Platform
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Global Platform Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage hospitality SaaS subscriptions, monitor live table telemetry across cities, and provision autonomous subdomains for onboarded brands.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('restaurants')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Manage Restaurants ({restaurants.length})
          </button>

          <button
            onClick={onOpenOnboard}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-950"
          >
            + Onboard Restaurant
          </button>
        </div>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 shadow-md space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {m.label}
                </span>
                <div className={`p-2 rounded-xl border ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-bold text-white tracking-tight">
                {m.value}
              </div>

              <div className="text-[11px] text-slate-400">
                {m.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Row: Revenue Trend & Quick Tenant Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue / MRR Trend Visualizer (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-950/80 rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">
                Monthly Recurring Revenue & Restaurant Growth
              </h3>
              <p className="text-xs text-slate-400">
                Aggregated subscription ARR of ₹2.21 Cr across Starter, Growth, and Enterprise plans.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              +₹2,40,000 This Month
            </span>
          </div>

          {/* Bar Chart Simulation */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-800">
            {[
              { month: 'Apr', height: '42%', val: '₹11.2L' },
              { month: 'May', height: '54%', val: '₹12.8L' },
              { month: 'Jun', height: '62%', val: '₹14.1L' },
              { month: 'Jul', height: '75%', val: '₹15.9L' },
              { month: 'Aug', height: '88%', val: '₹17.2L' },
              { month: 'Sep (Current)', height: '96%', val: '₹18.45L' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <span className="text-[10px] font-mono text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition">
                  {bar.val}
                </span>
                <div
                  className="w-full bg-slate-800 rounded-t group-hover:bg-emerald-500 transition-all cursor-pointer"
                  style={{
                    height: bar.height,
                    backgroundColor: bar.month.includes('Sep') ? '#10b981' : undefined,
                  }}
                />
                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  {bar.month}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Net Churn Rate: 0.8%</span>
            <span>Average Plan Value: ₹11,200 / mo</span>
          </div>
        </div>

        {/* Live Restaurant Quick Jumper */}
        <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">
              Restaurant Quick Switch
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Restaurant Directory
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Open any restaurant's live customer experience or restaurant dashboard without logging in.
          </p>

          <div className="space-y-3">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: rest.branding.primaryColor }}
                    />
                    <span className="font-bold text-xs text-white truncate max-w-[130px]">
                      {rest.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
                    {rest.plan}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      window.open(`/${rest.slug}/t/1`, '_blank');
                    }}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold text-center transition flex items-center justify-center space-x-1"
                  >
                    <span>Guest View</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </button>

                  <button
                    onClick={() => {
                      window.open('/restaurant/login', '_blank');
                    }}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold text-center transition flex items-center justify-center space-x-1"
                  >
                    <span>Login Portal</span>
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
