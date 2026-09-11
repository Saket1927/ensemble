import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { User, Phone, Sparkles, CheckCircle2, Users, ArrowRight } from 'lucide-react';

interface MandatoryIdentityModalProps {
  onSuccess: () => void;
}

export const MandatoryIdentityModal: React.FC<MandatoryIdentityModalProps> = ({ onSuccess }) => {
  const {
    activeRestaurant,
    activeTable,
    customerSession,
    registerCustomerSession,
    currentTableSession,
  } = useTenant();

  const [name, setName] = useState(customerSession?.name || '');
  const [phone, setPhone] = useState(customerSession?.phone || '');
  const [returningGreeting, setReturningGreeting] = useState<string | null>(null);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  if (customerSession) {
    return null; // Already authenticated
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const result = registerCustomerSession(name.trim(), phone.trim(), activeTable);
    if (result.isReturning) {
      setReturningGreeting(`Welcome back, ${name}! Your dining profile and rewards have been synced.`);
      setTimeout(() => {
        onSuccess();
      }, 1400);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-md text-white font-bold text-xl"
          style={{ backgroundColor: primaryColor }}
        >
          {activeRestaurant.name.charAt(0)}
        </div>

        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Table {activeTable} Dining Experience
          </span>
          <h3 className="text-xl font-serif font-bold text-slate-900 mt-2">
            Welcome to {activeRestaurant.name}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {currentTableSession ? (
              <span className="text-amber-800 font-medium">
                Joining Table {activeTable} hosted by <strong className="text-slate-900">{currentTableSession.hostName}</strong>.
              </span>
            ) : (
              'Enter your details to view the menu, join the live table session, and unlock rewards.'
            )}
          </p>
        </div>

        {returningGreeting ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs flex items-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{returningGreeting}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Abhishek Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Mobile Number (No OTP Required)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98200 11223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Zero friction: Trusted phone identification connects your table tab and vouchers.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2 mt-4"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{currentTableSession ? 'Join Table Session' : 'Enter Table & View Menu'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
