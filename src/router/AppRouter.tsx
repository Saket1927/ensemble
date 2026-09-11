import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { MasterLogin } from '../components/auth/MasterLogin';
import { RestaurantLogin } from '../components/auth/RestaurantLogin';
import { CaptainLogin } from '../components/auth/CaptainLogin';
import { MasterLayout } from '../components/master/MasterLayout';
import { RestaurantLayout } from '../components/restaurant/RestaurantLayout';
import { CaptainLayout } from '../components/captain/CaptainLayout';
import { CustomerLayout } from '../components/customer/CustomerLayout';
import { Shield, UtensilsCrossed, Bell, ExternalLink, ArrowRight } from 'lucide-react';

export const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { restaurants, setActiveRestaurantSlug, setActiveTable, activeRestaurantSlug, ensureRestaurantExists } = useTenant();

  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono tracking-wider">AUTHENTICATING ENSEMBLE PLATFORM...</span>
      </div>
    );
  }

  const cleanPath = currentPath.toLowerCase();

  // 1. MASTER LOGIN ROUTE
  if (cleanPath === '/master/login') {
    if (user?.role === 'master_admin') {
      navigate('/master');
      return null;
    }
    return <MasterLogin onNavigate={navigate} />;
  }

  // 2. MASTER DASHBOARD ROUTE (Protected)
  if (cleanPath === '/master' || cleanPath.startsWith('/master/')) {
    if (!user) {
      return <MasterLogin onNavigate={navigate} />;
    }
    if (user.role !== 'master_admin') {
      // Reject non-master user
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Access Denied: Master Authorization Required</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Your account ({user.name} • {user.role}) does not have Master Admin credentials.
          </p>
          <button
            onClick={() => {
              if (user.role === 'captain') navigate('/captain');
              else navigate('/restaurant');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
          >
            Go to Your Authorized Dashboard &rarr;
          </button>
        </div>
      );
    }
    return <MasterLayout />;
  }

  // 3. RESTAURANT LOGIN ROUTE
  if (cleanPath === '/restaurant/login') {
    if (user && (user.role === 'owner' || user.role === 'manager')) {
      navigate('/restaurant');
      return null;
    }
    return <RestaurantLogin onNavigate={navigate} />;
  }

  // 4. RESTAURANT ADMIN ROUTE (Protected)
  if (cleanPath === '/restaurant' || cleanPath.startsWith('/restaurant/')) {
    if (!user) {
      return <RestaurantLogin onNavigate={navigate} />;
    }
    if (user.role !== 'owner' && user.role !== 'manager') {
      // Reject non-restaurant user
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Access Denied: Restaurant Admin Only</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Your current account role is "{user.role}". Floor captains must use the Captain Terminal.
          </p>
          <button
            onClick={() => {
              if (user.role === 'captain') navigate('/captain');
              else navigate('/master');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
          >
            Go to Your Authorized Dashboard &rarr;
          </button>
        </div>
      );
    }
    return <RestaurantLayout />;
  }

  // 5. CAPTAIN LOGIN ROUTE
  if (cleanPath === '/captain/login') {
    if (user?.role === 'captain') {
      navigate('/captain');
      return null;
    }
    return <CaptainLogin onNavigate={navigate} />;
  }

  // 6. CAPTAIN FLOOR ROUTE (Protected)
  if (cleanPath === '/captain' || cleanPath.startsWith('/captain/')) {
    if (!user) {
      return <CaptainLogin onNavigate={navigate} />;
    }
    if (user.role !== 'captain') {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
            <Bell className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Floor Duty Restricted: Captains Only</h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            You are logged in as {user.role}. This terminal is reserved for dining room service captains.
          </p>
          <button
            onClick={() => {
              if (user.role === 'master_admin') navigate('/master');
              else navigate('/restaurant');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
          >
            Go to Your Authorized Dashboard &rarr;
          </button>
        </div>
      );
    }
    return <CaptainLayout />;
  }

  // 7. PUBLIC CUSTOMER RESTAURANT EXPERIENCE (/:restaurantSlug or /:restaurantSlug/t/:tableNumber)
  // Match path pattern: /:slug or /:slug/t/:tableNumber
  const RESERVED_PREFIXES = ['master', 'restaurant', 'captain', 'api', 'auth', 'login', 'admin', 'preview'];
  const pathParts = cleanPath.split('/').filter(Boolean);
  if (pathParts.length > 0 && !RESERVED_PREFIXES.includes(pathParts[0])) {
    const candidateSlug = pathParts[0];
    let matchedRestaurant = restaurants.find((r) => r.slug.toLowerCase() === candidateSlug);

    // If not found in current browser localStorage (e.g. guest scanning on phone), auto-provision
    if (!matchedRestaurant && ensureRestaurantExists) {
      matchedRestaurant = ensureRestaurantExists(candidateSlug);
    }

    if (matchedRestaurant) {
      // Sync tenant context to this restaurant
      if (activeRestaurantSlug !== matchedRestaurant.slug) {
        setActiveRestaurantSlug(matchedRestaurant.slug);
      }

      // Check table number in path (e.g. /radha/t/1)
      if (pathParts[1] === 't' && pathParts[2]) {
        const tableNum = parseInt(pathParts[2], 10);
        if (!isNaN(tableNum) && tableNum > 0) {
          setActiveTable(tableNum);
        }
      }

      return (
        <div className="min-h-screen bg-slate-950 flex justify-center">
          <div className="w-full max-w-md min-h-screen bg-[#fbf9f5] shadow-2xl flex flex-col relative">
            <CustomerLayout />
          </div>
        </div>
      );
    }
  }

  // 8. ROOT (/) LANDING & PORTAL HUB
  // If user is already authenticated, redirect to their role-specific dashboard
  if (user) {
    if (user.role === 'master_admin') {
      navigate('/master');
      return null;
    }
    if (user.role === 'owner' || user.role === 'manager') {
      navigate('/restaurant');
      return null;
    }
    if (user.role === 'captain') {
      navigate('/captain');
      return null;
    }
  }

  // Root Portal Landing Page with luxury SaaS design and direct entry into all 4 experiences
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#0c0f17] text-slate-100 flex flex-col justify-between font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            E
          </div>
          <div>
            <span className="font-bold text-base tracking-wider text-white font-serif">ENSEMBLE</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-slate-900 rounded border border-slate-800">
              Enterprise Restaurant SaaS
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/master/login')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            Master Sign In
          </button>
        </div>
      </header>

      {/* Hero Body */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-400 font-mono mx-auto mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PRODUCTION PLATFORM • REAL MULTI-TENANT ISOLATION</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-serif max-w-3xl mx-auto leading-tight">
          Next-Generation Hospitality Operating System
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Four distinct authenticated operating layers powering modern restaurants: Master Admin Control, Restaurant Management, Service Captain Terminals, and Luxury Branded Diner Experiences.
        </p>

        {/* 4 Experience Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 text-left">
          {/* 1. Master Admin */}
          <div
            onClick={() => navigate('/master/login')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Layer 1</div>
            <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-emerald-400 transition">
              Master Admin
            </h3>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Global platform control center. Onboard restaurants, manage subscription tiers, staff access, and cross-chain analytics.
            </p>
            <div className="mt-4 text-xs font-semibold text-emerald-400 flex items-center space-x-1">
              <span>Enter Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Restaurant Admin */}
          <div
            onClick={() => navigate('/restaurant/login')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Layer 2</div>
            <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-amber-400 transition">
              Restaurant Admin
            </h3>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Dedicated partner console for Owners and Managers. Create Captains, menus, tables, spin rewards, and monitor live revenue.
            </p>
            <div className="mt-4 text-xs font-semibold text-amber-400 flex items-center space-x-1">
              <span>Enter Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Captain Terminal */}
          <div
            onClick={() => navigate('/captain/login')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">Layer 3</div>
            <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-amber-300 transition">
              Captain Floor Terminal
            </h3>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              High-speed touch station for floor captains. Live order queue, prep timers, customer additions, oral orders, and bill requests.
            </p>
            <div className="mt-4 text-xs font-semibold text-amber-300 flex items-center space-x-1">
              <span>Enter Terminal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Customer Experience */}
          <div
            onClick={() => navigate('/heritage/t/1')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400">Layer 4</div>
            <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-teal-400 transition">
              Customer Experience
            </h3>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Public QR-driven dining web app. Heritage branding, food photography, multi-person open tabs, spin & win, and call captain.
            </p>
            <div className="mt-4 text-xs font-semibold text-teal-400 flex items-center space-x-1">
              <span>Open Heritage Table 1</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-500">
        ENSEMBLE Hospitality OS • Production Multi-Tenant Architecture
      </footer>
    </div>
  );
};
