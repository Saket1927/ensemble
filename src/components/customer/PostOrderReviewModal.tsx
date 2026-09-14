import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Star,
  Sparkles,
  Gift,
  CheckCircle2,
  X,
  ChefHat,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostOrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TAGS = [
  '⚡ Swift Service',
  '🔥 Fresh & Piping Hot',
  '👨‍🍳 Chef Recommendation',
  '✨ Lovely Ambience',
  '💎 Premium Taste',
  '❤️ Hospitality 10/10',
];

export const PostOrderReviewModal: React.FC<PostOrderReviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeRestaurant,
    activeTable,
    customerSession,
    addReview,
    activeReviewRewardConfig,
  } = useTenant();

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['⚡ Swift Service']);
  const [comment, setComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>(
    customerSession?.name || ''
  );
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [claimedCode, setClaimedCode] = useState<string>('');

  if (!isOpen) return null;

  const primaryColor = activeRestaurant.branding.primaryColor || '#162c21';
  const secondaryColor = activeRestaurant.branding.secondaryColor || '#c5a96d';
  const rewardLabel = activeReviewRewardConfig?.rewardLabel || '10% OFF Dining Privilege';

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback if confetti unavailable
    }

    const fullComment = [
      selectedTags.length > 0 ? `[${selectedTags.join(', ')}]` : '',
      comment.trim(),
    ]
      .filter(Boolean)
      .join(' ') || 'Exceptional culinary experience!';

    // 1. Submit review (which dynamically awards the configured reward)
    const discountCode = `${activeRestaurant.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()}-REV${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    addReview({
      restaurantId: activeRestaurant.id,
      customerName: reviewerName.trim() || customerSession?.name || 'Verified Diner',
      rating,
      comment: fullComment,
      tableNumber: activeTable,
    });

    setClaimedCode(discountCode);
    setRewardClaimed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div
          className="p-5 text-white relative text-center"
          style={{ backgroundColor: primaryColor }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-white/15 border border-white/20 shadow-inner mb-2.5">
            <ChefHat className="w-6 h-6 text-amber-300" />
          </div>

          <span
            className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full border inline-block mb-1"
            style={{
              backgroundColor: `${secondaryColor}25`,
              borderColor: secondaryColor,
              color: secondaryColor,
            }}
          >
            Order Placed • Table {activeTable}
          </span>
          <h2 className="text-lg font-serif font-bold">
            {rewardClaimed ? 'Reward Unlocked! 🎉' : 'Kitchen Firing Your Order! 👨‍🍳'}
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-xs mx-auto">
            {rewardClaimed
              ? 'Thank you for your valuable feedback. Your reward is ready in your wallet!'
              : `Leave a quick dining review & unlock: ${rewardLabel}!`}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {rewardClaimed ? (
            <div className="text-center py-4 space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Privilege Code Generated
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 mt-2">
                  {rewardLabel} Saved
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Applicable towards your current session or next visit at {activeRestaurant.name}.
                </p>
              </div>

              {/* Voucher Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">
                  Voucher Code
                </span>
                <span className="font-mono text-xl font-black text-slate-900 tracking-widest selection:bg-amber-200">
                  {claimedCode}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Saved automatically to your "Rewards" tab
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Continue Dining</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div className="text-center space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  How is your experience so far?
                </label>
                <div className="flex items-center justify-center space-x-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-amber-600 block">
                  {rating === 5
                    ? '★ Outstanding (5.0)'
                    : rating === 4
                    ? '★ Very Good (4.0)'
                    : rating === 3
                    ? '★ Good (3.0)'
                    : '★ Needs Improvement'}
                </span>
              </div>

              {/* Quick Tags */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                  What did you like the most?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Abhishek Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Additional Comments */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                  Quick Note for Chef (Optional)
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Loved the special spices and mocktails!"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Reward Incentive Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-sm">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-900">
                    {rewardLabel}
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Submitting your review automatically credits this dining privilege into your wallet.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Submit & Claim</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
