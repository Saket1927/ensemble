import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Layers,
  CheckSquare,
  Square,
  Lock,
  Sparkles,
  Utensils,
  Share2,
  Receipt,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export const ModularPlanBuilder: React.FC = () => {
  const { restaurants, updateRestaurantPlanFeatures } = useTenant();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants[0]?.id || '');
  const [notice, setNotice] = useState<string | null>(null);

  const targetRestaurant = restaurants.find((r) => r.id === selectedRestaurantId) || restaurants[0];
  const features = targetRestaurant.planFeatures || {
    captainModule: true,
    ordering: true,
    socialRewards: true,
    spinRewards: true,
    billUpload: true,
    customBranding: true,
  };

  const featureDefinitions = [
    {
      key: 'captainModule',
      label: 'Captain Console & Floor Management',
      desc: 'Enables mobile floor console, call alerts, host reassignment, and table states.',
      icon: Utensils,
    },
    {
      key: 'ordering',
      label: 'Digital Table Ordering & Live Tab',
      desc: 'Enables guest cart, item ordering, kitchen prep countdown timers, and live tab billing.',
      icon: Smartphone,
    },
    {
      key: 'socialRewards',
      label: 'Instagram UGC & Social Moderation',
      desc: 'Enables screenshot proof verification, collaborator invite system, and social discounts.',
      icon: Share2,
    },
    {
      key: 'spinRewards',
      label: 'Spin & Win Gamified Wheel Engine',
      desc: 'Enables canvas physics spin wheel with custom probability distribution and coupons.',
      icon: Sparkles,
    },
    {
      key: 'billUpload',
      label: 'Paper Bill Upload & Scratch Card Audit',
      desc: 'Enables independent receipt photo capture directly to Master Admin with instant scratch rewards.',
      icon: Receipt,
    },
    {
      key: 'customBranding',
      label: 'White-label Custom Luxury Branding',
      desc: 'Custom colors, typography, hero media, custom logos, and dedicated subdomains.',
      icon: Layers,
    },
  ];

  const handleToggle = (key: string, currentVal: boolean) => {
    updateRestaurantPlanFeatures(targetRestaurant.id, {
      [key]: !currentVal,
    });
    setNotice(`Updated ${key} for ${targetRestaurant.name}. Propagating across restaurant services.`);
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Modular Subscription Plan Builder</h2>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
              Section 2 Granular Toggles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure individual feature tickbox toggles per restaurant. Disabled modules disappear from customer site and display locked prompts in Restaurant Admin.
          </p>
        </div>

        {/* Restaurant Picker */}
        <select
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-2"
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.plan} Tier)
            </option>
          ))}
        </select>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Feature Toggles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureDefinitions.map((feat) => {
          const isEnabled = !!(features as any)[feat.key];
          const Icon = feat.icon;

          return (
            <div
              key={feat.key}
              onClick={() => handleToggle(feat.key, isEnabled)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3.5 ${
                isEnabled
                  ? 'bg-slate-950 border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white truncate">{feat.label}</h4>
                  {isEnabled ? (
                    <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                      Enabled ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
