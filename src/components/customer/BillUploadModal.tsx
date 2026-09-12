import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Camera, Upload, Sparkles, CheckCircle2, Gift, X, ShieldCheck, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BillUploadModalProps {
  onClose: () => void;
}

export const BillUploadModal: React.FC<BillUploadModalProps> = ({ onClose }) => {
  const {
    activeRestaurant,
    activeTable,
    customerSession,
    uploadBillToMaster,
  } = useTenant();

  const [billImage, setBillImage] = useState<string | null>(null);
  const [reportedTotal, setReportedTotal] = useState<string>('2450');
  const [isScratching, setIsScratching] = useState(false);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [wonResult, setWonResult] = useState<{ label: string; value: number; code: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  const handleSimulatePhoto = () => {
    // Preset high-res receipt sample
    setBillImage('https://images.unsplash.com/photo-1554415707-9e4966675033?auto=format&fit=crop&w=600&q=80');
  };

  const handleUploadSubmit = () => {
    if (!billImage) return;

    const res = uploadBillToMaster({
      tableNumber: activeTable,
      customerName: customerSession?.name || 'Table Guest',
      customerPhone: customerSession?.phone || '+91 98200 11223',
      billPhotoUrl: billImage,
      reportedAppTotal: Number(reportedTotal) || 2000,
    });

    setWonResult(res.wonDiscount);
    setSubmitted(true);
  };

  const handleRevealScratch = () => {
    setIsScratching(true);
    setTimeout(() => {
      setScratchRevealed(true);
      setIsScratching(false);
      if (wonResult) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c5a96d', '#162c21', '#ffffff'],
        });
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-left">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow"
              style={{ backgroundColor: primaryColor }}
            >
              <Gift className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Upload Physical Bill</h3>
              <p className="text-[10px] text-amber-600 font-semibold">Section 8a: Instant Scratch Card</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <div className="space-y-3 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">
              Snap a clear photo of your paper restaurant receipt to verify your visit directly with the platform and instantly receive a mystery discount scratch card.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-2">
              {billImage ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-300 max-h-40">
                  <img src={billImage} alt="Receipt preview" className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    Photo Captured ✓
                  </span>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <Camera className="w-8 h-8 text-slate-400" />
                  <p className="text-xs font-semibold">No receipt photo attached</p>
                  <button
                    type="button"
                    onClick={handleSimulatePhoto}
                    className="text-xs bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl shadow hover:bg-slate-800 transition-colors"
                  >
                    Simulate Camera Snap
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Final Billed Amount (₹)
              </label>
              <input
                type="number"
                value={reportedTotal}
                onChange={(e) => setReportedTotal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[10px] text-amber-800 space-y-1">
              <p className="font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Official Reward Verification</span>
              </p>
              <p>Receipt data is verified securely to ensure platform reward compliance.</p>
            </div>

            <button
              onClick={handleUploadSubmit}
              disabled={!billImage}
              className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg disabled:opacity-50 transition-transform active:scale-95 flex items-center justify-center space-x-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Upload className="w-4 h-4" />
              <span>Submit Bill & Unlock Scratch Card</span>
            </button>
          </div>
        ) : (
          /* Instant Scratch Card Presentation */
          <div className="py-4 space-y-4">
            <span className="text-xs font-bold text-slate-700 block">
              Tap the card below to scratch & reveal your reward:
            </span>

            <div
              onClick={handleRevealScratch}
              className={`relative mx-auto w-56 h-36 rounded-2xl border-2 shadow-xl cursor-pointer flex flex-col items-center justify-center transition-all transform hover:scale-102 ${
                scratchRevealed
                  ? wonResult
                    ? 'bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-amber-400'
                    : 'bg-slate-100 border-slate-300'
                  : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-slate-600 text-white'
              }`}
            >
              {!scratchRevealed ? (
                <div className="flex flex-col items-center space-y-2 p-3 text-center">
                  <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                  <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
                    VIP Bonus Card
                  </span>
                  <span className="text-[10px] text-slate-300">Tap to Scratch</span>
                </div>
              ) : wonResult ? (
                <div className="flex flex-col items-center space-y-1 p-2 text-center animate-fadeIn">
                  <Gift className="w-7 h-7 text-amber-700" />
                  <span className="text-sm font-black text-amber-950 font-serif">
                    {wonResult.label}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-amber-900 text-amber-100 px-2 py-0.5 rounded">
                    {wonResult.code}
                  </span>
                  <span className="text-[9px] text-amber-800 font-semibold">
                    Saved directly to your 2-Coupon Wallet!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1 p-2 text-center">
                  <span className="text-sm font-bold text-slate-700">Better Luck Next Time</span>
                  <span className="text-[10px] text-slate-500">
                    Thank you for dining with us! Spin the wheel on your next visit.
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow"
            >
              Done / Return to Dining
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
