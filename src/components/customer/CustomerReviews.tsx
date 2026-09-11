import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Star,
  Camera,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Image as ImageIcon,
} from 'lucide-react';

interface CustomerReviewsProps {
  onReviewSubmitted: () => void;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ onReviewSubmitted }) => {
  const { activeRestaurant, activeTable, activeReviews, addReview, activeMenuItems } = useTenant();

  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterWithPhotos, setFilterWithPhotos] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Review Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [dishRatings, setDishRatings] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  // Average calculations
  const totalCount = activeReviews.length;
  const average = totalCount > 0
    ? (activeReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : '4.9';

  // Sample dishes to rate (first 3 active items)
  const sampleDishes = activeMenuItems.slice(0, 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    const dishFeedback = Object.entries(dishRatings).map(([dishName, dishRating]) => ({
      dishName,
      rating: dishRating,
    }));

    addReview({
      restaurantId: activeRestaurant.id,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
      photoUrl: photoUrl || undefined,
      dishFeedback: dishFeedback.length > 0 ? dishFeedback : undefined,
      tableNumber: activeTable,
    });

    setSubmitted(true);
  };

  const filteredReviews = activeReviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (filterWithPhotos && !r.photoUrl) return false;
    return true;
  });

  return (
    <div className="space-y-5 px-4 pt-2 animate-fade-in">
      {/* Header */}
      <div>
        <span
          className="text-[10px] font-bold uppercase tracking-widest block"
          style={{ color: secondaryColor }}
        >
          Guest Feedback
        </span>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Reviews & Stories
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Read genuine dining memoirs or share your {activeRestaurant.name} experience.
        </p>
      </div>

      {/* Ratings Summary Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-3xl font-bold text-slate-900">{average}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="flex text-amber-400 text-sm">
            {'★'.repeat(Math.round(Number(average)))}
          </div>
          <p className="text-[11px] text-slate-500">Based on {totalCount} verified table reviews</p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setSubmitted(false);
          }}
          className="px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition transform active:scale-95"
          style={{ backgroundColor: primaryColor }}
        >
          Leave a Review
        </button>
      </div>

      {/* Leave Review Form Modal / Expanded section */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 border-2 shadow-lg space-y-4 animate-slide-up"
             style={{ borderColor: `${secondaryColor}80` }}>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Share Your Dining Experience
                </h3>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Table #{activeTable}
                </span>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Overall Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <span className={star <= rating ? 'text-amber-400' : 'text-slate-200'}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {rating === 5 ? 'Exceptional!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Comments
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about the flavours, hospitality, or ambiance..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Optional Dish Feedback Rating */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-700">
                  How did you like these dishes? (Optional)
                </label>
                <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {sampleDishes.map((dish) => (
                    <div key={dish.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate max-w-[170px]">
                        {dish.name}
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setDishRatings((prev) => ({
                                ...prev,
                                [dish.name]: s,
                              }))
                            }
                            className={`text-sm ${
                              (dishRatings[dish.name] || 0) >= s
                                ? 'text-amber-400'
                                : 'text-slate-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Photo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Add Food Photo (Optional)</span>
                  <span className="text-[10px] text-slate-400">Photo URL</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="Paste an image URL..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoUrl(
                        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="px-2.5 py-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                  >
                    Use Sample
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition"
                  style={{ backgroundColor: primaryColor }}
                >
                  Submit & Spin
                </button>
              </div>
            </form>
          ) : (
            /* Post-Submission Congratulation & Google Review Flow */
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  THANK YOU FOR YOUR REVIEW
                </h3>
                <p className="text-xs text-slate-500">
                  Your feedback has been recorded at Table {activeTable}.
                </p>
              </div>

              {/* High rating -> Google Review CTA */}
              {rating >= 4 ? (
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 text-left space-y-2">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>We are thrilled you enjoyed your experience!</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Could you take 10 seconds to share this on our official Google page? It helps our culinary artisans tremendously.
                  </p>
                  <a
                    href={activeRestaurant.googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 underline hover:text-amber-700"
                  >
                    <span>Share your experience on Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">
                    We appreciate your honest feedback.
                  </span>
                  Our General Manager has been notified to ensure your next visit is immaculate.
                </div>
              )}

              {/* Spin & Win Prompt */}
              <div
                className="p-4 rounded-2xl text-white space-y-2 shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="font-serif text-base font-bold text-amber-200">
                  YOUR SPIN & WIN IS READY
                </div>
                <p className="text-xs text-slate-200">
                  Spin the wheel now to claim your dining discount voucher!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    onReviewSubmitted();
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transform active:scale-95 transition"
                  style={{ backgroundColor: secondaryColor, color: '#0e1d16' }}
                >
                  SPIN NOW
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              filterRating === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All
          </button>
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                filterRating === star
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <span>{star}</span>
              <span className="text-amber-400">★</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilterWithPhotos(!filterWithPhotos)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center space-x-1 border transition ${
            filterWithPhotos
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <ImageIcon className="w-3 h-3" />
          <span>With Photos</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 text-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  {rev.customerName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    {rev.customerName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                    <span>{rev.date}</span>
                    {rev.tableNumber && (
                      <>
                        <span>•</span>
                        <span>Table {rev.tableNumber}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex text-amber-400 text-xs">
                {'★'.repeat(rev.rating)}
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              "{rev.comment}"
            </p>

            {/* Dish Feedback badges */}
            {rev.dishFeedback && rev.dishFeedback.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {rev.dishFeedback.map((df, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium"
                  >
                    <span>{df.dishName}</span>
                    <span className="text-amber-600 font-bold">★{df.rating}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Photo */}
            {rev.photoUrl && (
              <div className="rounded-xl overflow-hidden h-40 w-full border border-slate-100 mt-2">
                <img
                  src={rev.photoUrl}
                  alt="Guest dining experience"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Restaurant Owner Reply if any */}
            {rev.reply && (
              <div
                className="mt-2 p-2.5 rounded-xl border text-[11px] leading-relaxed"
                style={{
                  backgroundColor: `${primaryColor}08`,
                  borderColor: `${primaryColor}20`,
                }}
              >
                <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider mb-0.5 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span>{activeRestaurant.name} Response</span>
                </div>
                <div className="text-slate-600 italic">"{rev.reply}"</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
