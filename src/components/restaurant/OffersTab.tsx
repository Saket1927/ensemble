import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Offer } from '../../types/tenant';
import { Tag, Plus, CheckCircle2, Clock, Calendar, Users, Percent, X } from 'lucide-react';

export const OffersTab: React.FC = () => {
  const { activeRestaurant, activeOffers, createOffer, toggleOfferActive } = useTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_item'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minBill, setMinBill] = useState<number>(1200);
  const [validUntil, setValidUntil] = useState<string>('2025-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(250);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    createOffer({
      restaurantId: activeRestaurant.id,
      name,
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minBill: Number(minBill),
      validFrom: new Date().toISOString().split('T')[0],
      validUntil,
      applicableDays: ['All Days'],
      usageLimit: Number(usageLimit),
      active: true,
    });

    setIsModalOpen(false);
    setName('');
    setCode('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Promotional Offers & Dining Vouchers
          </h2>
          <p className="text-xs text-slate-500">
            Create and monitor targeted discounts for table billing.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm flex items-center space-x-1.5 transition"
          style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>Create Offer</span>
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeOffers.map((offer) => (
          <div
            key={offer.id}
            className={`p-5 rounded-2xl border shadow-sm space-y-3 transition flex flex-col justify-between ${
              offer.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                  {offer.code}
                </span>

                <button
                  onClick={() => toggleOfferActive(offer.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                    offer.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {offer.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                {offer.name}
              </h3>

              <div className="text-xs text-slate-500">
                Minimum Bill: <span className="font-semibold text-slate-800">₹{offer.minBill}</span>
              </div>
            </div>

            {/* Redemptions Progress */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Usage Tracker</span>
                <span className="font-bold text-slate-900">
                  Used {offer.usedCount} of {offer.usageLimit} times
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (offer.usedCount / offer.usageLimit) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                <span>Valid until {offer.validUntil}</span>
                <span>{offer.applicableDays.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Create New Dining Offer
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Offer Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% OFF Weekday Feast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Voucher Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FEAST15"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 font-mono uppercase border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="free_item">Complimentary Item</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Discount Value ({discountType === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimum Bill Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={minBill}
                    onChange={(e) => setMinBill(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    required
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold uppercase tracking-wider text-white shadow-md"
                  style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
                >
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
