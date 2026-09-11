import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  LayoutDashboard,
  Users,
  Eye,
  Star,
  Gift,
  Tag,
  Share2,
  BookOpen,
  QrCode,
  Megaphone,
  Settings,
  ExternalLink,
  ChevronDown,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { OverviewTab } from './OverviewTab';
import { CustomersTab } from './CustomersTab';
import { VisitsTab } from './VisitsTab';
import { ReviewsTab } from './ReviewsTab';
import { RewardsConfigTab } from './RewardsConfigTab';
import { OffersTab } from './OffersTab';
import { SocialModerationTab } from './SocialModerationTab';
import { MenuManagementTab } from './MenuManagementTab';
import { TablesQrTab } from './TablesQrTab';
import { CampaignsTab } from './CampaignsTab';
import { SettingsTab } from './SettingsTab';
import { LockedFeatureBanner } from './LockedFeatureBanner';
import { StaffRole } from '../../types/captain';

export type RestaurantTab =
  | 'overview'
  | 'customers'
  | 'visits'
  | 'reviews'
  | 'rewards'
  | 'offers'
  | 'social'
  | 'menu'
  | 'tables'
  | 'campaigns'
  | 'settings';

export const RestaurantLayout: React.FC = () => {
  const {
    activeRestaurant,
    activeSocialSubmissions,
    activeReviews,
    setRole,
    staffRole,
    setStaffRole,
    restaurants,
    setActiveRestaurantSlug,
  } = useTenant();

  const [activeTab, setActiveTab] = useState<RestaurantTab>('overview');
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState<boolean>(false);

  const pendingSocialCount = activeSocialSubmissions.filter((s) => s.status === 'pending').length;

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users, badge: 'Master' },
    { id: 'visits', label: 'Visits', icon: Eye },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: activeReviews.length },
    { id: 'rewards', label: 'Spin Rewards', icon: Gift },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'social', label: 'Social Posts', icon: Share2, badge: pendingSocialCount || undefined, alert: pendingSocialCount > 0 },
    { id: 'menu', label: 'Menu', icon: BookOpen },
    { id: 'tables', label: 'Tables & QR', icon: QrCode },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'settings', label: 'Settings & Branding', icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-100 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        {/* Restaurant Header in Sidebar */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-lg text-white shrink-0 shadow-md"
              style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
            >
              {activeRestaurant.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm truncate">
                {activeRestaurant.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono">{activeRestaurant.slug}.ensemble.com</span>
              </div>
            </div>
          </div>

          {/* Quick Preview Customer Site Button */}
          <button
            onClick={() => setRole('customer')}
            className="w-full mt-3 py-1.5 px-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-slate-700"
          >
            <span>Open Customer Experience</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Restaurant Management
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as RestaurantTab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-amber-600/90 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.alert
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-amber-800 text-amber-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Staff Role Switcher (Section 4) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Staff Role:</span>
            <span className="text-amber-400 font-bold uppercase tracking-wider">
              {staffRole}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
            {(['owner', 'manager', 'captain'] as StaffRole[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setStaffRole(r);
                  if (r === 'captain') {
                    setRole('captain');
                  }
                }}
                className={`py-1 rounded capitalize transition ${
                  staffRole === r
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1">
            <span>Plan: {activeRestaurant.plan}</span>
            <span className="text-emerald-400">Isolated Tenant</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-900 capitalize">
              {activeTab === 'social' ? 'Social Posts Moderation' : activeTab}
            </h1>
            <p className="text-xs text-slate-500">
              Live management portal for {activeRestaurant.name}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>3 Active Tables Right Now</span>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              title="Restaurant Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-50/70">
          {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'visits' && <VisitsTab />}
          {activeTab === 'reviews' && <ReviewsTab />}

          {/* Section 2: Gated Feature Checks */}
          {activeTab === 'rewards' && (
            activeRestaurant.planFeatures?.spinRewards !== false ? (
              <RewardsConfigTab />
            ) : (
              <LockedFeatureBanner
                featureName="Spin & Win Reward Engine"
                description="Your current plan tier does not include gamified canvas physics spin rewards. Upgrade to unlock customizable probability distribution, automatic vouchers, and 2-coupon wallet retention."
              />
            )
          )}

          {activeTab === 'offers' && <OffersTab />}

          {activeTab === 'social' && (
            activeRestaurant.planFeatures?.socialRewards !== false ? (
              <SocialModerationTab />
            ) : (
              <LockedFeatureBanner
                featureName="Instagram UGC & Social Moderation"
                description="Your current plan tier does not include Instagram screenshot moderation and collaborator rewards. Upgrade to unlock verified diner amplification and UGC review workflows."
              />
            )
          )}

          {activeTab === 'menu' && <MenuManagementTab />}
          {activeTab === 'tables' && <TablesQrTab />}
          {activeTab === 'campaigns' && <CampaignsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
};
