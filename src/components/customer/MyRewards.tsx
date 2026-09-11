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
import { StandardQRCode } from '../common/StandardQRCode';

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
  const queuedCoupons = myCoupons.filter((c) => c.slot === 'queued' && c.status === 'held');
  const pastCoupons = myCoupons.filter((c) => c.status === 'redeemed' || c.status === 'expired');

  const isActiveExpired = activeCoupon?.expiresAt && !isNaN(Date.parse(activeCoupon.expiresAt))
    ? new Date(activeCoupon.expiresAt).getTime() < Date.now()
    : false;

  const daysLeft = activeCoupon?.expiresAt && !isNaN(Date.parse(activeCoupon.expiresAt))
    ? Math.max(0, Math.ceil((new Date(activeCoupon.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 20;

  return (
    <div className="space-y-5 px-4 pt-2 animate-fade-in pb-24">
      {/* Header */}
      <div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest block"
          style={{ color: secondaryColor }}
        >
          Customer Privileges & Rewards
        </span>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          My Privileges Wallet
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          1 active voucher usable per visit. Additional earned rewards are reserved for your next visits.
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

      {/* 1-Active-Coupon Rule Engine */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>Active Table Voucher (Usable Today)</span>
          <span className="text-[10px] font-bold text-slate-500">
            {activeCoupon ? '1 Active Voucher' : '0 Active'}
          </span>
        </h3>

        {/* Slot: Active Coupon (Usable Now) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isActiveExpired
                ? 'bg-rose-100 text-rose-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isActiveExpired ? 'Voucher Expired' : 'Active Voucher (Redeemable Today)'}
            </span>
            {activeCoupon && (
              <button
                onClick={() => deleteCoupon(activeCoupon.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Discard voucher"
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
              <div className={`flex items-center space-x-1 text-[11px] p-2 rounded-xl ${
                isActiveExpired ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-600'
              }`}>
                <Clock className={`w-3.5 h-3.5 ${isActiveExpired ? 'text-rose-600' : 'text-amber-600'}`} />
                <span>
                  {isActiveExpired ? (
                    <strong>Expired (exceeded 20-day limit)</strong>
                  ) : (
                    <>Validity: <strong className="text-slate-900">{daysLeft} days remaining</strong> (20 days from activation)</>
                  )}
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

                {!isActiveExpired ? (
                  <button
                    onClick={() => setSelectedVoucherForQr(activeCoupon)}
                    className="py-1.5 px-3 rounded-lg text-xs font-bold text-white shadow transition-transform active:scale-95 flex items-center space-x-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Show QR at Billing</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-rose-600 px-2 py-1 bg-rose-50 rounded-lg">
                    Expired
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-slate-400 text-xs">
              <p className="font-semibold">No active voucher for current table</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Spin the wheel or leave a 5-star review to unlock an instant discount.
              </p>
            </div>
          )}
        </div>

        {/* Next-Visit Queued Rewards List */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Next-Visit Rewards ({queuedCoupons.length})</span>
            <span className="text-[10px] text-slate-500 font-medium">
              Activates on your future visits
            </span>
          </h3>

          {queuedCoupons.length > 0 ? (
            queuedCoupons.map((queued) => (
              <div
                key={queued.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Next Visit Reward
                  </span>
                  <button
                    onClick={() => deleteCoupon(queued.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Discard reward"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-slate-900">
                      {queued.rewardLabel}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Source: {queued.source.replace(/_/g, ' ').toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-700">
                      {queued.discountType === 'percentage'
                        ? `${queued.discountValue}% OFF`
                        : `₹${queued.discountValue} OFF`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>20-day validity starts fresh when activated on your next dining visit</span>
                </div>

                {!activeCoupon && (
                  <button
                    onClick={() => activateQueuedCoupon(queued.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Activate for Current Table Now
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-4 border border-dashed border-slate-300 text-center text-slate-400 text-xs">
              <p className="font-semibold">No queued next-visit rewards yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Post an Instagram story or photo to earn an exclusive next-visit dining reward!
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

            {/* Genuine Machine-Readable Voucher QR Code */}
            <div className="bg-white p-3 rounded-2xl border-2 border-slate-900 inline-block shadow-lg">
              <StandardQRCode
                url={selectedVoucherForQr.voucherCode}
                size={180}
                showVerifiedBadge={true}
                errorCorrectionLevel="Q"
              />
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
