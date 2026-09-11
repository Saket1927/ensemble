import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Campaign } from '../../types/tenant';
import { Megaphone, Plus, Sparkles, Send, CheckCircle2, Users, ArrowRight, X } from 'lucide-react';

export const CampaignsTab: React.FC = () => {
  const { activeRestaurant, activeCampaigns } = useTenant();
  const [campaignList, setCampaignList] = useState<Campaign[]>(activeCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // New Campaign Form
  const [name, setName] = useState('');
  const [targetAudience, setTargetAudience] = useState<any>('Inactive 30+ days');
  const [offer, setOffer] = useState('15% OFF Royal Dine-in');
  const [channel, setChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      restaurantId: activeRestaurant.id,
      name,
      targetAudience,
      offer,
      channel,
      sentCount: 0,
      conversionRate: '0.0%',
      active: true,
    };

    setCampaignList([newCamp, ...campaignList]);
    setIsModalOpen(false);
    setName('');
    setSuccessNotice(`Targeted campaign "${name}" initiated!`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleTriggerCampaign = (campName: string) => {
    setSuccessNotice(`Dispatched 48 automated WhatsApp invites for "${campName}"!`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Diner Retention & Lifecycle Campaigns
          </h2>
          <p className="text-xs text-slate-500">
            Automate personalized dining invites for birthdays, anniversaries, and lapsed diners.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm flex items-center space-x-1.5 transition"
          style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaignList.map((camp) => (
          <div
            key={camp.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                  {camp.channel} Channel
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                {camp.name}
              </h3>

              <div className="space-y-1 text-xs">
                <div className="text-slate-500">
                  Target Audience: <strong className="text-slate-800">{camp.targetAudience}</strong>
                </div>
                <div className="text-slate-500">
                  Incentive: <strong className="text-emerald-700">{camp.offer}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sent</span>
                  <span className="font-bold text-slate-800">{camp.sentCount || 142}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Conversion</span>
                  <span className="font-bold text-emerald-600">{camp.conversionRate || '34.2%'}</span>
                </div>
              </div>

              <button
                onClick={() => handleTriggerCampaign(camp.name)}
                className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Trigger Broadcast</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                Launch Targeted Campaign
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30-Day Win-Back Royal Dinner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="Inactive 30+ days">Inactive (No visit in 30+ days)</option>
                  <option value="Birthday Month">Birthday Month Diners</option>
                  <option value="Anniversary">Anniversary Celebration</option>
                  <option value="High-Value VIP">High-Value VIP Clients</option>
                  <option value="First-Time Visitors">First-Time Visitors</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Included Offer
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% OFF + Complimentary Royal Dessert"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Broadcast Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['WhatsApp', 'SMS', 'Email'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        channel === ch
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
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
                  Start Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
