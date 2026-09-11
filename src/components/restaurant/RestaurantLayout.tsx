import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
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
  LogOut,
  Shield,
  UserCheck,
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
import { StaffTab } from './StaffTab';
import { LockedFeatureBanner } from './LockedFeatureBanner';

export type RestaurantTab =
  | 'overview'
  | 'staff'
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
  const { user, logout, getStaffForRestaurant } = useAuth();
  const {
    activeRestaurant,
    activeSocialSubmissions,
    activeReviews,
    setActiveRestaurantSlug,
    restaurants,
  } = useTenant();

  const [activeTab, setActiveTab] = useState<RestaurantTab>('overview');

  // Enforce restaurant isolation: if user is bound to a restaurant, ensure active tenant matches
  useEffect(() => {
    if (user?.restaurantSlug && user.restaurantSlug !== activeRestaurant.slug) {
      setActiveRestaurantSlug(user.restaurantSlug);
    } else if (user?.restaurantId && user.restaurantId !== activeRestaurant.id) {
      const match = restaurants.find((r) => r.id === user.restaurantId);
      if (match) {
        setActiveRestaurantSlug(match.slug);
      }
    }
  }, [user, activeRestaurant, restaurants, setActiveRestaurantSlug]);

  const pendingSocialCount = activeSocialSubmissions.filter((s) => s.status === 'pending').length;
  const staffMembers = user?.restaurantId ? getStaffForRestaurant(user.restaurantId) : [];
  const captainCount = staffMembers.filter((s) => s.role === 'captain').length;

  const menuItems = [
    { id: 'overview', label: 'Dashboard & Operations', icon: LayoutDashboard },
    { id: 'staff', label: 'Staff & Captains', icon: Users, badge: captainCount || undefined },
    { id: 'customers', label: 'Customers', icon: Users, badge: 'Master' },
    { id: 'visits', label: 'Visits', icon: Eye },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: activeReviews.length || undefined },
    { id: 'rewards', label: 'Spin Rewards', icon: Gift },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'social', label: 'Social Posts', icon: Share2, badge: pendingSocialCount || undefined, alert: pendingSocialCount > 0 },
    { id: 'menu', label: 'Menu', icon: BookOpen },
    { id: 'tables', label: 'Tables & QR', icon: QrCode },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'settings', label: 'Settings & Branding', icon: Settings },
  ];

  const handleOpenLiveCustomerSite = () => {
    window.open(`/${activeRestaurant.slug}/t/1`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        {/* Restaurant Header in Sidebar */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-lg text-white shrink-0 shadow-md"
              style={{ backgroundColor: activeRestaurant.branding?.primaryColor || '#d97706' }}
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

          {/* Direct Link to Live Customer Experience */}
          <button
            onClick={handleOpenLiveCustomerSite}
            className="w-full mt-3 py-1.5 px-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-slate-700"
          >
            <span>Live Customer View</span>
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

        {/* Authenticated User Footer & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-white text-xs font-semibold truncate">
                  {user?.name || 'Restaurant Admin'}
                </div>
                <div className="text-[10px] text-amber-400 uppercase font-mono tracking-wider">
                  {user?.role || 'OWNER'}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout('/restaurant/login')}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-800/60">
            <span>Plan: {activeRestaurant.plan}</span>
            <span className="text-emerald-400 font-mono">Isolated Scope</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-900 capitalize">
              {activeTab === 'social'
                ? 'Social Posts Moderation'
                : activeTab === 'staff'
                ? 'Staff & Captains'
                : activeTab}
            </h1>
            <p className="text-xs text-slate-500">
              Live management portal for {activeRestaurant.name}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenLiveCustomerSite}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-300"
            >
              <span>Customer Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={() => logout('/restaurant/login')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-6 bg-slate-50/70">
          {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
          {activeTab === 'staff' && <StaffTab />}
          {activeTab === 'customers' && <CustomersTab />}
          {activeTab === 'visits' && <VisitsTab />}
          {activeTab === 'reviews' && <ReviewsTab />}

          {/* Gated Feature Checks */}
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
