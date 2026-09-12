import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { BillConfiguration, CustomCharge } from '../../types/tenant';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Building,
  DollarSign,
  Eye,
  Save,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const BillSettingsTab: React.FC = () => {
  const { activeRestaurant, billConfigsMap, updateBillConfiguration } = useTenant();

  const currentConfig: BillConfiguration = billConfigsMap[activeRestaurant.id] || {
    restaurantId: activeRestaurant.id,
    restaurantName: activeRestaurant.name,
    logoUrl: activeRestaurant.branding?.logoUrl || '',
    address: activeRestaurant.address || 'Ghodbunder Road, Thane West, Mumbai',
    phone: activeRestaurant.phone || '+91 98200 48123',
    gstin: '27AABCT2819C1Z4',
    fssai: '11521024000492',
    website: activeRestaurant.website || `https://ensemble-restaurant.vercel.app/${activeRestaurant.slug}`,
    socialHandle: activeRestaurant.socials?.instagram || '@restaurant',
    footerMessage: 'Thank you for dining with us! Please scan your receipt to earn loyalty rewards.',
    thankYouMessage: 'We look forward to welcoming you again.',
    termsAndConditions: 'Taxes as per government norms. Service charge is voluntary and discretionary.',
    paymentInstructions: 'UPI / Cards / Cash accepted at table.',
    templateStyle: 'standard',
    charges: [
      { id: 'ch_gst', name: 'GST (SGST 2.5% + CGST 2.5%)', type: 'percentage', value: 5, active: true, order: 1 },
      { id: 'ch_sc', name: 'Staff Service Charge', type: 'percentage', value: 5, active: true, order: 2 },
      { id: 'ch_pkg', name: 'Packaging & Sanitized Cutlery', type: 'fixed', value: 30, active: true, order: 3 },
    ],
    showLogo: true,
    showGstin: true,
    showAddress: true,
    showPhone: true,
    showTableNumber: true,
    showCustomerName: true,
    showPaymentMethod: true,
    showTaxBreakdown: true,
    showDiscountBreakdown: true,
    showFooterMessage: true,
  };

  const [formConfig, setFormConfig] = useState<BillConfiguration>(currentConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New charge inputs
  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeType, setNewChargeType] = useState<'percentage' | 'fixed'>('percentage');
  const [newChargeValue, setNewChargeValue] = useState<number>(5);

  const handleSave = () => {
    updateBillConfiguration(formConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddCharge = () => {
    if (!newChargeName.trim() || newChargeValue <= 0) return;
    const newCharge: CustomCharge = {
      id: `ch_${Date.now()}`,
      name: newChargeName.trim(),
      type: newChargeType,
      value: Number(newChargeValue),
      active: true,
      order: formConfig.charges.length + 1,
    };
    setFormConfig({
      ...formConfig,
      charges: [...formConfig.charges, newCharge],
    });
    setNewChargeName('');
    setNewChargeValue(5);
  };

  const handleRemoveCharge = (id: string) => {
    setFormConfig({
      ...formConfig,
      charges: formConfig.charges.filter((c) => c.id !== id),
    });
  };

  const handleToggleCharge = (id: string) => {
    setFormConfig({
      ...formConfig,
      charges: formConfig.charges.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    });
  };

  // Mock live bill preview calculation
  const sampleSubtotal = 1450;
  let runningTotal = sampleSubtotal;
  const calculatedCharges = formConfig.charges
    .filter((c) => c.active)
    .map((c) => {
      const amount = c.type === 'percentage' ? Math.round((sampleSubtotal * c.value) / 100) : c.value;
      runningTotal += amount;
      return { ...c, amount };
    });
  const sampleDiscount = 145; // 10% sample coupon
  const sampleGrandTotal = Math.max(0, runningTotal - sampleDiscount);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              Sections 28–33: Bill Engine
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600">{activeRestaurant.name}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Restaurant Bill Configuration</h2>
          <p className="text-xs text-slate-500">
            Customize header branding, legal compliance (GSTIN/FSSAI), dynamic charges, tax breakdown, and live preview.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center space-x-2 shrink-0 transition"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Configuration Saved!' : 'Save Bill Format'}</span>
        </button>
      </div>

      {/* Main 2-Column Grid: Left Controls (7 cols) + Right Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Template Style & Header Identity */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Building className="w-4 h-4 text-slate-500" />
              <span>Bill Identity & Header Branding</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Restaurant Legal Name</label>
                <input
                  type="text"
                  value={formConfig.restaurantName}
                  onChange={(e) => setFormConfig({ ...formConfig, restaurantName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Template Style</label>
                <select
                  value={formConfig.templateStyle}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      templateStyle: e.target.value as 'standard' | 'compact' | 'detailed',
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                >
                  <option value="standard">Standard Dining Invoice</option>
                  <option value="compact">Compact Thermal Print</option>
                  <option value="detailed">Detailed Fine Dining Itemized</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Registered Address</label>
                <input
                  type="text"
                  value={formConfig.address}
                  onChange={(e) => setFormConfig({ ...formConfig, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formConfig.phone}
                  onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Website URL</label>
                <input
                  type="text"
                  value={formConfig.website}
                  onChange={(e) => setFormConfig({ ...formConfig, website: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={formConfig.gstin}
                  onChange={(e) => setFormConfig({ ...formConfig, gstin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">FSSAI License No.</label>
                <input
                  type="text"
                  value={formConfig.fssai}
                  onChange={(e) => setFormConfig({ ...formConfig, fssai: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Configurable Restaurant Charges (Section 30) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-slate-500" />
                  <span>Configurable Restaurant Charges (GST, Service, Packaging)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applied deterministically to every table order. Historical bills remain frozen (immutable).
                </p>
              </div>
            </div>

            {/* Existing Charges List */}
            <div className="space-y-2.5">
              {formConfig.charges.map((charge) => (
                <div
                  key={charge.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={charge.active}
                      onChange={() => handleToggleCharge(charge.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{charge.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {charge.type === 'percentage' ? `${charge.value}% of Subtotal` : `Flat ₹${charge.value}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        charge.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {charge.active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleRemoveCharge(charge.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Delete charge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Custom Charge */}
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-2">Add New Configured Surcharge:</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="e.g. Midnight Convenience Fee"
                    value={newChargeName}
                    onChange={(e) => setNewChargeName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={newChargeType}
                    onChange={(e) => setNewChargeType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-slate-900"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min={1}
                    value={newChargeValue}
                    onChange={(e) => setNewChargeValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    onClick={handleAddCharge}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Messages & Terms */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Bill Footer & Guest Instructions</span>
            </h3>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Thank You / Loyalty Prompt</label>
              <input
                type="text"
                value={formConfig.footerMessage}
                onChange={(e) => setFormConfig({ ...formConfig, footerMessage: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Terms & Conditions</label>
              <textarea
                rows={2}
                value={formConfig.termsAndConditions}
                onChange={(e) => setFormConfig({ ...formConfig, termsAndConditions: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Bill Preview (Section 29) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Live Customer Bill Preview</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Interactive Preview
            </span>
          </div>

          {/* Simulated Printed Bill Card */}
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-6 shadow-xl space-y-4 font-mono text-xs text-slate-800 relative overflow-hidden">
            {/* Top Cut Ribbon */}
            <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
              <div className="font-serif font-black text-lg text-slate-900 uppercase tracking-widest">
                {formConfig.restaurantName}
              </div>
              <p className="text-[10px] text-slate-500">{formConfig.address}</p>
              <p className="text-[10px] text-slate-500">Ph: {formConfig.phone}</p>
              {formConfig.gstin && (
                <p className="text-[10px] text-slate-600 font-bold">GSTIN: {formConfig.gstin}</p>
              )}
              {formConfig.fssai && (
                <p className="text-[9px] text-slate-400">FSSAI: {formConfig.fssai}</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex justify-between text-[11px] border-b border-slate-200 pb-2 text-slate-600">
              <div>
                <span>Table: <strong>#1</strong></span>
                <span className="block text-[10px]">Guest: Abhishek S.</span>
              </div>
              <div className="text-right">
                <span>Date: {new Date().toLocaleDateString()}</span>
                <span className="block text-[10px]">Bill #: INV-{Date.now().toString().slice(-6)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 border-b border-slate-200 pb-3">
              <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase">
                <span>Item</span>
                <span>Qty x Rate</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between">
                <span>1. Butter Chicken Handi</span>
                <span className="text-slate-500">1 × ₹585</span>
                <span>₹585</span>
              </div>
              <div className="flex justify-between">
                <span>2. Paneer Angara Tikka</span>
                <span className="text-slate-500">1 × ₹425</span>
                <span>₹425</span>
              </div>
              <div className="flex justify-between">
                <span>3. Garlic Butter Naan</span>
                <span className="text-slate-500">3 × ₹95</span>
                <span>₹285</span>
              </div>
              <div className="flex justify-between">
                <span>4. Gulab Jamun Platter</span>
                <span className="text-slate-500">1 × ₹155</span>
                <span>₹155</span>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{sampleSubtotal}</span>
              </div>

              {calculatedCharges.map((ch) => (
                <div key={ch.id} className="flex justify-between text-slate-600">
                  <span>{ch.name}</span>
                  <span>₹{ch.amount}</span>
                </div>
              ))}

              <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                <span>Loyalty Voucher (10% Welcome)</span>
                <span>- ₹{sampleDiscount}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 border-t-2 border-slate-900 pt-2 mt-1">
                <span>GRAND TOTAL</span>
                <span>₹{sampleGrandTotal}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-dashed border-slate-300 pt-4 text-center space-y-1.5">
              <p className="text-[11px] font-bold text-slate-900">{formConfig.footerMessage}</p>
              <p className="text-[9px] text-slate-500 leading-tight">{formConfig.termsAndConditions}</p>
              <div className="pt-2">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-700">
                  {formConfig.paymentInstructions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
