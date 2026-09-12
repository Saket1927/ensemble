import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Globe,
  Smartphone,
  Maximize2,
  Shield,
  UtensilsCrossed,
  Sparkles,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const DomainBar: React.FC = () => {
  const {
    role,
    setRole,
    activeRestaurantSlug,
    setActiveRestaurantSlug,
    activeRestaurant,
    activeTable,
    setActiveTable,
    customerViewMode,
    setCustomerViewMode,
    restaurants,
    resetToDefaults,
  } = useTenant();

  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compute simulated browser URL
  let simulatedUrl = '';
  if (role === 'master_admin') {
    simulatedUrl = 'https://ensemble-restaurant.vercel.app/admin';
  } else if (role === 'restaurant_admin') {
    simulatedUrl = `https://ensemble-restaurant.vercel.app/${activeRestaurantSlug}/admin`;
  } else if (role === 'captain') {
    simulatedUrl = `https://ensemble-restaurant.vercel.app/${activeRestaurantSlug}/captain`;
  } else {
    simulatedUrl = `https://ensemble-restaurant.vercel.app/${activeRestaurantSlug}/t/${activeTable}`;
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(simulatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] text-slate-200 border-b border-slate-800 shadow-md text-xs select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Ensemble Brand & Layer Tag */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded bg-emerald-500 text-slate-950 font-black text-[11px] flex items-center justify-center tracking-tighter">
              E
            </span>
            <span className="font-bold tracking-wider text-white text-sm">ENSEMBLE</span>
            <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 rounded border border-slate-700">
              Multi-Tenant SaaS
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Layer Selector Tabs */}
          <div className="flex items-center bg-slate-900/90 rounded-md p-0.5 border border-slate-700/80">
            <button
              onClick={() => setRole('customer')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                role === 'customer'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>

            <button
              onClick={() => setRole('captain')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                role === 'captain'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Captain Floor</span>
            </button>

            <button
              onClick={() => setRole('restaurant_admin')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                role === 'restaurant_admin'
                  ? 'bg-amber-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Restaurant Admin</span>
            </button>

            <button
              onClick={() => setRole('master_admin')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                role === 'master_admin'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Master Admin</span>
            </button>
          </div>
        </div>

        {/* Center: Simulated Subdomain URL Bar */}
        <div className="flex-1 max-w-xl mx-2 hidden lg:flex items-center bg-slate-950/80 border border-slate-800 rounded-full px-3 py-1 shadow-inner group">
          <Globe className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
          <span className="font-mono text-[11px] text-slate-300 truncate tracking-tight">{simulatedUrl}</span>
          <button
            onClick={handleCopyUrl}
            title="Copy Simulated URL"
            className="ml-auto text-slate-500 hover:text-slate-200 transition-colors p-0.5"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Right: Tenant Switcher & Controls */}
        <div className="flex items-center space-x-2">
          {/* Active Tenant Dropdown (Visible if not in Master Admin) */}
          {role !== 'master_admin' && (
            <div className="relative">
              <button
                onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded border border-slate-700 transition"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
                />
                <span className="font-semibold text-[11px] truncate max-w-[110px]">
                  {activeRestaurant.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isTenantMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-slate-200">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                    Switch Active Tenant
                  </div>
                  {restaurants.map((rest) => (
                    <button
                      key={rest.id}
                      onClick={() => {
                        setActiveRestaurantSlug(rest.slug);
                        setIsTenantMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 hover:bg-slate-800 transition ${
                        rest.slug === activeRestaurantSlug ? 'bg-slate-800 text-emerald-400 font-medium' : ''
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0 border border-slate-600"
                        style={{ backgroundColor: rest.branding.primaryColor }}
                      />
                      <div className="flex-1 truncate">
                        <div className="font-semibold leading-none">{rest.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          /{rest.slug}
                        </div>
                      </div>
                      {rest.slug === activeRestaurantSlug && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Table Selector (If in Customer View) */}
          {role === 'customer' && (
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2 py-1 rounded border border-slate-700">
              <span className="text-slate-400 text-[10px]">Table:</span>
              <select
                value={activeTable}
                onChange={(e) => setActiveTable(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {Array.from({ length: activeRestaurant.tablesCount || 30 }, (_, i) => i + 1).map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-white">
                    #{t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Toggle (For Customer Experience) */}
          {role === 'customer' && (
            <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-700">
              <button
                onClick={() => setCustomerViewMode('mobile_frame')}
                title="Mobile Phone Simulation Frame"
                className={`p-1 rounded ${
                  customerViewMode === 'mobile_frame'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCustomerViewMode('responsive')}
                title="Full Screen Responsive View"
                className={`p-1 rounded ${
                  customerViewMode === 'responsive'
                    ? 'bg-slate-700 text-emerald-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo tenants, reviews, and rewards to initial defaults?')) {
                resetToDefaults();
              }
            }}
            title="Reset All Demo Data"
            className="p-1.5 text-slate-400 hover:text-rose-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
