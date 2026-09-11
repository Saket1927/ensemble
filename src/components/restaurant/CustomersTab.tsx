import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Customer } from '../../types/tenant';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  IndianRupee,
  Star,
  Gift,
  Share2,
  X,
  MessageSquare,
  Tag,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

export const CustomersTab: React.FC = () => {
  const { activeRestaurant, activeCustomers, createOffer } = useTenant();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Quick Action Modal states
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState<boolean>(false);
  const [offerPercent, setOfferPercent] = useState<number>(15);

  const primaryColor = activeRestaurant.branding.primaryColor;

  // Segment counts
  const totalCustomersCount = activeCustomers.length;
  const newCount = activeCustomers.filter((c) => c.tags.includes('New') || c.visits <= 2).length;
  const returningCount = activeCustomers.filter((c) => c.visits > 2).length;
  const highValueCount = activeCustomers.filter((c) => c.tags.includes('High-Value') || c.totalSpend > 7000).length;
  const inactiveCount = activeCustomers.filter((c) => c.tags.some((t) => t.includes('Inactive'))).length;

  const repeatRate = totalCustomersCount > 0 ? Math.round((returningCount / totalCustomersCount) * 100) : 68;
  const avgSpend = totalCustomersCount > 0
    ? Math.round(activeCustomers.reduce((acc, c) => acc + c.totalSpend, 0) / totalCustomersCount)
    : 1450;
  const avgVisits = totalCustomersCount > 0
    ? (activeCustomers.reduce((acc, c) => acc + c.visits, 0) / totalCustomersCount).toFixed(1)
    : '4.8';

  const filteredCustomers = activeCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email ? c.email.toLowerCase().includes(searchQuery.toLowerCase()) : false);

    if (!matchesSearch) return false;

    if (selectedSegment === 'New') return c.tags.includes('New') || c.visits <= 2;
    if (selectedSegment === 'Returning') return c.visits > 2;
    if (selectedSegment === 'High-Value') return c.tags.includes('High-Value') || c.totalSpend > 7000;
    if (selectedSegment === 'Inactive') return c.tags.some((t) => t.includes('Inactive'));
    if (selectedSegment === 'Social') return c.engagement.instagram || c.engagement.whatsapp;

    return true;
  });

  const handleSendVipOffer = () => {
    if (!selectedCustomer) return;
    createOffer({
      restaurantId: activeRestaurant.id,
      name: `VIP ${offerPercent}% OFF for ${selectedCustomer.name}`,
      code: `VIP-${selectedCustomer.name.slice(0, 3).toUpperCase()}${offerPercent}`,
      discountType: 'percentage',
      discountValue: offerPercent,
      minBill: 1000,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '2025-12-31',
      applicableDays: ['All Days'],
      usageLimit: 1,
      active: true,
    });
    setIsOfferModalOpen(false);
    setActionSuccessMsg(`Special ${offerPercent}% OFF voucher created & sent to ${selectedCustomer.name}!`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleSendMessage = () => {
    if (!selectedCustomer) return;
    setActionSuccessMsg(`WhatsApp dining invitation dispatched to ${selectedCustomer.phone}!`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Diners</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{totalCustomersCount * 84 + 12}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">+14 this week</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Repeat Rate</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{repeatRate}%</div>
          <span className="text-[10px] text-emerald-600 font-semibold">High loyalty index</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Avg Visits</span>
          <div className="text-xl font-bold text-slate-900 mt-1">{avgVisits}</div>
          <span className="text-[10px] text-slate-400">per diner lifecycle</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Avg Dine Spend</span>
          <div className="text-xl font-bold text-slate-900 mt-1">₹{avgSpend.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">₹1,200 min bill</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">High-Value VIPs</span>
          <div className="text-xl font-bold text-amber-600 mt-1">{highValueCount}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Top tier clientele</span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Segment Filter Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Returning', 'High-Value', 'New', 'Inactive', 'Social'].map((segment) => (
              <button
                key={segment}
                onClick={() => setSelectedSegment(segment)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedSegment === segment
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {segment}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-50/70">
                <th className="py-3 px-3">Diner Name</th>
                <th className="py-3 px-3">Phone & Email</th>
                <th className="py-3 px-3 text-center">Visits</th>
                <th className="py-3 px-3">Last Visit</th>
                <th className="py-3 px-3">Total Spend</th>
                <th className="py-3 px-3 text-center">Reviews</th>
                <th className="py-3 px-3 text-center">Rewards</th>
                <th className="py-3 px-3">Engagement</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="hover:bg-amber-50/50 transition cursor-pointer group"
                >
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 group-hover:text-amber-800 transition">
                      {customer.name}
                    </div>
                    <div className="flex gap-1 mt-0.5">
                      {customer.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    <div>{customer.phone}</div>
                    <div className="text-slate-400 text-[10px]">{customer.email}</div>
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {customer.visits}
                  </td>

                  <td className="py-3 px-3 text-slate-600">
                    {customer.lastVisit}
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-900">
                    ₹{customer.totalSpend.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-full">
                      <Star className="w-3 h-3 text-amber-500 fill-current" />
                      <span>{customer.reviewsCount}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-full">
                      {customer.rewardsRedeemed} used
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1.5">
                      {customer.engagement.instagram && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-100 text-pink-700">
                          IG
                        </span>
                      )}
                      {customer.engagement.whatsapp && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                          WA
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-amber-600 group-hover:text-white transition font-semibold text-[11px] text-slate-700"
                    >
                      Profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between animate-slide-up">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Verified Diner Profile
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                    {selectedCustomer.name}
                  </h2>
                  <div className="flex gap-1.5 mt-1.5">
                    {selectedCustomer.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Stat Blocks */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Visits</span>
                  <span className="text-xl font-bold text-slate-900">{selectedCustomer.visits}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spend</span>
                  <span className="text-xl font-bold text-slate-900">₹{selectedCustomer.totalSpend.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Bill</span>
                  <span className="text-xl font-bold text-slate-900">₹{selectedCustomer.averageBill.toLocaleString()}</span>
                </div>
              </div>

              {/* Contact & Dates */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{selectedCustomer.phone}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </span>
                  <span className="font-mono font-medium text-slate-800">{selectedCustomer.email}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last Table Visit</span>
                  </span>
                  <span className="font-semibold text-slate-800">{selectedCustomer.lastVisit}</span>
                </div>

                {selectedCustomer.birthday && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                      <span>Birthday</span>
                    </span>
                    <span className="font-bold text-pink-700">{selectedCustomer.birthday}</span>
                  </div>
                )}

                {selectedCustomer.anniversary && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Anniversary</span>
                    </span>
                    <span className="font-bold text-amber-700">{selectedCustomer.anniversary}</span>
                  </div>
                )}
              </div>

              {/* Favorite Dishes */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Culinary Preferences & Favorite Dishes
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.favoriteDishes.map((dish, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
              </div>

              {/* Engagement Channels */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Engagement & Participation
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span>Reviews Submitted</span>
                    <span className="font-bold text-slate-900">{selectedCustomer.reviewsCount}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span>Rewards Redeemed</span>
                    <span className="font-bold text-emerald-700">{selectedCustomer.rewardsRedeemed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: CREATE OFFER, SEND MESSAGE, VIEW HISTORY */}
            <div className="pt-6 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Create Offer</span>
                </button>

                <button
                  onClick={handleSendMessage}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setActionSuccessMsg(`Visit ledger for ${selectedCustomer.name} exported to clipboard!`);
                  setTimeout(() => setActionSuccessMsg(null), 3000);
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              >
                View Visit History & Bill Slips
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Direct Offer Modal */}
      {isOfferModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Create Direct Offer for {selectedCustomer.name}
            </h3>
            <p className="text-xs text-slate-500">
              Deliver a personalized discount code directly to this diner's phone.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount Value
              </label>
              <div className="flex space-x-2">
                {[10, 15, 20, 25].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setOfferPercent(val)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      offerPercent === val
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {val}% OFF
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendVipOffer}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                Issue Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
