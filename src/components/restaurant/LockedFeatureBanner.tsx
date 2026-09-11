import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

interface LockedFeatureBannerProps {
  featureName: string;
  description: string;
}

export const LockedFeatureBanner: React.FC<LockedFeatureBannerProps> = ({
  featureName,
  description,
}) => {
  const { setRole } = useTenant();

  return (
    <div className="bg-slate-900 border-2 border-dashed border-amber-500/40 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto my-12 text-slate-100 shadow-xl">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
        <Lock className="w-7 h-7" />
      </div>

      <div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
          Module Locked by Subscription Tier
        </span>
        <h3 className="text-xl font-bold text-white mt-2">{featureName}</h3>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
      </div>

      <div className="pt-2">
        <button
          onClick={() => window.open('mailto:admin@ensemble.com?subject=Upgrade%20Plan%20Tier', '_blank')}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upgrade Tier to Unlock (Contact Master Admin)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
