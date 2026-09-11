import React from 'react';
import { Activity, QrCode, Sparkles, Star, Tag, Share2, Clock } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const events = [
    {
      id: 'e1',
      tenant: 'HERITAGE',
      table: 'Table 12',
      type: 'Spin Won',
      detail: 'Diner won 15% OFF Voucher • Code: HRTG-8F42K',
      time: 'Just now',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'e2',
      tenant: 'HERITAGE',
      table: 'Table 4',
      type: '5-Star Review',
      detail: '"An absolute masterpiece of Indian gastronomy. 24hr Dal Makhani is legendary."',
      time: '2 mins ago',
      icon: Star,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      id: 'e3',
      tenant: 'BAMBAI HOUSE',
      table: 'Table 7',
      type: 'QR Scan',
      detail: 'Guest opened digital menu on mobile device',
      time: '5 mins ago',
      icon: QrCode,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      id: 'e4',
      tenant: 'THE TABLE',
      table: 'Table 18',
      type: 'Voucher Redeemed',
      detail: 'Server verified code TTBL-901K at billing (₹450 savings)',
      time: '9 mins ago',
      icon: Tag,
      color: 'text-rose-400 bg-rose-500/10',
    },
    {
      id: 'e5',
      tenant: 'HERITAGE',
      table: 'Table 9',
      type: 'Social Proof Upload',
      detail: 'Pooja Verma uploaded Instagram story proof with #HeritageGrand',
      time: '14 mins ago',
      icon: Share2,
      color: 'text-pink-400 bg-pink-500/10',
    },
    {
      id: 'e6',
      tenant: 'BAMBAI HOUSE',
      table: 'Table 2',
      type: 'Referral Generated',
      detail: 'Guest generated unique invite link for ₹200 discount',
      time: '22 mins ago',
      icon: Sparkles,
      color: 'text-indigo-400 bg-indigo-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Live Platform Event Stream</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </h2>
          <p className="text-xs text-slate-400">
            Real-time audit log of guest interactions, reviews, spins, and redemptions across all restaurant subdomains.
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Streaming Live Telemetry
        </span>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md divide-y divide-slate-800/70">
        {events.map((evt) => {
          const Icon = evt.icon;
          return (
            <div
              key={evt.id}
              className="p-4 flex items-start justify-between space-x-4 hover:bg-slate-900/40 transition"
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-xl shrink-0 ${evt.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{evt.tenant}</span>
                    <span className="text-slate-500 text-[10px]">•</span>
                    <span className="text-slate-400 text-[11px] font-medium">{evt.table}</span>
                    <span className="text-slate-500 text-[10px]">•</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                      {evt.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{evt.detail}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1 shrink-0">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{evt.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
