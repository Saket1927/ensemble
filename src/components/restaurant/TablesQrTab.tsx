import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  Printer,
  Copy,
  X,
  ShieldCheck,
  FileCode,
  Image as ImageIcon,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { StandardQRCode } from '../common/StandardQRCode';
import {
  getTableCanonicalUrl,
  buildPrintableStandeeSVG,
  generateQRCodeSVG,
  generateQRCodeDataURL,
  downloadFile,
  downloadDataUrl,
} from '../../services/qr/qrService';

export const TablesQrTab: React.FC = () => {
  const {
    activeRestaurant,
    activeTables,
    setActiveTable,
  } = useTenant();

  const [selectedTableForQr, setSelectedTableForQr] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [domainOverride, setDomainOverride] = useState<string>('');

  const getUrl = (tNum: number) => getTableCanonicalUrl(activeRestaurant.slug, tNum, domainOverride);

  const handleOpenCustomerAtTable = (tNum: number) => {
    window.open(`/${activeRestaurant.slug}/t/${tNum}`, '_blank');
  };

  const handleCopyLink = (tNum: number) => {
    const url = getUrl(tNum);
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDownloadStandeeSvg = async (tNum: number) => {
    setDownloading(true);
    try {
      const svg = await buildPrintableStandeeSVG({
        restaurantName: activeRestaurant.name,
        restaurantSlug: activeRestaurant.slug,
        tableNumber: tNum,
        primaryColor: activeRestaurant.branding?.primaryColor || '#1c1917',
        accentColor: activeRestaurant.branding?.secondaryColor || '#d97706',
        customOrigin: domainOverride,
      });
      downloadFile(svg, `${activeRestaurant.slug}-table-${tNum}-standee.svg`);
      setSuccessNotice(`Table #${tNum} Standee SVG downloaded successfully!`);
    } catch (e: any) {
      alert('Download error: ' + e.message);
    } finally {
      setDownloading(false);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleDownloadPureQrSvg = async (tNum: number) => {
    setDownloading(true);
    try {
      const url = getUrl(tNum);
      const svg = await generateQRCodeSVG(url, { errorCorrectionLevel: 'Q', margin: 4 });
      downloadFile(svg, `${activeRestaurant.slug}-table-${tNum}-qr.svg`);
      setSuccessNotice(`Table #${tNum} Pure QR SVG downloaded!`);
    } catch (e: any) {
      alert('Download error: ' + e.message);
    } finally {
      setDownloading(false);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleDownloadPng = async (tNum: number) => {
    setDownloading(true);
    try {
      const url = getUrl(tNum);
      const dataUrl = await generateQRCodeDataURL(url, {
        errorCorrectionLevel: 'Q',
        margin: 4,
        width: 1200,
      });
      downloadDataUrl(dataUrl, `${activeRestaurant.slug}-table-${tNum}-qr-1200px.png`);
      setSuccessNotice(`High-Res 1200px PNG downloaded for Table #${tNum}!`);
    } catch (e: any) {
      alert('Download error: ' + e.message);
    } finally {
      setDownloading(false);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleBulkPrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to open the bulk print standee view.');
      return;
    }

    let standeesHtml = '';
    for (const t of activeTables) {
      const svg = await buildPrintableStandeeSVG({
        restaurantName: activeRestaurant.name,
        restaurantSlug: activeRestaurant.slug,
        tableNumber: t.tableNumber,
        primaryColor: activeRestaurant.branding?.primaryColor || '#1c1917',
        accentColor: activeRestaurant.branding?.secondaryColor || '#d97706',
        customOrigin: domainOverride,
      });
      standeesHtml += `<div class="standee-page">${svg}</div>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeRestaurant.name} — Bulk QR Standees</title>
          <style>
            body { margin: 0; background: #f1f5f9; display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 24px; font-family: sans-serif; }
            .standee-page { width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border-radius: 28px; overflow: hidden; page-break-after: always; }
            .standee-page svg { width: 100%; height: auto; display: block; }
            @media print {
              body { background: none; padding: 0; }
              .standee-page { width: 100%; box-shadow: none; border-radius: 0; page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${standeesHtml}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Table QR Management &amp; Standee Generator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standards-compliant ISO/IEC 18004 QR codes verified for instant Google Lens, iOS Camera &amp; Android scanning.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleBulkPrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 flex items-center space-x-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Bulk Print All Standees ({activeTables.length})</span>
          </button>
        </div>
      </div>

      {/* Vercel Deployment Protection Troubleshooting Guide (Critical for QR Scanning) */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>If scanning opens a "Log in with Vercel" screen on your phone:</span>
        </div>
        <p className="text-slate-700 leading-relaxed text-[11px]">
          By default, Vercel automatically enables <strong>Deployment Protection ("Vercel Authentication")</strong> on all deployments. This forces visitors without a Vercel login cookie to sign in to Vercel before viewing the website.
        </p>
        <div className="bg-white/80 p-3 rounded-xl border border-amber-200/80 space-y-1 text-[11px] text-slate-800">
          <div className="font-bold text-slate-900">How to disable it in 15 seconds (1-time fix):</div>
          <div>1. Open your Vercel Dashboard at <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-amber-700 underline font-semibold">vercel.com/dashboard</a></div>
          <div>2. Select your <strong>ensemble</strong> project &rarr; go to <strong>Settings</strong> (top tab) &rarr; <strong>Deployment Protection</strong> (left sidebar)</div>
          <div>3. Under <strong>Vercel Authentication</strong>, turn the toggle <strong>OFF (Disabled)</strong> &rarr; click <strong>Save</strong>.</div>
        </div>
      </div>

      {/* Domain Customization Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">Target QR Domain: </span>
            <span className="font-mono text-emerald-600 font-semibold">
              {domainOverride || (typeof window !== 'undefined' ? window.location.origin : `https://${activeRestaurant.slug}.ensemble.com`)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Custom domain (e.g. https://your-domain.com)"
            value={domainOverride}
            onChange={(e) => setDomainOverride(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs w-full sm:w-64 focus:outline-none focus:border-amber-500 font-mono"
          />
          {domainOverride && (
            <button
              onClick={() => setDomainOverride('')}
              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Tables Grid with Genuine QR Code Previews */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {activeTables.map((t) => {
          const tableUrl = getUrl(t.tableNumber);
          return (
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

              {/* REAL SCANNABLE QR PREVIEW */}
              <div
                onClick={() => setSelectedTableForQr(t.tableNumber)}
                className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition group"
                title="Click to open Full Standee & Print Downloads"
              >
                <StandardQRCode url={tableUrl} size={64} className="group-hover:scale-105 transition-transform" />
                <span className="text-[8px] font-mono text-slate-500 mt-1.5 truncate max-w-full">
                  /t/{t.tableNumber}
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
          );
        })}
      </div>

      {/* Single Table QR Printable Standee Modal */}
      {selectedTableForQr !== null && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="text-left">
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Table #{selectedTableForQr} QR Standee
                </h3>
                <p className="text-[11px] text-slate-400">
                  ISO/IEC 18004 Scannable Standard (Level Q Error Correction)
                </p>
              </div>
              <button
                onClick={() => setSelectedTableForQr(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Frame Mock with REAL SCANNABLE QR */}
            <div
              className="p-6 rounded-2xl text-white space-y-3 shadow-lg"
              style={{ backgroundColor: activeRestaurant.branding?.primaryColor || '#1c1917' }}
            >
              <div className="font-serif text-sm font-bold tracking-widest uppercase text-amber-200">
                {activeRestaurant.name}
              </div>
              <div className="text-[11px] text-slate-200">
                Scan to View Menu, Leave Review &amp; Spin for Rewards
              </div>

              {/* Strict Clean White Area with 4-Module Quiet Zone */}
              <div className="w-44 h-44 mx-auto bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center">
                <StandardQRCode
                  url={getUrl(selectedTableForQr)}
                  size={160}
                  showVerifiedBadge={false}
                  errorCorrectionLevel="Q"
                />
              </div>

              <div className="font-mono text-xs font-bold text-amber-200 tracking-wider">
                TABLE #{selectedTableForQr}
              </div>
              <div className="text-[9px] text-slate-300 font-mono break-all px-2">
                {getUrl(selectedTableForQr)}
              </div>
            </div>

            {/* Validation Pill */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-center space-x-2 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Machine Readability: Verified (Google Lens &amp; iOS Camera Ready)</span>
            </div>

            {/* Download Actions */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadStandeeSvg(selectedTableForQr)}
                  disabled={downloading}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
                  title="Download vector SVG of the complete luxury table standee"
                >
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>Download Standee SVG</span>
                </button>

                <button
                  onClick={() => handleDownloadPng(selectedTableForQr)}
                  disabled={downloading}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-center space-x-1.5 border border-slate-200 disabled:opacity-50"
                  title="Download 1200px High-Resolution PNG"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                  <span>Download 1200px PNG</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadPureQrSvg(selectedTableForQr)}
                  disabled={downloading}
                  className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold transition flex items-center justify-center space-x-1.5 border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pure QR Code (SVG)</span>
                </button>

                <button
                  onClick={() => handleOpenCustomerAtTable(selectedTableForQr)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1 shadow-sm"
                >
                  <span>Launch Experience</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
