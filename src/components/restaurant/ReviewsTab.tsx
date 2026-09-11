import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Review } from '../../types/tenant';
import { Star, MessageSquare, Image, CheckCircle2, Send, ExternalLink } from 'lucide-react';

export const ReviewsTab: React.FC = () => {
  const { activeRestaurant, activeReviews } = useTenant();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterWithPhotos, setFilterWithPhotos] = useState<boolean>(false);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const totalReviews = activeReviews.length;
  const avgRating = totalReviews > 0
    ? (activeReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '4.9';

  const fiveStarCount = activeReviews.filter((r) => r.rating === 5).length;
  const fiveStarPercent = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 85;

  const filteredReviews = activeReviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (filterWithPhotos && !r.photoUrl) return false;
    return true;
  });

  const handleSaveReply = (id: string) => {
    const rev = activeReviews.find((r) => r.id === id);
    if (rev) {
      rev.reply = replyText;
    }
    setReplyingReviewId(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Average Rating</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-slate-900">{avgRating}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="flex text-amber-400 text-sm">
            {'★'.repeat(Math.round(Number(avgRating)))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Reviews</span>
          <div className="text-3xl font-bold text-slate-900">{totalReviews}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% verified table scans</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">5-Star Satisfaction</span>
          <div className="text-3xl font-bold text-amber-600">{fiveStarPercent}%</div>
          <span className="text-[11px] text-slate-400">{fiveStarCount} perfect reviews</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Google Review Bridge</span>
            <div className="text-xs text-slate-600 mt-1">High ratings are prompted to replicate to Google.</div>
          </div>
          <a
            href={activeRestaurant.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-amber-700 flex items-center space-x-1 hover:underline mt-2"
          >
            <span>View Google Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterRating === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Ratings ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setFilterRating(s)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${
                filterRating === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{s}</span>
              <span className="text-amber-500">★</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilterWithPhotos(!filterWithPhotos)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition ${
            filterWithPhotos
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          <span>Only With Photos</span>
        </button>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm">
                  {rev.customerName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{rev.customerName}</div>
                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <span>{rev.date}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-600">Table #{rev.tableNumber || 12}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold flex items-center space-x-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Dine-in</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex text-amber-400 text-sm">
                {'★'.repeat(rev.rating)}
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              "{rev.comment}"
            </p>

            {/* Dish Feedback Chips */}
            {rev.dishFeedback && rev.dishFeedback.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {rev.dishFeedback.map((df, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-semibold"
                  >
                    <span>{df.dishName}</span>
                    <span className="text-amber-700 font-bold">★{df.rating}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Attached Photo */}
            {rev.photoUrl && (
              <div className="rounded-xl overflow-hidden h-48 w-full max-w-sm border border-slate-200">
                <img
                  src={rev.photoUrl}
                  alt="Diner upload"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Management Reply Section */}
            {rev.reply ? (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">
                  Official Management Reply
                </div>
                <div className="text-slate-600 italic">"{rev.reply}"</div>
              </div>
            ) : replyingReviewId === rev.id ? (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a graceful thank you or note to this diner..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setReplyingReviewId(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveReply(rev.id)}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <button
                  onClick={() => {
                    setReplyingReviewId(rev.id);
                    setReplyText(`Warm greetings from ${activeRestaurant.name}! Thank you for dining with us.`);
                  }}
                  className="text-xs font-semibold text-amber-700 hover:underline flex items-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reply to this review</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
