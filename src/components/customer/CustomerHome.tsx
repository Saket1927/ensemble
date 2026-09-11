import React from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  BookOpen,
  Star,
  Gift,
  Sparkles,
  Share2,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from '../common/BrandIcons';

interface CustomerHomeProps {
  onOpenMenu: () => void;
  onOpenReview: () => void;
  onOpenRewards: () => void;
  onOpenSocial: () => void;
  onOpenSpin: () => void;
  onOpenReferral: () => void;
  onOpenBillUpload?: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onOpenMenu,
  onOpenReview,
  onOpenRewards,
  onOpenSocial,
  onOpenSpin,
  onOpenReferral,
  onOpenBillUpload,
}) => {
  const { activeRestaurant, activeTable, activeReviews, canSpin } = useTenant();

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  // Average rating calculation
  const totalReviewsCount = activeReviews.length;
  const avgRating = totalReviewsCount > 0
    ? (activeReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
    : '4.9';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Hero Food Image & Welcome Section */}
      <div className="relative">
        <div className="relative h-64 sm:h-72 w-full overflow-hidden shadow-md">
          <img
            src={activeRestaurant.branding.heroImageUrl}
            alt={activeRestaurant.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Table pill inside hero */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-amber-200 border border-amber-300/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{activeRestaurant.name} • TABLE {activeTable}</span>
            </span>
          </div>

          {/* Hero text overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span
              className="text-xs uppercase font-bold tracking-widest text-amber-300/90 block mb-1"
              style={{ color: secondaryColor }}
            >
              {activeRestaurant.brandTitle}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              Welcome to {activeRestaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-light tracking-wide">
              {activeRestaurant.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Primary CTAs Section */}
      <div className="px-4 space-y-3">
        {/* Primary Large CTA: VIEW MENU */}
        <button
          onClick={onOpenMenu}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide text-white flex items-center justify-between shadow-lg transition-all transform active:scale-[0.99] group"
          style={{
            backgroundColor: primaryColor,
            boxShadow: `0 8px 20px -4px ${primaryColor}60`,
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/10 text-white group-hover:rotate-6 transition-transform">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>
            <div className="text-left">
              <div className="text-base font-bold text-white tracking-wider">VIEW MENU</div>
              <div className="text-[11px] text-white/70 font-normal">
                Explore signature dishes & chef curations
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-200 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Secondary Actions Row: LEAVE A REVIEW & MY REWARDS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenReview}
            className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 text-left shadow-sm transition-all hover:shadow-md group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Leave a Review
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Unlock a spin instantly
            </div>
          </button>

          <button
            onClick={onOpenRewards}
            className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 text-left shadow-sm transition-all hover:shadow-md group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor }}
            >
              <Gift className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              My Rewards
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              View 2-coupon wallet
            </div>
          </button>
        </div>

        {/* Section 8a: Upload Bill for Master Admin Audit */}
        {onOpenBillUpload && (
          <button
            onClick={onOpenBillUpload}
            className="w-full p-3 rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50 to-orange-50 hover:to-orange-100 flex items-center justify-between text-left shadow-sm transition-all group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-sm">
                🧾
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                  <span>Upload Paper Bill</span>
                  <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.2 rounded font-black uppercase">
                    Instant Scratch Card
                  </span>
                </div>
                <div className="text-[10px] text-amber-800/80">
                  Verify receipt with platform & win mystery 15-20% vouchers
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-800 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* 3. Spin & Win Banner (If spin available) */}
      {canSpin && (
        <div className="px-4">
          <div
            onClick={onOpenSpin}
            className="cursor-pointer p-4 rounded-2xl border text-white relative overflow-hidden shadow-md group transition-all"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #0e1d16 100%)`,
              borderColor: `${secondaryColor}60`,
            }}
          >
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/30">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Ready to Spin</span>
                </div>
                <div className="font-serif text-lg font-bold text-white tracking-wide">
                  Your Spin & Win is Ready
                </div>
                <div className="text-[11px] text-slate-300">
                  Win up to 20% OFF or complimentary dining treats
                </div>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-wider shadow-lg transform group-hover:scale-110 transition-transform shrink-0"
                style={{
                  backgroundColor: secondaryColor,
                  color: '#0e1d16',
                }}
              >
                SPIN
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Social Engagement: WANT ANOTHER SPIN? */}
      <div className="px-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: secondaryColor }}
              >
                Social Reward
              </span>
              <h2 className="font-serif text-base font-bold text-slate-900">
                Want Another Spin?
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Share your {activeRestaurant.name} experience on Instagram or WhatsApp, tag us, and unlock an extra reward spin!
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Share2 className="w-5 h-5" />
            </div>
          </div>

          <button
            onClick={onOpenSocial}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-900 border border-slate-300 hover:bg-slate-50 transition flex items-center justify-center space-x-2"
          >
            <span>Earn More Rewards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. Refer a Friend Card */}
      <div className="px-4">
        <div
          onClick={onOpenReferral}
          className="cursor-pointer bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between transition hover:bg-amber-50"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Refer a Friend
              </div>
              <div className="text-[11px] text-amber-800">
                Friend gets ₹200 OFF • You get 1 Extra Spin
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-700" />
        </div>
      </div>

      {/* 6. FOLLOW HERITAGE / SOCIAL HANDLES */}
      <div className="px-4 space-y-2.5">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>Follow {activeRestaurant.name}</span>
          <span className="text-[10px] text-slate-400 font-mono lowercase">
            {activeRestaurant.socials.instagram}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Instagram */}
          <a
            href={`https://instagram.com/${activeRestaurant.socials.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-700 hover:text-pink-600 hover:border-pink-300 transition shadow-sm"
          >
            <InstagramIcon className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-tight">Instagram</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${activeRestaurant.socials.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition shadow-sm"
          >
            <MessageCircle className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-tight">WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://facebook.com/${activeRestaurant.socials.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-300 transition shadow-sm"
          >
            <FacebookIcon className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-tight">Facebook</span>
          </a>

          {/* Phone Call */}
          <a
            href={`tel:${activeRestaurant.phone}`}
            className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-700 hover:text-amber-600 hover:border-amber-300 transition shadow-sm"
          >
            <Phone className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-medium tracking-tight">Call Us</span>
          </a>
        </div>
      </div>

      {/* 7. WHAT OUR GUESTS SAY */}
      <div className="px-4 space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest block"
              style={{ color: secondaryColor }}
            >
              Guest Experiences
            </span>
            <h2 className="font-serif text-lg font-bold text-slate-900">
              What Our Guests Say
            </h2>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-amber-500 font-bold text-sm">
              <span>{avgRating}</span>
              <div className="flex text-amber-400">
                {'★'.repeat(5)}
              </div>
            </div>
            <div className="text-[10px] text-slate-500">
              {totalReviewsCount} verified reviews
            </div>
          </div>
        </div>

        {/* Reviews Horizontal / Stacked Showcase */}
        <div className="space-y-3">
          {activeReviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 leading-tight">
                      {review.customerName}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <span>{review.date}</span>
                      {review.tableNumber && (
                        <>
                          <span>•</span>
                          <span>Table {review.tableNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex text-amber-400 text-xs">
                  {'★'.repeat(review.rating)}
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px] italic">
                "{review.comment}"
              </p>

              {review.photoUrl && (
                <div className="rounded-lg overflow-hidden h-28 w-full border border-slate-100">
                  <img
                    src={review.photoUrl}
                    alt="Guest dining review"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onOpenReview}
          className="w-full py-2.5 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl bg-white transition"
        >
          View All Reviews & Submit Yours
        </button>
      </div>

      {/* Restaurant Address & Footer Details */}
      <div className="px-4 pt-4 pb-6 text-center space-y-1 text-slate-500 text-[11px] border-t border-slate-200/60 mx-4">
        <div className="font-semibold text-slate-800">{activeRestaurant.name}</div>
        <div>{activeRestaurant.address}</div>
        <div className="text-[10px] text-slate-400">Powered by ENSEMBLE Hospitality SaaS</div>
      </div>
    </div>
  );
};
