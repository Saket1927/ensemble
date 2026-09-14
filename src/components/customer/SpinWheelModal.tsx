import React, { useState, useRef, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { RewardWheelItem, CustomerReward } from '../../types/tenant';
import { X, Sparkles, Gift, QrCode, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StandardQRCode } from '../common/StandardQRCode';

interface SpinWheelModalProps {
  onClose: () => void;
  onRewardWon: () => void;
}

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ onClose, onRewardWon }) => {
  const {
    activeRestaurant,
    activeRewardItems,
    addCustomerReward,
    addUnifiedCoupon,
    consumeCustomerSpin,
    activeTable,
    currentTableSession,
    customerSession,
    recordTableSpinWon,
  } = useTenant();

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wonItem, setWonItem] = useState<RewardWheelItem | null>(null);
  const [wonRewardRecord, setWonRewardRecord] = useState<CustomerReward | null>(null);
  const [rotation, setRotation] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  const activeSlices = activeRewardItems.filter((i) => i.active);
  const numSlices = activeSlices.length;
  const arc = (2 * Math.PI) / numSlices;

  // Draw Luxury Wheel onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 12;

    ctx.clearRect(0, 0, width, height);

    // Outer luxury gold rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = secondaryColor || '#c5a96d';
    ctx.fill();

    // Inner rim line
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#0e1d16';
    ctx.fill();

    // Draw slices
    activeSlices.forEach((slice, i) => {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = slice.color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Subtle divider line
      ctx.strokeStyle = `${secondaryColor}80`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = slice.textColor || '#ffffff';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(slice.label, radius - 20, 4);
      ctx.restore();
    });

    // Center luxury brass hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = secondaryColor || '#c5a96d';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
    ctx.fillStyle = primaryColor || '#162c21';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }, [activeSlices, arc, primaryColor, secondaryColor]);

  const handleSpin = () => {
    if (isSpinning || wonItem) return;

    setIsSpinning(true);

    // Calculate prize based on probabilities
    const randomPercent = Math.random() * 100;
    let accumulated = 0;
    let selectedIndex = 0;

    for (let i = 0; i < activeSlices.length; i++) {
      accumulated += activeSlices[i].probability;
      if (randomPercent <= accumulated) {
        selectedIndex = i;
        break;
      }
    }

    const selectedPrize = activeSlices[selectedIndex];

    // Physics spin math:
    // Top pointer is at 270 degrees (or -90 deg). We want slice center to stop at top pointer.
    const sliceAngleDegrees = 360 / numSlices;
    const targetSliceCenterDeg = selectedIndex * sliceAngleDegrees + sliceAngleDegrees / 2;
    // Extra full spins (5 to 7 full rotations)
    const extraRotations = 360 * 6;
    // Calculate final angle so pointer lands on selected prize
    const targetRotation = extraRotations + (360 - targetSliceCenterDeg) + 270;

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonItem(selectedPrize);
      consumeCustomerSpin();

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [secondaryColor, '#10b981', '#ffffff', '#f59e0b'],
      });

      // Generate unique voucher code
      const prefix = activeRestaurant.name.slice(0, 4).toUpperCase();
      const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      const code = `${prefix}-${randomCode}`;

      // Save to My Rewards wallet
      if (selectedPrize.discountType !== 'no_luck') {
        const saved = addCustomerReward({
          restaurantId: activeRestaurant.id,
          code,
          rewardLabel: selectedPrize.label,
          discountType: selectedPrize.discountType as any,
          discountValue: selectedPrize.discountValue,
          expiresAt: `${selectedPrize.expiryDays} Days`,
          status: 'active',
          qrData: `${code}-T${activeTable}`,
          tableNumber: activeTable,
        });
        setWonRewardRecord(saved);

        addUnifiedCoupon({
          restaurantId: activeRestaurant.id,
          customerPhone: customerSession?.phone || 'Guest',
          voucherCode: code,
          rewardLabel: selectedPrize.label,
          discountType: selectedPrize.discountType as any,
          discountValue: selectedPrize.discountValue,
          slot: 'active',
          source: 'spin_win',
          expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
          tableNumber: activeTable,
        });
      }

      // Record in session so all co-diners on this table see the winner and cannot spin again
      recordTableSpinWon(
        activeTable,
        customerSession?.name || 'Table Guest',
        customerSession?.phone || '',
        {
          label: selectedPrize.label,
          code,
          discountType: selectedPrize.discountType,
          discountValue: selectedPrize.discountValue,
        }
      );
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#fbf9f5] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-300/80 relative flex flex-col items-center p-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {currentTableSession?.spinStatus === 'completed' && !wonItem ? (
          /* Already Won Table Notice (Only 1 spin per table session rule) */
          <div className="space-y-4 w-full flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block mb-1">
                Table Reward Already Unlocked
              </span>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Reward Already Won for Table #{activeTable}
              </h3>
              <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
                Your host <strong className="text-slate-900">{currentTableSession.spinWinnerName || currentTableSession.hostName}</strong> has already unlocked an offer for this table session.
              </p>
            </div>

            {currentTableSession.spinReward && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center w-full">
                <div className="text-sm font-bold text-amber-900">{currentTableSession.spinReward.label}</div>
                <div className="text-[11px] font-mono font-bold text-amber-700 mt-0.5">
                  Voucher Code: {currentTableSession.spinReward.code}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 max-w-xs">
              Under our fair dining policy, one Spin & Win reward is permitted per table session. Your next personal spin will unlock on your next visit!
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-xs font-bold text-white shadow transition-transform active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              Back to Dining Table
            </button>
          </div>
        ) : !wonItem ? (
          /* Spin Wheel Phase */
          <div className="space-y-4 w-full flex flex-col items-center">
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-widest block"
                style={{ color: secondaryColor }}
              >
                Exclusive Dining Privilege
              </span>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Spin & Win
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Table #{activeTable} • Special reward courtesy of {activeRestaurant.name}
              </p>
            </div>

            {/* Wheel Container */}
            <div className="relative my-2">
              {/* Pointer at Top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] filter drop-shadow-md"
                   style={{ borderTopColor: secondaryColor || '#c5a96d' }} />

              {/* Canvas Wheel with CSS Rotation Transition */}
              <div
                className="rounded-full shadow-2xl overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning
                    ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)'
                    : 'none',
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="w-[280px] h-[280px]"
                />
              </div>
            </div>

            {/* Spin CTA Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${
                isSpinning ? 'opacity-80 cursor-not-allowed' : 'hover:opacity-95'
              }`}
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 24px -4px ${primaryColor}60`,
              }}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSpinning ? 'Spinning the Wheel...' : 'SPIN THE WHEEL'}</span>
            </button>
          </div>
        ) : (
          /* Reward Outcome Phase */
          <div className="space-y-4 w-full animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
              <Gift className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest block"
                style={{ color: secondaryColor }}
              >
                {wonItem.discountType === 'no_luck' ? 'Thank You For Dining' : 'Congratulations!'}
              </span>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                {wonItem.label}
              </h2>
              <p className="text-xs text-slate-600">
                {wonItem.description}
              </p>
            </div>

            {wonRewardRecord ? (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Voucher Code</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded tracking-wider">
                    {wonRewardRecord.code}
                  </span>
                </div>

                {/* Billing QR Scannable Code */}
                <div className="flex flex-col items-center py-2 space-y-2">
                  <div className="p-2 bg-white border-2 border-slate-900 rounded-xl shadow-inner flex items-center justify-center">
                    <StandardQRCode url={wonRewardRecord.code} size={110} />
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                    Show this QR code at billing
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 text-center">
                  Saved automatically in your "My Rewards" section. Valid for {wonItem.expiryDays} days.
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 p-4 rounded-xl text-xs text-slate-600">
                We're delighted to host you today at Table {activeTable}. Share your experience with friends for another spin!
              </div>
            )}

            <button
              onClick={() => {
                onClose();
                onRewardWon();
              }}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition flex items-center justify-center space-x-2"
              style={{ backgroundColor: primaryColor }}
            >
              <span>View In My Rewards</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
