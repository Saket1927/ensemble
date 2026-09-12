import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Share2,
  MessageCircle,
  Copy,
  CheckCircle2,
  UploadCloud,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, WhatsAppIcon, TikTokIcon } from '../common/BrandIcons';

interface SocialRewardsProps {
  onOpenSpin: () => void;
}

export const SocialRewards: React.FC<SocialRewardsProps> = ({ onOpenSpin }) => {
  const {
    activeRestaurant,
    activeSocialSubmissions,
    submitSocialProof,
    unlockedExtraSpins,
  } = useTenant();

  const [copiedHashtags, setCopiedHashtags] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'Instagram' | 'Facebook' | 'WhatsApp' | 'TikTok'>('Instagram');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  const hashtagString = activeRestaurant.hashtags.join(' ');

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(hashtagString);
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const handleSampleUpload = () => {
    setPreviewUrl('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !previewUrl) return;

    submitSocialProof({
      customerName,
      customerPhone,
      instagramHandle,
      platform: selectedPlatform,
      screenshotUrl: previewUrl,
    });

    setSubmittedSuccess(true);
  };

  // Check if any recent submission is approved
  const hasApprovedSubmission = activeSocialSubmissions.some(
    (s) => s.status === 'approved' && s.customerName.toLowerCase() === customerName.toLowerCase()
  );

  return (
    <div className="space-y-5 px-4 pt-2 animate-fade-in">
      {/* Header */}
      <div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest block"
          style={{ color: secondaryColor }}
        >
          Social Amplification
        </span>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Earn More Rewards
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Share your {activeRestaurant.name} experience on social media and unlock an extra spin!
        </p>
      </div>

      {/* Bonus Spin Ready Alert if staff approved */}
      {unlockedExtraSpins > 0 && (
        <div
          onClick={onOpenSpin}
          className="cursor-pointer p-4 rounded-2xl text-white shadow-lg flex items-center justify-between border-2 animate-pulse"
          style={{
            backgroundColor: primaryColor,
            borderColor: secondaryColor,
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                EXTRA SPIN UNLOCKED!
              </div>
              <div className="text-[11px] text-slate-200">
                Your post was verified by our team.
              </div>
            </div>
          </div>
          <span
            className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950"
            style={{ backgroundColor: secondaryColor }}
          >
            SPIN NOW
          </span>
        </div>
      )}

      {/* Step 1: Share Platforms */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Share Your {activeRestaurant.name} Experience</span>
        </div>

        <p className="text-xs text-slate-600">
          Post a food photo, reel, or table story on any of these platforms:
        </p>

        <div className="grid grid-cols-4 gap-2">
          {(['Instagram', 'WhatsApp', 'Facebook', 'TikTok'] as const).map((plat) => (
            <button
              key={plat}
              type="button"
              onClick={() => setSelectedPlatform(plat)}
              className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                selectedPlatform === plat
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              {plat === 'Instagram' && <InstagramIcon className="w-4 h-4 text-pink-600" />}
              {plat === 'WhatsApp' && <WhatsAppIcon className="w-4 h-4 text-emerald-600" />}
              {plat === 'Facebook' && <FacebookIcon className="w-4 h-4 text-blue-600" />}
              {plat === 'TikTok' && <TikTokIcon className="w-4 h-4 text-slate-900" />}
              <span className="text-[10px]">{plat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Copy Hashtags */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Add These Hashtags & Tag Us</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-700 select-all leading-relaxed">
          {hashtagString}
        </div>

        <button
          onClick={handleCopyHashtags}
          className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition flex items-center justify-center space-x-2"
        >
          {copiedHashtags ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Hashtags Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span>COPY HASHTAGS</span>
            </>
          )}
        </button>
      </div>

      {/* Step 3: Upload Screenshot */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
            3
          </span>
          <span>Already Posted? Upload Screenshot</span>
        </div>

        {!submittedSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pooja Verma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Phone (for confirmation)
              </label>
              <input
                type="tel"
                placeholder="+91 98XXX XXXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instagram Handle <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="@yourhandle"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Tip: Invite <strong className="text-slate-700">{activeRestaurant.socials.instagram}</strong> as Collaborator in your post settings.
              </p>
            </div>

            {/* Screenshot Upload / Simulation Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Story / Post Screenshot Proof
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center space-y-2 hover:border-slate-300 transition">
                {previewUrl ? (
                  <div className="space-y-2">
                    <div className="h-40 rounded-xl overflow-hidden border border-slate-200 max-w-[200px] mx-auto">
                      <img
                        src={previewUrl}
                        alt="Screenshot proof preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewUrl('')}
                      className="text-[11px] text-rose-600 font-semibold underline"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-xs text-slate-600 font-medium">
                      Upload your social story screenshot
                    </div>
                    <div className="flex items-center justify-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSampleUpload}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
                      >
                        Simulate Story Upload
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!previewUrl || !customerName}
              className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition ${
                !previewUrl || !customerName
                  ? 'opacity-60 cursor-not-allowed bg-slate-400'
                  : 'hover:opacity-95'
              }`}
              style={{ backgroundColor: previewUrl && customerName ? primaryColor : undefined }}
            >
              Submit Proof for Verification
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                PENDING VERIFICATION
              </span>
              <h3 className="font-serif text-lg font-bold text-slate-900 mt-2">
                Proof Submitted Successfully
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {activeRestaurant.name} staff will review your {selectedPlatform} post shortly. Once verified, your extra spin will unlock automatically!
              </p>
            </div>

            {/* Customer-Safe Fast Verification Notice */}
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 text-left space-y-1">
              <span className="font-bold text-amber-950 block">
                ⚡ Fast Staff Verification
              </span>
              <span>
                Our floor team verifies social media check-ins promptly so your unlocked spin is available during your meal.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSubmittedSuccess(false)}
              className="text-xs font-semibold text-slate-600 underline pt-1"
            >
              Submit Another Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
