import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Shield,
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  CreditCard,
  Layers,
  TrendingUp,
  Activity,
  HeadphonesIcon,
  Settings,
  Plus,
  ExternalLink,
  ChevronRight,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterOverview } from './MasterOverview';
import { RestaurantsList } from './RestaurantsList';
import { OnboardWizard } from './OnboardWizard';
import { PlansTab } from './PlansTab';
import { RevenueTab } from './RevenueTab';
import { ActivityFeed } from './ActivityFeed';
import { GlobalCustomersDirectory } from './GlobalCustomersDirectory';
import { BillAuditQueue } from './BillAuditQueue';
import { ModularPlanBuilder } from './ModularPlanBuilder';
import { MasterSettings } from './MasterSettings';

export type MasterTab =
  | 'overview'
  | 'restaurants'
  | 'customers'
  | 'audits'
  | 'plans'
  | 'revenue'
  | 'activity'
  | 'settings';

export const MasterLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { restaurants, activeRestaurant, setActiveRestaurantSlug } = useTenant();
  const [activeTab, setActiveTab] = useState<MasterTab>('overview');
  const [isOnboardOpen, setIsOnboardOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
    { id: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed, badge: restaurants.length },
    { id: 'customers', label: 'Global Diners CRM', icon: Users },
    { id: 'audits', label: 'Bill Audit Queue', icon: CreditCard },
    { id: 'plans', label: 'Modular Plans', icon: Layers },
    { id: 'revenue', label: 'Revenue & MRR', icon: TrendingUp },
    { id: 'activity', label: 'Live Global Feed', icon: Activity, live: true },
    { id: 'settings', label: 'Master SaaS Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        {/* Master Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-base shadow-lg shadow-emerald-500/20">
              E
            </div>
            <div>
              <div className="font-bold text-sm tracking-wider text-white">
                ENSEMBLE
              </div>
              <div className="text-[10px] text-emerald-400 font-mono tracking-tight">
                MASTER ADMIN PORTAL
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Onboard New Restaurant */}
        <div className="p-3">
          <button
            onClick={() => setIsOnboardOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Restaurant</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-300">
            Platform Command
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as MasterTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.live ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ) : item.badge !== undefined ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Master User & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-white font-semibold">
              <span>{user?.name || 'Platform Admin'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              {user?.email || 'admin@ensemble.com'}
            </div>
          </div>
          <button
            onClick={() => logout('/master/login')}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Master Screen Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/95 overflow-y-auto">
        {/* Master Header */}
        <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Multi-Tenant Architecture
              </span>
              <span className="text-xs text-slate-400">
                {restaurants.length} Registered Tenants
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1 capitalize">
              {activeTab === 'overview' ? 'SaaS Executive Overview' : activeTab}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Direct Restaurant Quick Link */}
            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">Tenant:</span>
              <select
                value={activeRestaurant.slug}
                onChange={(e) => setActiveRestaurantSlug(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.slug} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => window.open(`/${activeRestaurant.slug}/t/1`, '_blank')}
                className="ml-1 p-1 hover:text-emerald-400 transition"
                title="Open Public Customer Site"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsOnboardOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Tenant</span>
            </button>

            <button
              onClick={() => logout('/master/login')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-400 text-xs font-semibold flex items-center space-x-1.5 transition"
              title="Sign Out of Master Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Tabs */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <MasterOverview
              onNavigate={setActiveTab}
              onOpenOnboard={() => setIsOnboardOpen(true)}
            />
          )}
          {activeTab === 'restaurants' && (
            <RestaurantsList onOpenOnboard={() => setIsOnboardOpen(true)} />
          )}
          {activeTab === 'customers' && <GlobalCustomersDirectory />}
          {activeTab === 'audits' && <BillAuditQueue />}
          {activeTab === 'plans' && <ModularPlanBuilder />}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'activity' && <ActivityFeed />}
          {activeTab === 'settings' && <MasterSettings />}
        </main>
      </div>

      {/* 7-Step Onboarding Modal */}
      {isOnboardOpen && <OnboardWizard onClose={() => setIsOnboardOpen(false)} />}
    </div>
  );
};
