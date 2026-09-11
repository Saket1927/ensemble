import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  QrCode,
  ExternalLink,
  Download,
  RotateCw,
  Eye,
  CheckCircle2,
  Printer,
  Copy,
  X,
} from 'lucide-react';

export const TablesQrTab: React.FC = () => {
  const {
    activeRestaurant,
    activeTables,
    setActiveTable,
    setRole,
  } = useTenant();

  const [selectedTableForQr, setSelectedTableForQr] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleOpenCustomerAtTable = (tNum: number) => {
    setActiveTable(tNum);
    setRole('customer');
  };

  const handleCopyLink = (tNum: number) => {
    const url = `https://${activeRestaurant.slug}.ensemble.com/t/${tNum}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDownloadQr = (tNum: number) => {
    setSuccessNotice(`High-resolution print SVG downloaded for Table #${tNum}!`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Table QR Management & Standee Generator
          </h2>
          <p className="text-xs text-slate-500">
            Every dining table has a permanent digital bridge linking directly to its unique order and reward portal.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSuccessNotice(`Printable standee package generated for all ${activeRestaurant.tablesCount} tables!`);
              setTimeout(() => setSuccessNotice(null), 3500);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Bulk Print Standees</span>
          </button>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {activeTables.map((t) => (
          <div
            key={t.tableNumber}
            className={`p-3.5 rounded-2xl border shadow-sm transition-all hover:shadow-md flex flex-col justify-between space-y-3 ${
              t.status === 'occupied'
                ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-300/40'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Table
                </span>
                <span className="font-serif text-xl font-bold text-slate-900">
                  #{t.tableNumber}
                </span>
              </div>

              <span
                className={`w-2 h-2 rounded-full ${
                  t.status === 'occupied' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
                title={`Status: ${t.status}`}
              />
            </div>

            {/* QR Visual */}
            <div
              onClick={() => setSelectedTableForQr(t.tableNumber)}
              className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition group"
            >
              <QrCode className="w-14 h-14 text-slate-800 group-hover:scale-105 transition-transform" />
              <span className="text-[9px] font-mono text-slate-500 mt-1 truncate max-w-full">
                {activeRestaurant.slug}.ensemble.com/t/{t.tableNumber}
              </span>
            </div>

            {/* Scans info */}
            <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
              <span>{t.totalScans} scans</span>
              <span className="capitalize text-slate-400">{t.status}</span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-1 pt-1">
              <button
                onClick={() => handleOpenCustomerAtTable(t.tableNumber)}
                className="py-1.5 px-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider text-center transition"
                title="Test customer view at this table"
              >
                Open View
              </button>

              <button
                onClick={() => handleCopyLink(t.tableNumber)}
                className="py-1.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold text-center transition"
              >
                {copiedUrl?.endsWith(`/t/${t.tableNumber}`) ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Single Table QR Printable Standee Modal */}
      {selectedTableForQr !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-serif font-bold text-base text-slate-900">
                Table #{selectedTableForQr} QR Standee
              </h3>
              <button
                onClick={() => setSelectedTableForQr(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Frame Mock */}
            <div
              className="p-6 rounded-2xl text-white space-y-3 shadow-lg"
              style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
            >
              <div className="font-serif text-sm font-bold tracking-widest uppercase text-amber-200">
                {activeRestaurant.name}
              </div>
              <div className="text-[11px] text-slate-200">
                Scan to View Menu, Leave Review & Spin for Rewards
              </div>

              <div className="w-40 h-40 mx-auto bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center">
                <QrCode className="w-36 h-36 text-slate-900" />
              </div>

              <div className="font-mono text-xs font-bold text-amber-200 tracking-wider">
                TABLE #{selectedTableForQr}
              </div>
              <div className="text-[9px] text-slate-300 font-mono">
                https://{activeRestaurant.slug}.ensemble.com/t/{selectedTableForQr}
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => handleDownloadQr(selectedTableForQr)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download SVG</span>
              </button>

              <button
                onClick={() => handleOpenCustomerAtTable(selectedTableForQr)}
                className="flex-1 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition"
                style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
              >
                Launch Experience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
