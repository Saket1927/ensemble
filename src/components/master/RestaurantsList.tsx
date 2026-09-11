import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Restaurant } from '../../types/tenant';
import {
  UtensilsCrossed,
  Search,
  Plus,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Users,
  Star,
  Gift,
} from 'lucide-react';

export const RestaurantsList: React.FC<{ onOpenOnboard: () => void }> = ({ onOpenOnboard }) => {
  const {
    restaurants,
    setActiveRestaurantSlug,
    setRole,
    toggleRestaurantStatus,
  } = useTenant();

  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.slug.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());

    const matchesPlan = filterPlan === 'All' || r.plan === filterPlan;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            All Registered Restaurant Tenants
          </h2>
          <p className="text-xs text-slate-400">
            Full directory of subscribed restaurant accounts, plans, and traffic metrics.
          </p>
        </div>

        <button
          onClick={onOpenOnboard}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Restaurant</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant name, slug, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-slate-900 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Plans</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Growth">Growth</option>
            <option value="Starter">Starter</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Restaurant Tenant</th>
                <th className="py-3 px-4">Subdomain URL</th>
                <th className="py-3 px-4">Plan & MRR</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Tables</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">View As Restaurant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRestaurants.map((rest) => (
                <tr key={rest.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-white text-base shadow-sm shrink-0"
                        style={{ backgroundColor: rest.branding.primaryColor }}
                      >
                        {rest.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {rest.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {rest.city} • {rest.cuisine}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-400">
                    {rest.slug}.ensemble.com
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {rest.plan}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      ₹{rest.mrr.toLocaleString()} / mo
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleRestaurantStatus(rest.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                        rest.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {rest.status}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                    {rest.tablesCount} Tables
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {rest.createdAt}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => {
                          setActiveRestaurantSlug(rest.slug);
                          setRole('customer');
                        }}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-semibold flex items-center space-x-1 transition"
                        title="Open Customer Experience"
                      >
                        <span>Customer</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => {
                          setActiveRestaurantSlug(rest.slug);
                          setRole('restaurant_admin');
                        }}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-semibold flex items-center space-x-1 transition"
                        title="Open Restaurant Dashboard"
                      >
                        <span>Dashboard</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
