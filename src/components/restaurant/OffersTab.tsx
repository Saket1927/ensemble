import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Tag, Plus, CheckCircle2, Clock, Calendar, Users, Percent, X, Search, Filter, Sparkles, Gift, Check, ShieldCheck } from 'lucide-react';

export const OffersTab: React.FC = () => {
  const { activeRestaurant, activeOffers, createOffer, toggleOfferActive, unifiedCoupons } = useTenant();
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'issued_vouchers'>('campaigns');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_item'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minBill, setMinBill] = useState<number>(1200);
  const [validUntil, setValidUntil] = useState<string>('2025-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(250);

  // Issued Vouchers Filter State
  const [voucherSearch, setVoucherSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'held' | 'redeemed' | 'expired'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Filtered Restaurant Issued Vouchers
  const restaurantCoupons = unifiedCoupons.filter((c) => c.restaurantId === activeRestaurant.id);
  const filteredCoupons = restaurantCoupons.filter((coupon) => {
    const matchesSearch =
      coupon.voucherCode.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      coupon.customerPhone.includes(voucherSearch);
    const matchesStatus = statusFilter === 'all' || coupon.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || coupon.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const totalIssued = restaurantCoupons.length;
  const totalHeld = restaurantCoupons.filter((c) => c.status === 'held').length;
  const totalRedeemed = restaurantCoupons.filter((c) => c.status === 'redeemed').length;
  const totalPending = restaurantCoupons.filter((c) => c.slot === 'pending_approval').length;

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Offers & Vouchers Hub
          </h2>
          <p className="text-xs text-slate-500">
            Manage promotional campaigns and audit customer-issued reward vouchers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeSubTab === 'campaigns' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm flex items-center space-x-1.5 transition"
              style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign Offer</span>
            </button>
          )}
        </div>
      </div>

      {/* Subnav Navigation */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeSubTab === 'campaigns'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Promotional Campaigns ({activeOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('issued_vouchers')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeSubTab === 'issued_vouchers'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Customer Issued Vouchers & Audit ({restaurantCoupons.length})</span>
        </button>
      </div>

      {/* VIEW 1: CAMPAIGNS */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
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
        </div>
      )}

      {/* VIEW 2: ISSUED VOUCHERS AUDIT TRAIL */}
      {activeSubTab === 'issued_vouchers' && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Issued</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{totalIssued}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block tracking-wider">Active In Wallet</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">{totalHeld}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-purple-600 block tracking-wider">Redeemed on Floor</span>
              <span className="text-xl font-bold text-purple-700 mt-1 block">{totalRedeemed}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-amber-600 block tracking-wider">Pending Approval</span>
              <span className="text-xl font-bold text-amber-700 mt-1 block">{totalPending}</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search voucher code or phone..."
                value={voucherSearch}
                onChange={(e) => setVoucherSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="held">Active (Held)</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none bg-white font-medium text-slate-700"
              >
                <option value="all">All Sources</option>
                <option value="spin_win">Spin & Win</option>
                <option value="review">Review Reward</option>
                <option value="instagram">Instagram Story</option>
                <option value="referral">Friend Referral</option>
                <option value="bill_upload">Bill Upload</option>
                <option value="deal_of_the_day">Deal of Day</option>
              </select>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Voucher Code</th>
                    <th className="py-3 px-4">Origin / Source</th>
                    <th className="py-3 px-4">Reward Details</th>
                    <th className="py-3 px-4">Guest Phone</th>
                    <th className="py-3 px-4">Table / Allocation</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Slot</th>
                    <th className="py-3 px-4">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No customer vouchers match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {coupon.voucherCode}
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {coupon.source === 'spin_win'
                              ? '🎡 Spin Wheel'
                              : coupon.source === 'review'
                              ? '⭐ Review Reward'
                              : coupon.source === 'instagram'
                              ? '📸 Instagram'
                              : coupon.source === 'referral'
                              ? '👥 Referral'
                              : '🎁 Reward'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {coupon.rewardLabel ||
                            (coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% OFF`
                              : coupon.discountType === 'fixed'
                              ? `₹${coupon.discountValue} OFF`
                              : `Free ${coupon.freeMenuItemName || 'Dish'}`)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {coupon.customerPhone || 'Walk-in'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {coupon.tableNumber ? `Table ${coupon.tableNumber}` : 'Online/Floor'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              coupon.status === 'held'
                                ? 'bg-emerald-100 text-emerald-800'
                                : coupon.status === 'redeemed'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {coupon.status === 'held' ? 'Active' : coupon.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] text-slate-500 uppercase font-mono">
                            {coupon.slot}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
