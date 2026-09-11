import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { MasterGlobalCustomer } from '../../types/tenant';
import {
  Users,
  Search,
  Building2,
  TrendingUp,
  Star,
  Gift,
  Phone,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

const SEED_GLOBAL_CUSTOMERS: MasterGlobalCustomer[] = [
  {
    phone: '+91 98200 11223',
    name: 'Abhishek Sharma',
    totalRestaurantsFrequented: 3,
    restaurantNames: ['HERITAGE', 'BAMBAI HOUSE', 'THE TABLE'],
    totalLifetimeVisits: 14,
    totalLifetimeSpend: 38450,
    averageSpendPerVisit: 2746,
    totalReviewsWritten: 8,
    totalRewardsRedeemed: 6,
    lastSeenAt: 'Today at HERITAGE',
  },
  {
    phone: '+91 98201 99887',
    name: 'Rohit Kulkarni',
    totalRestaurantsFrequented: 2,
    restaurantNames: ['HERITAGE', 'BAMBAI HOUSE'],
    totalLifetimeVisits: 9,
    totalLifetimeSpend: 21600,
    averageSpendPerVisit: 2400,
    totalReviewsWritten: 5,
    totalRewardsRedeemed: 4,
    lastSeenAt: '2 days ago at HERITAGE',
  },
  {
    phone: '+91 98202 33441',
    name: 'Ananya Deshmukh',
    totalRestaurantsFrequented: 2,
    restaurantNames: ['BAMBAI HOUSE', 'THE TABLE'],
    totalLifetimeVisits: 11,
    totalLifetimeSpend: 29800,
    averageSpendPerVisit: 2709,
    totalReviewsWritten: 6,
    totalRewardsRedeemed: 5,
    lastSeenAt: 'Yesterday at BAMBAI HOUSE',
  },
  {
    phone: '+91 98203 77889',
    name: 'Vikramaditya Roy',
    totalRestaurantsFrequented: 1,
    restaurantNames: ['HERITAGE'],
    totalLifetimeVisits: 4,
    totalLifetimeSpend: 11400,
    averageSpendPerVisit: 2850,
    totalReviewsWritten: 2,
    totalRewardsRedeemed: 1,
    lastSeenAt: 'Last week at HERITAGE',
  },
];

export const GlobalCustomersDirectory: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<MasterGlobalCustomer | null>(null);

  const filtered = SEED_GLOBAL_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.restaurantNames.some((r) => r.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Global Customer Database</h2>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/40">
              Master Admin Eyes Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Section 17: Cross-tenant aggregated diners keyed by trusted phone identity (isolated from individual restaurants).
          </p>
        </div>

        <div className="text-right text-xs text-slate-400">
          Total Aggregated Diners: <strong className="text-white">84,291 Profiles</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center space-x-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search global diners by phone, name, or visited restaurant..."
          className="bg-transparent text-xs text-white placeholder:text-slate-500 flex-1 focus:outline-none"
        />
      </div>

      {/* Directory Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Frequented Restaurants</th>
                <th className="p-3.5">Total Visits</th>
                <th className="p-3.5">Lifetime Platform Spend</th>
                <th className="p-3.5">Avg Bill</th>
                <th className="p-3.5">Reviews / Vouchers</th>
                <th className="p-3.5">Last Seen</th>
                <th className="p-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((c) => (
                <tr key={c.phone} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{c.name}</span>
                    <span className="font-mono text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{c.phone}</span>
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {c.restaurantNames.map((rest) => (
                        <span
                          key={rest}
                          className="bg-slate-900 text-slate-200 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        >
                          {rest}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-3.5 font-bold text-white">{c.totalLifetimeVisits} visits</td>

                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    ₹{c.totalLifetimeSpend.toLocaleString()}
                  </td>

                  <td className="p-3.5 font-mono text-slate-300">
                    ₹{c.averageSpendPerVisit.toLocaleString()}
                  </td>

                  <td className="p-3.5">
                    <span className="text-[11px] block">
                      ★ {c.totalReviewsWritten} Reviews | 🎟️ {c.totalRewardsRedeemed} Redeemed
                    </span>
                  </td>

                  <td className="p-3.5 text-[11px] text-slate-400">{c.lastSeenAt}</td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] rounded-lg border border-slate-700 transition"
                    >
                      View Deep Dive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                <p className="text-xs font-mono text-emerald-400">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Lifetime Platform Spend</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  ₹{selectedCustomer.totalLifetimeSpend.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Average Spend / Visit</span>
                <span className="text-base font-bold text-white font-mono">
                  ₹{selectedCustomer.averageSpendPerVisit.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Dining Footprint across Platform</h4>
              <div className="space-y-1.5">
                {selectedCustomer.restaurantNames.map((r) => (
                  <div
                    key={r}
                    className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-white">{r}</span>
                    <span className="text-[11px] text-slate-400">Active High-Value Patron</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-400 inline mr-1" />
              Restaurant Isolation Check: This cross-restaurant record is strictly restricted to Master Admin and cannot be accessed by individual restaurant dashboards.
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
