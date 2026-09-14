import React, { useState, useEffect } from 'react';
import { useTenant, rebalanceWheelProbabilities } from '../../context/TenantContext';
import { RewardWheelItem, ReviewRewardConfig } from '../../types/tenant';
import {
  Gift,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Percent,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  X,
  Check,
  Star,
  UtensilsCrossed,
} from 'lucide-react';

const PRESET_COLORS = [
  '#162c21', // Forest Green
  '#c5a96d', // Warm Champagne Gold
  '#8b733e', // Antique Bronze
  '#991b1b', // Royal Crimson
  '#1e3a8a', // Imperial Sapphire
  '#7c2d12', // Amber Wood
  '#4c1d95', // Deep Plum
  '#2a3a30', // Charcoal Forest
];

export const RewardsConfigTab: React.FC = () => {
  const {
    activeRestaurant,
    activeRewardItems,
    addRewardItem,
    deleteRewardItem,
    saveRewardConfiguration,
    activeReviewRewardConfig,
    updateReviewRewardConfig,
    activeMenuItems,
  } = useTenant();

  // Local working copy of items for fluid editing and live rebalancing before persistence
  const [items, setItems] = useState<RewardWheelItem[]>(activeRewardItems);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Review Reward Configuration State
  const [reviewConfig, setReviewConfig] = useState<ReviewRewardConfig>(activeReviewRewardConfig);
  const [reviewSavedNotice, setReviewSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (activeReviewRewardConfig) {
      setReviewConfig(activeReviewRewardConfig);
    }
  }, [activeReviewRewardConfig]);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formLabel, setFormLabel] = useState<string>('');
  const [formType, setFormType] = useState<'percentage' | 'fixed' | 'free_item' | 'no_luck'>('percentage');
  const [formValue, setFormValue] = useState<number>(10);
  const [formDescription, setFormDescription] = useState<string>('');
  const [formColor, setFormColor] = useState<string>(activeRestaurant.branding.primaryColor || '#162c21');
  const [formExpiryDays, setFormExpiryDays] = useState<number>(7);
  const [formMinOrderAmount, setFormMinOrderAmount] = useState<number>(0);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  // Sync local items when activeRewardItems changes from outside (e.g. realtime sync)
  useEffect(() => {
    setItems(activeRewardItems);
  }, [activeRewardItems]);

  // Calculate sum of active probabilities with 1-decimal precision
  const activeItems = items.filter((i) => i.active);
  const totalProbability = Math.round(
    activeItems.reduce((sum, item) => sum + (item.probability || 0), 0) * 10
  ) / 10;

  const isValidSum = Math.abs(totalProbability - 100) < 0.1 && activeItems.length > 0;

  // Dynamic Recalculation: When probability of item changes, rebalance the remaining items
  const handleProbChange = (id: string, newProb: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newProb * 10) / 10));
    const rebalanced = rebalanceWheelProbabilities(items, id, clamped);
    setItems(rebalanced);
  };

  // Toggle active status and rebalance remaining active items
  const handleToggleActive = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, active: !item.active } : item
    );
    const rebalanced = rebalanceWheelProbabilities(updated);
    setItems(rebalanced);
  };

  // Delete item and rebalance remaining
  const handleDeleteItem = (id: string) => {
    if (items.length <= 2) {
      setErrorNotice('The wheel requires at least 2 prize options for diners to spin.');
      setTimeout(() => setErrorNotice(null), 3500);
      return;
    }
    const filtered = items.filter((item) => item.id !== id);
    const rebalanced = rebalanceWheelProbabilities(filtered);
    setItems(rebalanced);
    deleteRewardItem(id);
    setSuccessNotice('Offer removed and remaining probabilities rebalanced.');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // One-click Equalize All Active Probabilities
  const handleEqualizeAll = () => {
    const rebalanced = rebalanceWheelProbabilities(items);
    setItems(rebalanced);
    setSuccessNotice('All active wheel slices equalized to sum exactly 100%!');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItemId(null);
    setFormLabel('');
    setFormType('percentage');
    setFormValue(10);
    setFormDescription('Exclusive dining discount voucher');
    setFormColor(PRESET_COLORS[items.length % PRESET_COLORS.length]);
    setFormExpiryDays(7);
    setFormMinOrderAmount(0);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: RewardWheelItem) => {
    setEditingItemId(item.id);
    setFormLabel(item.label);
    setFormType(item.discountType);
    setFormValue(item.discountValue);
    setFormDescription(item.description);
    setFormColor(item.color);
    setFormExpiryDays(item.expiryDays);
    setFormMinOrderAmount(item.minOrderAmount || 0);
    setIsModalOpen(true);
  };

  // Handle Modal Save (Add or Update)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) return;

    if (editingItemId) {
      // Update existing
      const updated = items.map((item) =>
        item.id === editingItemId
          ? {
              ...item,
              label: formLabel.trim(),
              discountType: formType,
              discountValue: formType === 'no_luck' ? 0 : Number(formValue),
              description: formDescription.trim(),
              color: formColor,
              expiryDays: Number(formExpiryDays),
              minOrderAmount: Number(formMinOrderAmount) > 0 ? Number(formMinOrderAmount) : undefined,
            }
          : item
      );
      setItems(updated);
      setSuccessNotice(`Updated "${formLabel}" details.`);
    } else {
      // Add new offer with dynamic rebalance
      const newItem: RewardWheelItem = {
        id: `rwd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        label: formLabel.trim(),
        discountType: formType,
        discountValue: formType === 'no_luck' ? 0 : Number(formValue),
        description: formDescription.trim() || `${formLabel} reward`,
        probability: 0,
        color: formColor,
        textColor: '#ffffff',
        active: true,
        expiryDays: Number(formExpiryDays),
        minOrderAmount: Number(formMinOrderAmount) > 0 ? Number(formMinOrderAmount) : undefined,
      };

      const withNew = [...items, newItem];
      const rebalanced = rebalanceWheelProbabilities(withNew);
      setItems(rebalanced);
      addRewardItem(newItem);
      setSuccessNotice(`Added new reward "${formLabel}" and rebalanced probabilities!`);
    }

    setTimeout(() => setSuccessNotice(null), 3000);
    setIsModalOpen(false);
  };

  // Save distribution and sync across tabs/devices
  const handleSaveDistribution = () => {
    if (!isValidSum) {
      setErrorNotice(`Total probability is ${totalProbability}%. It must equal exactly 100% before saving.`);
      setTimeout(() => setErrorNotice(null), 3500);
      return;
    }

    const saved = saveRewardConfiguration(activeRestaurant.id, items);
    if (saved) {
      setSuccessNotice('Reward probability distribution saved & broadcasted! Live diner wheels synchronized.');
      setTimeout(() => setSuccessNotice(null), 4000);
    } else {
      setErrorNotice('Failed to validate reward configuration. Please ensure all names and probabilities are valid.');
      setTimeout(() => setErrorNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header with Custom Modern Plus Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border shadow-sm"
              style={{
                backgroundColor: `${secondaryColor}15`,
                borderColor: `${secondaryColor}40`,
                color: primaryColor,
              }}
            >
              Gamification Engine
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Multi-tenant isolated for {activeRestaurant.name}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Spin & Win Offer Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create reward slices, fine-tune dynamic probabilities, and synchronize live with customer phones.
          </p>
        </div>

        {/* Action Buttons: Custom Plus (+) Button & Auto-Balance */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleEqualizeAll}
            title="Automatically distribute equal probability to all active offers so total equals exactly 100%"
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm flex items-center space-x-1.5 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Equalize 100%</span>
          </button>

          {/* DEDICATED POLISHED CUSTOM "+" BUTTON */}
          <button
            onClick={handleOpenAdd}
            className="relative group overflow-hidden px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 active:scale-95 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #1e3a2f 60%, ${secondaryColor} 100%)`,
            }}
          >
            <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-300">
              <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </div>
            <span className="font-sans font-bold tracking-wide">Add New Offer</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center space-x-2.5 animate-slide-up shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="p-3.5 bg-rose-50 text-rose-800 text-xs font-semibold rounded-2xl border border-rose-200 flex items-center space-x-2.5 animate-slide-up shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Probability Allocation Visualizer Bar & Live Total Indicator */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Probability Allocation
            </span>

            {/* Live Indicator */}
            {isValidSum ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Probability: 100% ✓</span>
              </span>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    Total: {totalProbability}% (Difference: {totalProbability > 100 ? '+' : ''}
                    {(totalProbability - 100).toFixed(1)}%)
                  </span>
                </span>
                <button
                  onClick={handleEqualizeAll}
                  className="text-[11px] font-bold text-emerald-700 underline hover:text-emerald-800 cursor-pointer"
                >
                  Auto-Balance to 100%
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveDistribution}
            disabled={!isValidSum}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center space-x-1.5 ${
              isValidSum
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-95'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="h-7 w-full bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200 shadow-inner">
          {items
            .filter((i) => i.active)
            .map((item) => (
              <div
                key={item.id}
                style={{
                  width: `${item.probability}%`,
                  backgroundColor: item.color,
                }}
                className="h-full relative group transition-all duration-300"
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
          {items
            .filter((i) => i.active)
            .map((item) => (
              <div key={item.id} className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span
                  className="w-3 h-3 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-800">{item.label}</span>
                <span className="text-slate-500 font-mono font-bold text-[11px]">({item.probability}%)</span>
              </div>
            ))}
        </div>
      </div>

      {/* Rewards Configuration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-3xl border transition-all duration-200 shadow-sm space-y-4 relative ${
              item.active
                ? 'bg-white border-slate-200 hover:border-slate-300'
                : 'bg-slate-50/80 border-slate-200 opacity-60'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">{item.label}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {item.discountType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              </div>

              {/* Action Buttons: Edit, Delete, Toggle Active */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  title="Edit offer details"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete offer slice"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Active Switch Toggle */}
                <button
                  onClick={() => handleToggleActive(item.id)}
                  title={item.active ? 'Active on wheel' : 'Inactive on wheel'}
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
            </div>

            {/* Probability Stepper / Slider / Input */}
            <div className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Win Probability</span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    disabled={!item.active}
                    value={item.probability}
                    onChange={(e) => handleProbChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-0.5 text-right font-mono font-bold text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <span className="font-mono font-bold text-slate-700">%</span>
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                disabled={!item.active}
                value={item.probability}
                onChange={(e) => handleProbChange(item.id, parseFloat(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
              />
            </div>

            {/* Expiry Days & Value Details */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Voucher Expiry</span>
                <div className="flex items-center space-x-1 font-semibold text-slate-800 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.expiryDays > 0 ? `${item.expiryDays} Days` : 'Instant On Bill'}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Offer Value</span>
                <span className="font-semibold text-slate-800 mt-0.5 block font-mono">
                  {item.discountType === 'percentage'
                    ? `${item.discountValue}% OFF`
                    : item.discountType === 'fixed'
                    ? `₹${item.discountValue} Flat OFF`
                    : item.discountType === 'free_item'
                    ? 'Complimentary Item'
                    : 'Try Again'}
                </span>
                {item.minOrderAmount && item.minOrderAmount > 0 ? (
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md inline-block mt-1">
                    Min Bill ₹{item.minOrderAmount}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Reward Configuration Section (Req 18 & 19) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Google &amp; In-App Review Reward Configuration
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Req 18 &amp; 19
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure the dining incentive awarded to diners who submit a review. Dynamically reflected on customer QR menus and bill drawers.
              </p>
            </div>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <span className="text-xs font-semibold text-slate-600">Review Reward:</span>
            <div
              onClick={() =>
                setReviewConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                reviewConfig.enabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  reviewConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-xs font-bold text-slate-900">
              {reviewConfig.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {reviewSavedNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reviewSavedNotice}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateReviewRewardConfig(activeRestaurant.id, reviewConfig);
            setReviewSavedNotice('Review reward configuration successfully saved & broadcasted!');
            setTimeout(() => setReviewSavedNotice(null), 3500);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Reward Type */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reward Type *
              </label>
              <select
                value={reviewConfig.discountType}
                onChange={(e) =>
                  setReviewConfig((prev) => ({
                    ...prev,
                    discountType: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
              >
                <option value="percentage">Percentage Discount (% OFF Bill)</option>
                <option value="fixed">Fixed Rupee Discount (₹ Flat OFF)</option>
                <option value="free_item">Complimentary Dish / Item</option>
              </select>
            </div>

            {/* Offer Display Label */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reward Display Label *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10% OFF Royal Feast or Free Gulab Jamun"
                value={reviewConfig.rewardLabel}
                onChange={(e) =>
                  setReviewConfig((prev) => ({
                    ...prev,
                    rewardLabel: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
              />
            </div>

            {/* Discount Value or Free Dish Picker */}
            {reviewConfig.discountType === 'free_item' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Choose Free Menu Item *
                </label>
                <select
                  value={reviewConfig.freeMenuItemId || ''}
                  onChange={(e) => {
                    const selected = activeMenuItems.find((m) => m.id === e.target.value);
                    setReviewConfig((prev) => ({
                      ...prev,
                      freeMenuItemId: e.target.value,
                      freeMenuItemName: selected?.name || '',
                      discountValue: selected?.price || 150,
                      rewardLabel: selected ? `Free ${selected.name}` : prev.rewardLabel,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
                >
                  <option value="">-- Select from Menu Items --</option>
                  {activeMenuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (₹{item.price}) • {item.category}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {reviewConfig.discountType === 'percentage'
                    ? 'Discount Percentage (%)'
                    : 'Discount Rupee Amount (₹)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={reviewConfig.discountType === 'percentage' ? 100 : 5000}
                  value={reviewConfig.discountValue}
                  onChange={(e) =>
                    setReviewConfig((prev) => ({
                      ...prev,
                      discountValue: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Minimum Order Value */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Minimum Bill Amount (₹)
              </label>
              <input
                type="number"
                min={0}
                step={50}
                placeholder="0 = No minimum"
                value={reviewConfig.minOrderAmount || 0}
                onChange={(e) =>
                  setReviewConfig((prev) => ({
                    ...prev,
                    minOrderAmount: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Offer applies when total food &amp; beverage bill meets or exceeds this threshold.
              </span>
            </div>

            {/* Voucher Validity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Voucher Validity (Days)
              </label>
              <select
                value={reviewConfig.expiryDays || 20}
                onChange={(e) =>
                  setReviewConfig((prev) => ({
                    ...prev,
                    expiryDays: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={20}>20 Days (Ensemble Retention Cycle)</option>
                <option value={30}>30 Days (Monthly Retention)</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Number of days the customer has to redeem this reward upon issuing.
              </span>
            </div>
          </div>

          {/* Live Diner Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
                🎁
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Live Customer Preview (Table QR &amp; Review Modal)
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {reviewConfig.enabled
                    ? `SHARE YOUR DINING REVIEW & UNLOCK: ${reviewConfig.rewardLabel}`
                    : 'Review rewards currently disabled for diners'}
                </p>
                <span className="text-[10px] text-slate-500">
                  Min Bill: ₹{reviewConfig.minOrderAmount || 0} • Valid for {reviewConfig.expiryDays || 20} days
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition transform active:scale-95 cursor-pointer shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              Save Review Privilege
            </button>
          </div>
        </form>
      </div>

      {/* Add / Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div
              className="p-5 flex items-center justify-between text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center space-x-2.5">
                <Gift className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">
                  {editingItemId ? 'Edit Wheel Offer' : 'Add New Wheel Offer'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {/* Quick Preset Templates */}
              {!editingItemId && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quick Preset Ideas (1-Click Fill)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Free Dessert', type: 'free_item' as const, val: 250, desc: 'Complimentary chef special dessert with any meal', min: 0 },
                      { label: '5% OFF above ₹1000', type: 'percentage' as const, val: 5, desc: '5% discount on dining bills above ₹1,000', min: 1000 },
                      { label: '10% OFF Welcome', type: 'percentage' as const, val: 10, desc: '10% instant discount on total bill', min: 500 },
                      { label: 'Free Craft Mocktail', type: 'free_item' as const, val: 180, desc: 'Complimentary mocktail or drink of choice', min: 0 },
                      { label: '₹150 Flat Discount', type: 'fixed' as const, val: 150, desc: 'Flat ₹150 off on orders above ₹800', min: 800 },
                      { label: '15% OFF Return Feast', type: 'percentage' as const, val: 15, desc: '15% off on your next visit', min: 1200 },
                      { label: 'Free Starter Appetizer', type: 'free_item' as const, val: 350, desc: 'Complimentary starter with main course', min: 600 },
                      { label: 'Better Luck Next Time', type: 'no_luck' as const, val: 0, desc: 'Try your luck again on your next feast!', min: 0 },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormLabel(preset.label);
                          setFormType(preset.type);
                          setFormValue(preset.val);
                          setFormDescription(preset.desc);
                          setFormMinOrderAmount(preset.min);
                        }}
                        className="px-2 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 shadow-xs transition"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Offer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Offer Name / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Dessert, 5% OFF on above 1000"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
                />
              </div>

              {/* Offer Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reward Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
                >
                  <option value="percentage">Percentage Discount (% OFF Bill)</option>
                  <option value="fixed">Fixed Rupee Discount (₹ Flat OFF)</option>
                  <option value="free_item">Complimentary Dish / Item</option>
                  <option value="no_luck">Better Luck Next Time / Welcome Bite</option>
                </select>
              </div>

              {/* Offer Value */}
              {formType !== 'no_luck' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {formType === 'percentage'
                        ? 'Discount (%)'
                        : formType === 'fixed'
                        ? 'Discount (₹)'
                        : 'Approx Value (₹)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={formType === 'percentage' ? 100 : 5000}
                      value={formValue}
                      onChange={(e) => setFormValue(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
                    />
                  </div>

                  {/* Minimum Order Value */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Min Bill Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      placeholder="0 = Any bill"
                      value={formMinOrderAmount || ''}
                      onChange={(e) => setFormMinOrderAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Terms for Diners
                </label>
                <input
                  type="text"
                  placeholder="e.g. Valid on food and beverage bills above ₹1,000"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
                />
              </div>

              {/* Expiry Days */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Voucher Validity (Days)
                </label>
                <select
                  value={formExpiryDays}
                  onChange={(e) => setFormExpiryDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium text-slate-900"
                >
                  <option value={0}>Instant (Applied to Current Visit)</option>
                  <option value={7}>7 Days (Next Visit)</option>
                  <option value={14}>14 Days (Next Visit)</option>
                  <option value={20}>20 Days (Ensemble 2-Coupon Window)</option>
                  <option value={30}>30 Days (Monthly Retention)</option>
                </select>
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Wheel Slice Color
                </label>
                <div className="flex items-center space-x-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                        formColor === color
                          ? 'border-slate-900 scale-110 shadow-sm'
                          : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow transition active:scale-95 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {editingItemId ? 'Update Offer' : 'Create Offer & Rebalance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
