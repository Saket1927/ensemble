import React, { useState, useRef } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  ExternalLink,
  RotateCcw,
  Sparkles,
  X,
  AlertCircle,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { InstagramIcon } from '../common/BrandIcons';

interface InstagramCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpin: () => void;
}

export const InstagramCameraModal: React.FC<InstagramCameraModalProps> = ({
  isOpen,
  onClose,
  onOpenSpin,
}) => {
  const {
    activeRestaurant,
    customerSession,
    submitSocialProof,
    activeTable,
    addUnifiedCoupon,
  } = useTenant();

  const [step, setStep] = useState<'capture' | 'preview' | 'caption' | 'verify' | 'success'>('capture');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const primaryColor = activeRestaurant.branding.primaryColor || '#14532d';
  const secondaryColor = activeRestaurant.branding.secondaryColor || '#f59e0b';

  // Dynamic Caption Generator
  const rawInstagramHandle = activeRestaurant.socials?.instagram
    ? activeRestaurant.socials.instagram.replace(/^@/, '')
    : activeRestaurant.slug;
  const restaurantHandle = `@${rawInstagramHandle}`;
  const hashtagList = activeRestaurant.hashtags && activeRestaurant.hashtags.length > 0
    ? activeRestaurant.hashtags.join(' ')
    : `#${activeRestaurant.slug} #finedining #foodie`;
  const fullCaption = `Delightful dining experience at ${activeRestaurant.name} (Table #${activeTable})! 🍽️✨\n\nTagging ${restaurantHandle}\n${hashtagList} #ENSEMBLE`;

  // Handle Photo Selection (Camera or Gallery)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedPhotoUrl(event.target.result as string);
        setStep('preview');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Proof Screenshot Upload
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setScreenshotUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy Caption to Clipboard
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(fullCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  // Open Instagram App or Web
  const handleOpenInstagram = () => {
    // Open Instagram app or web to create story/post from user's own account (Req 4 & 37)
    window.open('https://www.instagram.com/', '_blank');
    setStep('verify');
  };

  // Final Proof Submission
  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl) {
      setErrorMessage('Please upload a screenshot of your Instagram post or story.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const name = customerSession?.name || 'Dining Guest';
    const phone = customerSession?.phone || 'Guest';

    submitSocialProof({
      customerName: name,
      customerPhone: phone,
      instagramHandle: instagramHandle.trim() || undefined,
      platform: 'Instagram',
      screenshotUrl,
    });

    const igVoucherCode = `${activeRestaurant.slug.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()}-IG${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    addUnifiedCoupon({
      restaurantId: activeRestaurant.id,
      customerPhone: phone,
      voucherCode: igVoucherCode,
      rewardLabel: 'Instagram Story Foodie Privilege',
      discountType: 'percentage',
      discountValue: 15,
      slot: 'pending_approval',
      source: 'instagram',
      expiresAt: 'Pending Captain / Manager Verification',
      tableNumber: activeTable,
    });

    setIsSubmitting(false);
    setStep('success');
  };

  const handleReset = () => {
    setCapturedPhotoUrl(null);
    setScreenshotUrl(null);
    setInstagramHandle('');
    setStep('capture');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Top Header */}
        <div
          className="p-4 text-white flex items-center justify-between"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Share & Earn Reward</h3>
              <p className="text-[10px] text-white/80">Camera-First Instagram Privileges</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <input
          ref={screenshotInputRef}
          type="file"
          accept="image/*"
          onChange={handleScreenshotUpload}
          className="hidden"
        />

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: CAPTURE / CHOOSE PHOTO */}
          {step === 'capture' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 text-pink-600 mx-auto flex items-center justify-center border border-pink-100 shadow-sm">
                <InstagramIcon className="w-9 h-9" />
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold text-slate-900">
                  Snap & Share Your Dining Experience
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Take a photo of your food, cocktail, or dining ambiance at{' '}
                  <strong className="text-slate-800">{activeRestaurant.name}</strong>. Post it on Instagram to unlock an instant bonus spin!
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-left space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Exclusive Dining Perk</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-normal">
                  Earn an extra Spin & Win voucher! Rewards earned through social sharing are credited to your Next-Visit Privileges wallet.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 flex items-center justify-center space-x-2 shadow-md transition active:scale-95"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Live Photo</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center space-x-2 transition active:scale-95"
                >
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                  <span>Choose Gallery</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PHOTO PREVIEW */}
          {step === 'preview' && capturedPhotoUrl && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 aspect-[4/3] flex items-center justify-center">
                <img
                  src={capturedPhotoUrl}
                  alt="Captured dining experience"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/70 text-white text-[10px] font-mono backdrop-blur-sm">
                  Table #{activeTable} • {activeRestaurant.name}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setCapturedPhotoUrl(null);
                    setStep('capture');
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>

                <button
                  onClick={() => setStep('caption')}
                  className="py-2.5 px-4 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-md transition active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span>Generate Caption</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DYNAMIC CAPTION & INSTAGRAM HANDOFF */}
          {step === 'caption' && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                  Step 2 of 3
                </span>
                <h4 className="font-serif text-base font-bold text-slate-900">
                  Your Custom Instagram Caption
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  We've prepared the official caption and hashtags for your post.
                </p>
              </div>

              {/* Caption Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed space-y-2">
                <div className="whitespace-pre-line font-medium text-slate-700">
                  {fullCaption}
                </div>
                <button
                  onClick={handleCopyCaption}
                  className="w-full py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  {copiedCaption ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Caption Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Caption to Clipboard</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleOpenInstagram}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition active:scale-95"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Open Instagram & Post Story</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setStep('verify')}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Already posted? Skip to upload screenshot &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VERIFY POST (MANDATORY SCREENSHOT) */}
          {step === 'verify' && (
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  Final Step
                </span>
                <h4 className="font-serif text-base font-bold text-slate-900">
                  Upload Post Proof Screenshot
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a screenshot of your story or post to claim your reward.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Screenshot Upload Dropzone */}
              <div
                onClick={() => screenshotInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition ${
                  screenshotUrl
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
              >
                {screenshotUrl ? (
                  <div className="space-y-2">
                    <img
                      src={screenshotUrl}
                      alt="Proof screenshot"
                      className="max-h-36 mx-auto rounded-lg shadow border border-slate-200 object-contain"
                    />
                    <div className="text-xs font-bold text-emerald-700 flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Screenshot Loaded (Tap to change)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-600 mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Upload Screenshot of Your Post *
                      </span>
                      <span className="text-[10px] text-slate-500">
                        PNG or JPG screenshot from Instagram
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Instagram Handle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Instagram Handle (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="yourusername"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Submitted proofs are reviewed by the {activeRestaurant.name} team. Screenshots are auto-cleaned after 48 hours to protect guest privacy.
                </span>
              </div>

              <button
                type="submit"
                disabled={!screenshotUrl || isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <span>Submitting Proof...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Proof & Unlock Extra Spin</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 5: SUCCESS STATE */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-slate-900">
                  Verification Submitted!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Thank you for sharing your experience at {activeRestaurant.name}! Your proof is queued for restaurant verification, and an <strong>extra Spin & Win</strong> has been credited to your table.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-1">
                <div className="text-xs font-bold text-amber-900">Next-Visit Reward Policy</div>
                <p className="text-[11px] text-amber-800">
                  Per restaurant privilege policy, newly spun rewards will be securely held in your Next-Visit Rewards wallet for your next dining occasion.
                </p>
              </div>

              <button
                onClick={() => {
                  handleReset();
                  onOpenSpin();
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 shadow-md transition"
                style={{ backgroundColor: secondaryColor }}
              >
                Spin The Wheel Now &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
