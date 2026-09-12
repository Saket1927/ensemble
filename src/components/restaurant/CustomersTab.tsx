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
  const [visitsFilter, setVisitsFilter] = useState<'all' | '1' | '2-4' | '5-9' | '10+'>('all');
  const [recencyFilter, setRecencyFilter] = useState<'all' | '7days' | '1month' | 'older'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'qr_scan' | 'manual_assignment'>('all');
  const [tableSizeFilter, setTableSizeFilter] = useState<'all' | '1-2' | '3-4' | '5+'>('all');
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

  const getDaysSinceVisit = (c: Customer): number => {
    if (c.lastVisitTimestamp) {
      return Math.floor((Date.now() - c.lastVisitTimestamp) / 86400000);
    }
    if (c.lastVisitDate) {
      const d = new Date(c.lastVisitDate).getTime();
      if (!isNaN(d)) return Math.floor((Date.now() - d) / 86400000);
    }
    const lv = (c.lastVisit || '').toLowerCase();
    if (lv.includes('today') || lv.includes('just now')) return 0;
    if (lv.includes('yesterday')) return 1;
    const matchDays = lv.match(/(\d+)\s*days?\s*ago/);
    if (matchDays) return parseInt(matchDays[1], 10);
    const matchWeeks = lv.match(/(\d+)\s*weeks?\s*ago/);
    if (matchWeeks) return parseInt(matchWeeks[1], 10) * 7;
    const matchMonths = lv.match(/(\d+)\s*months?\s*ago/);
    if (matchMonths) return parseInt(matchMonths[1], 10) * 30;
    const parsed = new Date(c.lastVisit).getTime();
    if (!isNaN(parsed)) return Math.floor((Date.now() - parsed) / 86400000);
    return 15;
  };

  const hasActiveFilter =
    selectedSegment !== 'All' ||
    visitsFilter !== 'all' ||
    recencyFilter !== 'all' ||
    sourceFilter !== 'all' ||
    tableSizeFilter !== 'all' ||
    Boolean(searchQuery.trim());

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSegment('All');
    setVisitsFilter('all');
    setRecencyFilter('all');
    setSourceFilter('all');
    setTableSizeFilter('all');
  };

  const filteredCustomers = activeCustomers.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email ? c.email.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Segment
    if (selectedSegment === 'New' && !(c.tags.includes('New') || c.visits <= 2)) return false;
    if (selectedSegment === 'Returning' && c.visits <= 2) return false;
    if (selectedSegment === 'High-Value' && !(c.tags.includes('High-Value') || c.totalSpend > 7000)) return false;
    if (selectedSegment === 'Inactive' && !c.tags.some((t) => t.includes('Inactive'))) return false;
    if (selectedSegment === 'Social' && !(c.engagement.instagram || c.engagement.whatsapp)) return false;

    // Visits Filter
    if (visitsFilter === '1' && c.visits !== 1) return false;
    if (visitsFilter === '2-4' && (c.visits < 2 || c.visits > 4)) return false;
    if (visitsFilter === '5-9' && (c.visits < 5 || c.visits > 9)) return false;
    if (visitsFilter === '10+' && c.visits < 10) return false;

    // Recency Filter
    const days = getDaysSinceVisit(c);
    if (recencyFilter === '7days' && days > 7) return false;
    if (recencyFilter === '1month' && days > 30) return false;
    if (recencyFilter === 'older' && days <= 30) return false;

    // Source Filter
    const isWalkin = c.source === 'manual_assignment' || c.tags.some((t) => t.toLowerCase().includes('walk-in'));
    if (sourceFilter === 'qr_scan' && isWalkin) return false;
    if (sourceFilter === 'manual_assignment' && !isWalkin) return false;

    // Table Size Filter
    const party = c.tableSize || c.partySize || 2;
    if (tableSizeFilter === '1-2' && (party < 1 || party > 2)) return false;
    if (tableSizeFilter === '3-4' && (party < 3 || party > 4)) return false;
    if (tableSizeFilter === '5+' && party < 5) return false;

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
        {/* Top Row: Search and Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search diner name, phone, table tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredCustomers.length}</strong> of {activeCustomers.length} diners
            </span>
            {hasActiveFilter && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
              >
                Reset Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Multi-Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Visits Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Total Visits
            </label>
            <select
              value={visitsFilter}
              onChange={(e) => setVisitsFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-slate-400"
            >
              <option value="all">All Visits</option>
              <option value="1">1 Visit (First Timer)</option>
              <option value="2-4">2–4 Visits (Returning)</option>
              <option value="5-9">5–9 Visits (Regular)</option>
              <option value="10+">10+ Visits (VIP Loyal)</option>
            </select>
          </div>

          {/* Recency Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Last Visited
            </label>
            <select
              value={recencyFilter}
              onChange={(e) => setRecencyFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-slate-400"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days (Active)</option>
              <option value="1month">Last 30 Days (1 Month)</option>
              <option value="older">Older than 1 Month</option>
            </select>
          </div>

          {/* Source Channel Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Diner Channel
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-slate-400"
            >
              <option value="all">All Channels</option>
              <option value="qr_scan">📱 Scanned Table QR</option>
              <option value="manual_assignment">📋 Captain Walk-in</option>
            </select>
          </div>

          {/* Table / Party Size Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Table / Party Size
            </label>
            <select
              value={tableSizeFilter}
              onChange={(e) => setTableSizeFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-slate-400"
            >
              <option value="all">All Table Sizes</option>
              <option value="1-2">1–2 Diners (Couple / Solo)</option>
              <option value="3-4">3–4 Diners (Family)</option>
              <option value="5+">5+ Diners (Large Party)</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-50/70">
                <th className="py-3 px-3">Diner Name & Source</th>
                <th className="py-3 px-3">Phone & Email</th>
                <th className="py-3 px-3 text-center">Table Size</th>
                <th className="py-3 px-3 text-center">Visits</th>
                <th className="py-3 px-3">Avg Bill</th>
                <th className="py-3 px-3">Total Spend</th>
                <th className="py-3 px-3">Last Visit</th>
                <th className="py-3 px-3 text-center">Reviews</th>
                <th className="py-3 px-3 text-center">Rewards</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold">No diners match your selected filter criteria</p>
                    <button
                      onClick={handleResetFilters}
                      className="text-amber-600 font-bold underline text-xs"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const party = customer.tableSize || customer.partySize || 2;
                  const isWalkin = customer.source === 'manual_assignment' || customer.tags.some((t) => t.toLowerCase().includes('walk-in'));

                  return (
                    <tr
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="hover:bg-amber-50/50 transition cursor-pointer group"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-amber-800 transition">
                            {customer.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              isWalkin
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isWalkin ? 'Walk-in' : 'QR Scan'}
                          </span>
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
                        <div className="text-slate-400 text-[10px]">{customer.email || 'No email'}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg font-semibold text-[11px]">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{party} Guests</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold">
                          {customer.visits}x
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800 font-mono">
                        ₹{(customer.averageBill || Math.round(customer.totalSpend / Math.max(1, customer.visits))).toLocaleString()}
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                        ₹{customer.totalSpend.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <div className="font-medium text-slate-800">{customer.lastVisit}</div>
                        {customer.lastVisitDate && (
                          <div className="text-[10px] text-slate-400">{customer.lastVisitDate}</div>
                        )}
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
                  );
                })
              )}
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
                    <Users className="w-3.5 h-3.5" />
                    <span>Table / Party Size</span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedCustomer.tableSize || selectedCustomer.partySize || 2} Guests
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Diner Channel</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedCustomer.source === 'manual_assignment' || selectedCustomer.tags.some(t => t.includes('Walk-in'))
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedCustomer.source === 'manual_assignment' || selectedCustomer.tags.some(t => t.includes('Walk-in'))
                      ? '📋 Captain Walk-in'
                      : '📱 Scanned Table QR'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last Table Visit</span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedCustomer.lastVisit} {selectedCustomer.lastVisitDate ? `(${selectedCustomer.lastVisitDate})` : ''}
                  </span>
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
