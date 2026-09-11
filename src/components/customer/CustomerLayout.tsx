import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Home,
  BookOpen,
  Star,
  Gift,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { CustomerHome } from './CustomerHome';
import { CustomerMenu } from './CustomerMenu';
import { CustomerReviews } from './CustomerReviews';
import { MyRewards } from './MyRewards';
import { SocialRewards } from './SocialRewards';
import { SpinWheelModal } from './SpinWheelModal';
import { ReferralModal } from './ReferralModal';
import { GeofenceModal } from './GeofenceModal';
import { MandatoryIdentityModal } from './MandatoryIdentityModal';
import { OpenTabDrawer } from './OpenTabDrawer';
import { BillUploadModal } from './BillUploadModal';
import { InstagramCameraModal } from './InstagramCameraModal';

export const CustomerLayout: React.FC = () => {
  const {
    activeRestaurant,
    activeTable,
    customerActiveTab,
    setCustomerActiveTab,
    customerWallet,
    canSpin,
    unlockedExtraSpins,
  } = useTenant();

  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isBillUploadModalOpen, setIsBillUploadModalOpen] = useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;
  const accentColor = activeRestaurant.branding.accentColor;

  const activeVouchersCount = customerWallet.filter((w) => w.status === 'active').length;

  return (
    <div
      className="min-h-full flex flex-col justify-between text-[#1c1c1c] font-sans antialiased"
      style={{ backgroundColor: accentColor || '#fbf9f5' }}
    >
      {/* 150m GPS Fraud Verification Modal (Section 5.1) */}
      <GeofenceModal />

      {/* Mandatory Name + Phone Capture (Section 5.2 & 5.3) */}
      <MandatoryIdentityModal onSuccess={() => {}} />

      {/* Luxury Brand Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b transition-colors shadow-sm"
        style={{
          backgroundColor: primaryColor,
          borderColor: `${secondaryColor}30`,
        }}
      >
        {/* Brand Logo / Title */}
        <div className="flex items-center space-x-2">
          {activeRestaurant.branding.logoUrl ? (
            <img
              src={activeRestaurant.branding.logoUrl}
              alt={activeRestaurant.name}
              className="h-9 max-w-[140px] sm:max-w-[170px] object-contain rounded"
            />
          ) : (
            <div className="font-serif font-bold text-white tracking-widest text-lg">
              {activeRestaurant.name}
            </div>
          )}
        </div>

        {/* Right Info: Table Badge & Spin CTA */}
        <div className="flex items-center space-x-2">
          {/* Table Pill */}
          <div
            className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border flex items-center space-x-1"
            style={{
              backgroundColor: `${secondaryColor}20`,
              borderColor: secondaryColor,
              color: secondaryColor,
            }}
          >
            <span>Table {activeTable}</span>
          </div>

          {/* Quick Spin Trigger if available */}
          {canSpin && (
            <button
              onClick={() => setIsSpinModalOpen(true)}
              className="relative p-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:scale-105 transition-transform"
              title="Spin to Win Available!"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content View by Active Tab */}
      <main className="flex-1 pb-24">
        {customerActiveTab === 'home' && (
          <CustomerHome
            onOpenMenu={() => setCustomerActiveTab('menu')}
            onOpenReview={() => setCustomerActiveTab('reviews')}
            onOpenRewards={() => setCustomerActiveTab('rewards')}
            onOpenSocial={() => setCustomerActiveTab('social')}
            onOpenSpin={() => setIsSpinModalOpen(true)}
            onOpenReferral={() => setIsReferralModalOpen(true)}
            onOpenBillUpload={() => setIsBillUploadModalOpen(true)}
            onOpenInstagramCamera={() => setIsInstagramModalOpen(true)}
          />
        )}

        {customerActiveTab === 'menu' && <CustomerMenu />}

        {customerActiveTab === 'reviews' && (
          <CustomerReviews onReviewSubmitted={() => setIsSpinModalOpen(true)} />
        )}

        {customerActiveTab === 'rewards' && (
          <MyRewards
            onOpenSpin={() => setIsSpinModalOpen(true)}
            onOpenEarnMore={() => setCustomerActiveTab('social')}
          />
        )}

        {customerActiveTab === 'social' && (
          <SocialRewards onOpenSpin={() => setIsSpinModalOpen(true)} />
        )}
      </main>

      {/* Luxury Bottom Tab Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg px-2 py-1.5 transition-all max-w-md mx-auto"
        style={{
          borderTopColor: `${secondaryColor}40`,
        }}
      >
        <div className="flex items-center justify-around">
          <button
            onClick={() => setCustomerActiveTab('home')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all ${
              customerActiveTab === 'home' ? 'font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            style={{
              color: customerActiveTab === 'home' ? primaryColor : undefined,
            }}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-wide uppercase">Home</span>
          </button>

          <button
            onClick={() => setCustomerActiveTab('menu')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all ${
              customerActiveTab === 'menu' ? 'font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            style={{
              color: customerActiveTab === 'menu' ? primaryColor : undefined,
            }}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-wide uppercase">Menu</span>
          </button>

          {/* Spin Wheel Center Action Button */}
          <button
            onClick={() => setIsSpinModalOpen(true)}
            className="relative -mt-5 flex flex-col items-center group"
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-transform group-hover:scale-105"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 14px ${primaryColor}60`,
              }}
            >
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5 text-slate-800">
              Spin & Win
            </span>
            {canSpin && (
              <span className="absolute top-0 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />
            )}
          </button>

          <button
            onClick={() => setCustomerActiveTab('reviews')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-all ${
              customerActiveTab === 'reviews' ? 'font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            style={{
              color: customerActiveTab === 'reviews' ? primaryColor : undefined,
            }}
          >
            <Star className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-wide uppercase">Reviews</span>
          </button>

          <button
            onClick={() => setCustomerActiveTab('rewards')}
            className={`relative flex flex-col items-center py-1 px-2 rounded-lg transition-all ${
              customerActiveTab === 'rewards' ? 'font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            style={{
              color: customerActiveTab === 'rewards' ? primaryColor : undefined,
            }}
          >
            <Gift className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-wide uppercase">Rewards</span>
            {activeVouchersCount > 0 && (
              <span
                className="absolute top-0 right-1 px-1 min-w-[14px] h-[14px] rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ backgroundColor: secondaryColor || '#c5a96d' }}
              >
                {activeVouchersCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Modals */}
      {isSpinModalOpen && (
        <SpinWheelModal
          onClose={() => setIsSpinModalOpen(false)}
          onRewardWon={() => {
            setCustomerActiveTab('rewards');
          }}
        />
      )}

      {isReferralModalOpen && (
        <ReferralModal onClose={() => setIsReferralModalOpen(false)} />
      )}

      {/* Live Open Tab Drawer (Section 7, 8, 9, 10) - Gated by plan features */}
      {activeRestaurant.planFeatures?.ordering !== false && (
        <OpenTabDrawer onOpenMenuToAdd={() => setCustomerActiveTab('menu')} />
      )}

      {/* Independent Master Admin Bill Upload (Section 8a) */}
      {isBillUploadModalOpen && (
        <BillUploadModal onClose={() => setIsBillUploadModalOpen(false)} />
      )}

      {/* Camera-First Instagram Rewards Modal */}
      <InstagramCameraModal
        isOpen={isInstagramModalOpen}
        onClose={() => setIsInstagramModalOpen(false)}
        onOpenSpin={() => setIsSpinModalOpen(true)}
      />
    </div>
  );
};
