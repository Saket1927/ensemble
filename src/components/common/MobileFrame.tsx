import React, { ReactNode } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Wifi, BatteryMedium, Sparkles } from 'lucide-react';

export const MobileFrame: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { customerViewMode, activeRestaurant, activeTable } = useTenant();

  if (customerViewMode === 'responsive') {
    return <div className="min-h-screen w-full bg-[#fbf9f5]">{children}</div>;
  }

  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-950/95 py-6 px-4 flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          backgroundColor: activeRestaurant.branding.primaryColor,
          top: '20%',
        }}
      />

      {/* Frame Top Meta Helper */}
      <div className="mb-3 text-center text-xs text-slate-400 flex items-center space-x-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-slate-300">
          Simulating Customer Table Scan: {activeRestaurant.name} • Table {activeTable}
        </span>
      </div>

      {/* Device Bezel */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/10 flex flex-col overflow-hidden">
        {/* Hardware buttons simulation */}
        <div className="absolute -left-[7px] top-28 w-[3px] h-10 bg-slate-600 rounded-l" />
        <div className="absolute -left-[7px] top-42 w-[3px] h-12 bg-slate-600 rounded-l" />
        <div className="absolute -left-[7px] top-58 w-[3px] h-12 bg-slate-600 rounded-l" />
        <div className="absolute -right-[7px] top-36 w-[3px] h-16 bg-slate-600 rounded-r" />

        {/* Screen inner */}
        <div className="relative w-full h-full bg-[#fbf9f5] rounded-[40px] overflow-hidden flex flex-col shadow-inner select-none">
          {/* Status Bar */}
          <div className="bg-[#162c21] text-[#fbf9f5] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-medium tracking-tight shrink-0 z-40 transition-colors"
               style={{ backgroundColor: activeRestaurant.branding.primaryColor }}>
            <span>7:15</span>
            {/* Dynamic Island pill */}
            <div className="w-20 h-4 bg-black/40 rounded-full flex items-center justify-center space-x-1 px-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
              <span className="text-[9px] text-white/80 font-mono tracking-tighter">Table #{activeTable}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-white/90">
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Screen Content Scrollable Container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-none flex flex-col">
            {children}
          </div>

          {/* Home indicator bar */}
          <div className="w-full bg-[#fbf9f5] py-1.5 flex justify-center shrink-0 z-40">
            <div className="w-32 h-1 bg-slate-400/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
