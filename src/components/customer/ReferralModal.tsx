import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { X, Award, Copy, CheckCircle2, Share2, Sparkles } from 'lucide-react';

interface ReferralModalProps {
  onClose: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ onClose }) => {
  const { activeRestaurant, grantCustomerSpin } = useTenant();
  const [copied, setCopied] = useState<boolean>(false);
  const [claimedSimulation, setClaimedSimulation] = useState<boolean>(false);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  const referralCode = `HERITAGE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const referralLink = `https://${activeRestaurant.slug}.ensemble.com/ref/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateFriendDine = () => {
    grantCustomerSpin();
    setClaimedSimulation(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#fbf9f5] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-300 relative p-6 text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center mx-auto">
          <Award className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <span
            className="text-[10px] font-bold uppercase tracking-widest block"
            style={{ color: secondaryColor }}
          >
            Dining Circle
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Refer a Friend
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Invite your friends to dine at {activeRestaurant.name}. They get an instant ₹200 welcome voucher, and you receive an extra Spin & Win privilege!
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Your Friend Gets</span>
            <span className="text-sm font-bold text-emerald-700">₹200 OFF</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">On first dining bill</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">You Receive</span>
            <span className="text-sm font-bold text-amber-700">+1 Spin</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Instant reward wheel</span>
          </div>
        </div>

        {/* Link Box */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left">
            Your Unique Referral Link
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs font-mono text-slate-700 truncate mr-2">
              {referralLink}
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider shrink-0 flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simulation button */}
        {!claimedSimulation ? (
          <button
            onClick={handleSimulateFriendDine}
            className="w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-amber-100 hover:bg-amber-200 transition border border-amber-300"
          >
            Simulate Friend Dining (Grants You 1 Spin)
          </button>
        ) : (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-center space-x-1.5 font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Bonus Spin unlocked! Close and test your spin.</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition"
          style={{ backgroundColor: primaryColor }}
        >
          Done
        </button>
      </div>
    </div>
  );
};
