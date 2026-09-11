import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Gift,
  QrCode,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  ChevronRight,
  ShieldCheck,
  Share2,
  Trash2,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import { UnifiedCoupon } from '../../types/tenant';

interface MyRewardsProps {
  onOpenSpin: () => void;
  onOpenEarnMore: () => void;
}

export const MyRewards: React.FC<MyRewardsProps> = ({ onOpenSpin, onOpenEarnMore }) => {
  const {
    activeRestaurant,
    unifiedCoupons,
    deleteCoupon,
    activateQueuedCoupon,
    canSpin,
    activeTable,
    customerSession,
  } = useTenant();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedVoucherForQr, setSelectedVoucherForQr] = useState<UnifiedCoupon | null>(null);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter coupons for this restaurant and current customer
  const phone = customerSession?.phone || '+91 98200 11223';
  const myCoupons = unifiedCoupons.filter(
    (c) => c.restaurantId === activeRestaurant.id && (c.customerPhone === phone || c.customerPhone === 'Guest')
  );

  const activeCoupon = myCoupons.find((c) => c.slot === 'active' && c.status === 'held');
  const queuedCoupon = myCoupons.find((c) => c.slot === 'queued' && c.status === 'held');
  const pastCoupons = myCoupons.filter((c) => c.status === 'redeemed' || c.status === 'expired');

  return (
    <div className="space-y-5 px-4 pt-2 animate-fade-in pb-24">
      {/* Header */}
      <div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest block"
          style={{ color: secondaryColor }}
        >
          Section 13: Unified 2-Coupon Engine
        </span>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          My Privileges Wallet
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Hold up to 2 coupons at a time (1 active for now, 1 queued for your next visit).
        </p>
      </div>

      {/* Spin Banner if Spin is available */}
      {canSpin && (
        <div
          onClick={onOpenSpin}
          className="cursor-pointer p-3.5 rounded-2xl border text-white flex items-center justify-between shadow-md group transition"
          style={{
            backgroundColor: primaryColor,
            borderColor: `${secondaryColor}80`,
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-amber-300 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-200">
                Spin & Win Unlocked
              </div>
              <div className="text-[11px] text-slate-200">
                You have a spin waiting to be claimed!
              </div>
            </div>
          </div>
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm"
            style={{ backgroundColor: secondaryColor }}
          >
            Spin Now
          </span>
        </div>
      )}

      {/* 2-Coupon Holding Slots (Section 13) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>Held Coupons (Max 2 Slots)</span>
          <span className="text-[10px] font-bold text-slate-500">
            {(activeCoupon ? 1 : 0) + (queuedCoupon ? 1 : 0)} / 2 Slots Occupied
          </span>
        </h3>

        {/* Slot 1: Active Coupon (Usable Now) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Slot 1: Active (Usable Now)
            </span>
            {activeCoupon && (
              <button
                onClick={() => deleteCoupon(activeCoupon.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Manually delete coupon anytime"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {activeCoupon ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    {activeCoupon.rewardLabel}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Source: {activeCoupon.source.replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-amber-700">
                    {activeCoupon.discountType === 'percentage'
                      ? `${activeCoupon.discountValue}% OFF`
                      : `₹${activeCoupon.discountValue} OFF`}
                  </span>
                </div>
              </div>

              {/* 20-day clock expiry tracker */}
              <div className="flex items-center space-x-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Expires: <strong className="text-slate-900">20 days from activation</strong>
                </span>
              </div>

              {/* Code & QR Trigger */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleCopy(activeCoupon.voucherCode)}
                  className="font-mono font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-lg flex items-center space-x-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copiedCode === activeCoupon.voucherCode ? 'Copied ✓' : activeCoupon.voucherCode}</span>
                </button>

                <button
                  onClick={() => setSelectedVoucherForQr(activeCoupon)}
                  className="py-1.5 px-3 rounded-lg text-xs font-bold text-white shadow transition-transform active:scale-95 flex items-center space-x-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Show QR at Billing</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-slate-400 text-xs">
              <p className="font-semibold">Empty Active Slot</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Spin the wheel or leave a review to unlock an instant discount.
              </p>
            </div>
          )}
        </div>

        {/* Slot 2: Queued Coupon (Next Visit) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Slot 2: Queued (Next Visit)
            </span>
            {queuedCoupon && (
              <button
                onClick={() => deleteCoupon(queuedCoupon.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Manually delete coupon anytime"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {queuedCoupon ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    {queuedCoupon.rewardLabel}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Source: {queuedCoupon.source.replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-slate-700">
                    {queuedCoupon.discountType === 'percentage'
                      ? `${queuedCoupon.discountValue}% OFF`
                      : `₹${queuedCoupon.discountValue} OFF`}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>20-day expiry clock starts fresh upon activation on your next visit</span>
              </div>

              {!activeCoupon && (
                <button
                  onClick={() => activateQueuedCoupon(queuedCoupon.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Activate for Current Table Now
                </button>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-slate-400 text-xs">
              <p className="font-semibold">Empty Queued Slot</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Share on Instagram to earn a next-visit voucher reward.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Earn More Rewards Section */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
        <h4 className="text-xs font-bold text-slate-900">Ways to Unlock Rewards</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">5★ Review</span>
            <span className="text-[10px] text-slate-500">Unlocks an instant Spin & Win</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">Instagram Share</span>
            <span className="text-[10px] text-slate-500">Next-visit collaborator reward</span>
          </div>
        </div>
        <button
          onClick={onOpenEarnMore}
          className="w-full py-2 text-center text-xs font-bold text-amber-800 underline"
        >
          View Social Rewards & Collaboration →
        </button>
      </div>

      {/* Digital QR Modal For Steward Validation */}
      {selectedVoucherForQr && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Billing Verification
              </span>
              <button onClick={() => setSelectedVoucherForQr(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-serif font-bold text-lg text-slate-900">
              {selectedVoucherForQr.rewardLabel}
            </h3>

            {/* High-Contrast Luxury QR Code Presentation */}
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 inline-block shadow-lg">
              <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto">
                <rect width="100" height="100" fill="#ffffff" />
                {/* Corner Markers */}
                <rect x="5" y="5" width="25" height="25" fill="#162c21" />
                <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="13" width="9" height="9" fill="#162c21" />

                <rect x="70" y="5" width="25" height="25" fill="#162c21" />
                <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                <rect x="78" y="13" width="9" height="9" fill="#162c21" />

                <rect x="5" y="70" width="25" height="25" fill="#162c21" />
                <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                <rect x="13" y="78" width="9" height="9" fill="#162c21" />

                {/* Pattern Data Grid */}
                <rect x="36" y="8" width="5" height="10" fill="#162c21" />
                <rect x="46" y="8" width="8" height="5" fill="#162c21" />
                <rect x="40" y="22" width="18" height="5" fill="#162c21" />
                <rect x="8" y="38" width="8" height="18" fill="#162c21" />
                <rect x="22" y="44" width="12" height="6" fill="#162c21" />
                <rect x="40" y="40" width="20" height="20" fill="#c5a96d" />
                <rect x="68" y="38" width="10" height="8" fill="#162c21" />
                <rect x="82" y="44" width="10" height="18" fill="#162c21" />
                <rect x="38" y="68" width="14" height="6" fill="#162c21" />
                <rect x="58" y="74" width="16" height="14" fill="#162c21" />
                <rect x="78" y="68" width="14" height="8" fill="#162c21" />
              </svg>
            </div>

            <div className="bg-slate-50 p-2 rounded-xl font-mono text-xs font-bold text-slate-800">
              VOUCHER CODE: {selectedVoucherForQr.voucherCode}
            </div>

            <p className="text-[11px] text-slate-500">
              SHOW THIS QR CODE AT BILLING. Captain or manager will scan via their Captain Console to apply the discount to Table {activeTable}'s final tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
