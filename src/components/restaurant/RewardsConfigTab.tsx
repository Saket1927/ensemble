import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { RewardWheelItem } from '../../types/tenant';
import { Gift, Sparkles, CheckCircle2, AlertCircle, Sliders, Clock, Percent } from 'lucide-react';

export const RewardsConfigTab: React.FC = () => {
  const { activeRestaurant, activeRewardItems, updateRewardItem } = useTenant();
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  // Calculate sum of active probabilities
  const totalProbability = activeRewardItems
    .filter((i) => i.active)
    .reduce((sum, item) => sum + item.probability, 0);

  const isValidSum = totalProbability === 100;

  const handleProbChange = (id: string, newProb: number) => {
    updateRewardItem(id, { probability: Math.max(0, Math.min(100, newProb)) });
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateRewardItem(id, { active: !currentActive });
  };

  const handleSaveNotice = () => {
    setSuccessNotice('Reward probability distribution saved successfully! Real-time wheel updated.');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Spin & Win Reward Engine Configuration
        </h2>
        <p className="text-xs text-slate-500">
          Calibrate prize odds, discount values, and validity periods for diners at {activeRestaurant.name}.
        </p>
      </div>

      {/* Success alert */}
      {successNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Probability Allocation Visualizer Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Probability Allocation (Total: {totalProbability}%)
            </span>
            {isValidSum ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Total Probability: 100% ✓</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Total Probability: {totalProbability}% (Must be 100%)</span>
              </span>
            )}
          </div>

          <button
            onClick={handleSaveNotice}
            disabled={!isValidSum}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
              isValidSum
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Save Distribution
          </button>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200 shadow-inner">
          {activeRewardItems
            .filter((i) => i.active)
            .map((item) => (
              <div
                key={item.id}
                style={{
                  width: `${item.probability}%`,
                  backgroundColor: item.color,
                }}
                className="h-full relative group transition-all"
                title={`${item.label}: ${item.probability}%`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white tracking-wider truncate px-1 drop-shadow-sm">
                  {item.probability >= 8 ? `${item.probability}%` : ''}
                </span>
              </div>
            ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-1 text-xs">
          {activeRewardItems
            .filter((i) => i.active)
            .map((item) => (
              <div key={item.id} className="flex items-center space-x-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-slate-400"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-800">{item.label}</span>
                <span className="text-slate-400 text-[11px]">({item.probability}%)</span>
              </div>
            ))}
        </div>
      </div>

      {/* Rewards Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeRewardItems.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition shadow-sm space-y-4 ${
              item.active
                ? 'bg-white border-slate-200'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{item.label}</h3>
                  <p className="text-[11px] text-slate-500">{item.description}</p>
                </div>
              </div>

              {/* Active Switch Toggle */}
              <button
                onClick={() => handleToggleActive(item.id, item.active)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  item.active ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.active ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Probability Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Win Probability</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {item.probability}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                disabled={!item.active}
                value={item.probability}
                onChange={(e) => handleProbChange(item.id, Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Expiry Days & Value */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Voucher Expiry</span>
                <div className="flex items-center space-x-1 font-semibold text-slate-800 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.expiryDays > 0 ? `${item.expiryDays} Days` : 'Instant'}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reward Type</span>
                <span className="font-semibold text-slate-800 capitalize mt-0.5 block">
                  {item.discountType.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
