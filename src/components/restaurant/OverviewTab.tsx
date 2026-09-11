import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { RestaurantTab } from './RestaurantLayout';
import {
  QrCode,
  Users,
  Star,
  Sparkles,
  Tag,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const OverviewTab: React.FC<{ onNavigate: (tab: RestaurantTab) => void }> = ({ onNavigate }) => {
  const {
    activeRestaurant,
    activeReviews,
    activeSocialSubmissions,
    activeCustomers,
    activeMenuItems,
    setRole,
  } = useTenant();

  const pendingSocial = activeSocialSubmissions.filter((s) => s.status === 'pending').length;

  const stats = [
    {
      title: "Today's QR Scans",
      value: '142',
      change: '+18.4%',
      period: 'vs yesterday',
      icon: QrCode,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Customer Visits',
      value: '68',
      change: '+12.1%',
      period: 'table sessions',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Reviews Collected',
      value: activeReviews.length.toString(),
      change: '4.9 ★ avg',
      period: '100% verified',
      icon: Star,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Spins Generated',
      value: '52',
      change: '76% win rate',
      period: 'engagement',
      icon: Sparkles,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Offers Redeemed',
      value: '18',
      change: '₹3,840',
      period: 'bill savings',
      icon: Tag,
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Real-Time Hospitality Intelligence
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Welcome to {activeRestaurant.name} Operations
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Live telemetry from Table 1 through {activeRestaurant.tablesCount}. Manage orders, verify social shares, and optimize your reward economy.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigate('social')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition ${
              pendingSocial > 0
                ? 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{pendingSocial} Social Proofs Pending</span>
          </button>

          <button
            onClick={() => setRole('customer')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center space-x-1.5"
            style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
          >
            <span>View As Guest</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {stat.value}
              </div>

              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-semibold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  {stat.change}
                </span>
                <span className="text-slate-400 text-[11px]">{stat.period}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Grid: Hourly QR Activity & Top Rated Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly QR Scans Visualizer (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Today's Dining Traffic By Hour
              </h3>
              <p className="text-xs text-slate-500">
                Peak table scan hours occur between 1:00 PM – 3:00 PM and 8:00 PM – 10:30 PM.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Feed
            </span>
          </div>

          {/* Bar chart mock */}
          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100">
            {[
              { hour: '12 PM', height: '40%', scans: 14 },
              { hour: '1 PM', height: '85%', scans: 34 },
              { hour: '2 PM', height: '95%', scans: 41 },
              { hour: '3 PM', height: '50%', scans: 18 },
              { hour: '4 PM', height: '20%', scans: 8 },
              { hour: '5 PM', height: '25%', scans: 10 },
              { hour: '6 PM', height: '45%', scans: 19 },
              { hour: '7 PM', height: '70%', scans: 28 },
              { hour: '8 PM', height: '100%', scans: 48 },
              { hour: '9 PM', height: '90%', scans: 42 },
              { hour: '10 PM', height: '60%', scans: 24 },
            ].map((slot, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                  {slot.scans}
                </span>
                <div
                  className="w-full bg-slate-200 rounded-t group-hover:bg-amber-600 transition-all cursor-pointer"
                  style={{
                    height: slot.height,
                    backgroundColor: slot.height === '100%' ? activeRestaurant.branding.primaryColor : undefined,
                  }}
                />
                <span className="text-[9px] font-mono text-slate-400 mt-2 whitespace-nowrap">
                  {slot.hour}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: activeRestaurant.branding.primaryColor }} />
              <span>Dinner Peak (48 scans / hr)</span>
            </span>
            <span>Estimated Table Turnover: 1.8x</span>
          </div>
        </div>

        {/* Top Rated Dishes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Top Rated Dishes
            </h3>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              View Menu
            </button>
          </div>

          <div className="space-y-3">
            {activeMenuItems.slice(0, 4).map((dish) => (
              <div
                key={dish.id}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition border border-slate-100"
              >
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {dish.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {dish.category} • ₹{dish.price}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-600 flex items-center space-x-0.5">
                    <span>★</span>
                    <span>{dish.rating}</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Guest favorite</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews & Recent Guests Quick Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Reviews */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Recent Table Reviews
            </h3>
            <button
              onClick={() => onNavigate('reviews')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              All Reviews ({activeReviews.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {activeReviews.slice(0, 2).map((rev) => (
              <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rev.customerName}</span>
                  <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}</span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2">
                  "{rev.comment}"
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Table {rev.tableNumber || 12}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Value Diners in CRM */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Top Customer Profiles
            </h3>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Open CRM Master
            </button>
          </div>

          <div className="space-y-2.5">
            {activeCustomers.slice(0, 2).map((cust) => (
              <div key={cust.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{cust.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {cust.visits} Visits • Total Spend ₹{cust.totalSpend.toLocaleString()}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {cust.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('customers')}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
