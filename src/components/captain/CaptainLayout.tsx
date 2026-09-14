import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  RotateCcw,
  UserCheck,
  QrCode,
  Wifi,
  WifiOff,
  ChevronRight,
  Sparkles,
  Search,
  UserX,
  ShieldCheck,
  Utensils,
  Eye,
  Minus,
  Users,
  X,
  LogOut,
  User,
  Camera,
  CameraOff,
  Phone,
  Tag,
} from 'lucide-react';
import jsQR from 'jsqr';
import { useAuth } from '../../context/AuthContext';
import { TableRecord } from '../../types/tenant';
import { CaptainOrder, OrderItemEntry } from '../../types/captain';

export const CaptainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    activeRestaurant,
    activeTables,
    tableSessions,
    orders,
    captainCalls,
    acknowledgeCaptainCall,
    confirmOrder,
    deliverOrder,
    deliverOrderItem,
    cancelOrder,
    removeOrderItem,
    captainAddOrder,
    assignManualTable,
    closeTableTab,
    resetTable,
    forceCloseSession,
    clearTable,
    reassignSessionHost,
    activeMenuItems,
    unifiedCoupons,
    redeemCoupon,
    setActiveRestaurantSlug,
    restaurants,
    applyDiscountToTable,
    recordTableSpinWon,
    activeRewardItems,
  } = useTenant();

  // Enforce Captain restaurant isolation
  useEffect(() => {
    if (user?.restaurantSlug && user.restaurantSlug !== activeRestaurant.slug) {
      setActiveRestaurantSlug(user.restaurantSlug);
    } else if (user?.restaurantId && user.restaurantId !== activeRestaurant.id) {
      const match = restaurants.find((r) => r.id === user.restaurantId);
      if (match) {
        setActiveRestaurantSlug(match.slug);
      }
    }
  }, [user, activeRestaurant, restaurants, setActiveRestaurantSlug]);

  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(() => {
    return activeTables[0]?.tableNumber || 1;
  });

  // Automatically sync selectedTableNumber when activeRestaurant or activeTables update
  useEffect(() => {
    if (activeTables.length > 0) {
      if (!selectedTableNumber || !activeTables.some((t) => t.tableNumber === selectedTableNumber)) {
        setSelectedTableNumber(activeTables[0].tableNumber);
      }
    }
  }, [activeRestaurant.id, activeTables, selectedTableNumber]);

  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'occupied' | 'bill_requested' | 'paid_pending_reset'>('all');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [clearNotification, setClearNotification] = useState<string | null>(null);
  const [scannedCodeInput, setScannedCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Selected table session & orders
  const activeRestaurantId = activeRestaurant.id;
  const currentSessions = tableSessions[activeRestaurantId] || [];
  const selectedSession = currentSessions.find(
    (s) => s.tableNumber === selectedTableNumber && s.status !== 'closed' && s.status !== 'discarded'
  );
  const selectedTableRecord = activeTables.find((t) => t.tableNumber === selectedTableNumber);
  const tableOrders = orders.filter(
    (o) => o.restaurantId === activeRestaurantId && o.tableNumber === selectedTableNumber && o.status !== 'cancelled'
  );

  // Prep timer selection state for confirming orders
  const [selectedPrepMinutes, setSelectedPrepMinutes] = useState<Record<string, 10 | 20 | 30>>({});

  // Ghost Host Reassign Inputs
  const [reassignName, setReassignName] = useState('');
  const [reassignPhone, setReassignPhone] = useState('');

  // POS Visual Menu Picker state
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSelectedCat, setMenuSelectedCat] = useState('All');
  const [menuVegOnly, setMenuVegOnly] = useState(false);
  const [stagedItems, setStagedItems] = useState<Record<string, number>>({});

  // Walk-in Table Assignment state
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinGuests, setWalkinGuests] = useState(2);

  // Unacknowledged pending calls
  const pendingCalls = captainCalls.filter((c) => c.status === 'pending');

  // Realtime countdown clock ticker
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Charges calculation for the selected table
  const subtotal = tableOrders.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((iSum, item) => iSum + item.price * item.quantity, 0)
    );
  }, 0);

  const gstRate = activeRestaurant.chargesConfig?.gstPercent || 5;
  const serviceRate = activeRestaurant.chargesConfig?.serviceChargePercent || 5;
  const packaging = activeRestaurant.chargesConfig?.packagingFee || 30;

  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const serviceAmount = Math.round((subtotal * serviceRate) / 100);
  const appliedDiscountAmount = selectedSession?.appliedDiscount?.amount || 0;
  const totalBill = subtotal > 0 ? Math.max(0, subtotal + gstAmount + serviceAmount + packaging - appliedDiscountAmount) : 0;

  // Filtered tables
  const filteredTables = activeTables.filter((table) => {
    if (filterStatus === 'all') return true;
    return table.status === filterStatus;
  });

  // Apply Discount Modal State (Req 43-48)
  const [discountModalOpen, setDiscountModalOpen] = useState<boolean>(false);
  const [discountSearchPhone, setDiscountSearchPhone] = useState<string>('');
  const [discountInputCode, setDiscountInputCode] = useState<string>('');
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountSuccess, setDiscountSuccess] = useState<string | null>(null);
  const [discountTab, setDiscountTab] = useState<'phone' | 'code'>('phone');

  // Offer Spin Modal State (Req 29 & 30)
  const [showCaptainSpinModal, setShowCaptainSpinModal] = useState<boolean>(false);
  const [captainSpinWinnerName, setCaptainSpinWinnerName] = useState<string>('');
  const [captainSpinWinnerPhone, setCaptainSpinWinnerPhone] = useState<string>('');
  const [captainSpinSelectedRewardId, setCaptainSpinSelectedRewardId] = useState<string>('');

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanStreamRef = useRef<MediaStream | null>(null);
  const scanAnimFrameRef = useRef<number | null>(null);
  const [scannerTab, setScannerTab] = useState<'code' | 'phone'>('code');
  const [phoneSearchQuery, setPhoneSearchQuery] = useState<string>('');

  const stopCameraScan = () => {
    if (scanAnimFrameRef.current) {
      cancelAnimationFrame(scanAnimFrameRef.current);
      scanAnimFrameRef.current = null;
    }
    if (scanStreamRef.current) {
      scanStreamRef.current.getTracks().forEach((track) => track.stop());
      scanStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraScan = async () => {
    setCameraError(null);
    setScanResult(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError('Camera access not supported on this device/browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      scanStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      requestScanFrame();
    } catch (err: any) {
      setCameraError(err?.message || 'Failed to access camera. Please check permissions.');
      setIsCameraActive(false);
    }
  };

  const requestScanFrame = () => {
    scanAnimFrameRef.current = requestAnimationFrame(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        if (scanStreamRef.current) {
          requestScanFrame();
        }
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        stopCameraScan();
        const payload = code.data.trim();
        const match = payload.match(/([A-Za-z0-9]+-[A-Za-z0-9]+)/);
        const codeToValidate = match ? match[1] : payload;
        setScannedCodeInput(codeToValidate);
        handleValidateCoupon(codeToValidate);
      } else {
        requestScanFrame();
      }
    });
  };

  useEffect(() => {
    if (!showScannerModal) {
      stopCameraScan();
      setScanResult(null);
    }
    return () => {
      stopCameraScan();
    };
  }, [showScannerModal]);

  const handleValidateCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = unifiedCoupons.find(
      (c) => c.voucherCode.toUpperCase() === clean && c.restaurantId === activeRestaurant.id
    );

    if (!found) {
      setScanResult('INVALID_COUPON: Code not found or belongs to another restaurant.');
      return;
    }
    if (found.status === 'redeemed') {
      setScanResult('ALREADY_REDEEMED: This coupon has already been redeemed.');
      return;
    }
    if (found.slot === 'queued') {
      setScanResult('NEXT_VISIT_REWARD: This coupon is queued for the diner\'s next visit and cannot be redeemed today.');
      return;
    }
    if (found.expiresAt && !isNaN(Date.parse(found.expiresAt)) && new Date(found.expiresAt).getTime() < Date.now()) {
      setScanResult('EXPIRED_COUPON: This coupon has expired (exceeded 20-day validity).');
      return;
    }
    redeemCoupon(found.id);
    setScanResult(`SUCCESS: Verified & Redeemed! ${found.rewardLabel} (${found.voucherCode})`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Persistent Offline Warning Banner (Section 9) */}
      {isOfflineSimulated && (
        <div className="bg-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold shadow-lg sticky top-0 z-50 animate-pulse">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Live updates paused. Please check Wi-Fi connectivity.</span>
          </div>
          <button
            onClick={() => setIsOfflineSimulated(false)}
            className="bg-white text-rose-700 px-2 py-0.5 rounded text-[11px] font-bold"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Top Captain Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              👨‍🍳
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base text-white">Captain Operations Console</h1>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                  Section 9: Floor Duty
                </span>
              </div>
              <p className="text-xs text-slate-400">{activeRestaurant.name} • Floor Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Captain Profile Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">{user?.name || 'Captain'}</span>
            </div>

            {/* Coupon Scanner CTA */}
            <button
              onClick={() => {
                setShowScannerModal(true);
                setScanResult(null);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Validate Voucher</span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={() => setIsOfflineSimulated(!isOfflineSimulated)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isOfflineSimulated
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-emerald-400'
              }`}
              title="Toggle network connectivity simulation"
            >
              {isOfflineSimulated ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            </button>

            {/* Captain Sign Out */}
            <button
              onClick={() => logout('/captain/login')}
              className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
              title="Sign Out of Captain Terminal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Call Captain Alert Section (Section 10: Pulsing chime alert) */}
      {pendingCalls.length > 0 && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold text-amber-300">
                {pendingCalls.length} Guest Assistance Request{pendingCalls.length > 1 ? 's' : ''}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pendingCalls.map((call) => (
                  <span
                    key={call.id}
                    className="bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded text-[11px] font-bold"
                  >
                    Table #{call.tableNumber}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {pendingCalls.map((call) => (
                <button
                  key={call.id}
                  onClick={() => acknowledgeCaptainCall(call.id)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded text-xs font-bold shadow transition-all flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attend Table {call.tableNumber}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Floor Grid & Table Management */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Table Grid (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Status Filters */}
          <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1">
              {(['all', 'occupied', 'bill_requested', 'paid_pending_reset'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    filterStatus === status
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 px-2">Total: {activeTables.length} Tables</span>
          </div>

          {/* Tables Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredTables.map((t) => {
              const isSelected = selectedTableNumber === t.tableNumber;
              const hasCall = pendingCalls.some((c) => c.tableNumber === t.tableNumber);
              const session = currentSessions.find(
                (s) => s.tableNumber === t.tableNumber && s.status !== 'closed' && s.status !== 'discarded'
              );

              return (
                <button
                  key={t.tableNumber}
                  onClick={() => setSelectedTableNumber(t.tableNumber)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-28 relative transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                      : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                  } ${hasCall ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                >
                  {/* Top: Table Number & Call Bell */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">T-{t.tableNumber}</span>
                    {hasCall && <Bell className="w-4 h-4 text-amber-400 animate-bounce" />}
                  </div>

                  {/* Middle: Session Host or Status */}
                  <div className="min-w-0">
                    {session ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-200 truncate">{session.hostName}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {session.members.length} Guest{session.members.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">No active session</p>
                    )}
                  </div>

                  {/* Bottom: Status Pill & Spin Winner */}
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        t.status === 'occupied' || (session && t.status !== 'bill_requested' && t.status !== 'paid_pending_reset')
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : t.status === 'bill_requested'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                          : t.status === 'paid_pending_reset'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status === 'available' && session ? 'occupied' : t.status.replace(/_/g, ' ')}
                    </span>
                    {session?.spinStatus === 'completed' && session?.spinReward && (
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-1 py-0.5 rounded truncate flex items-center gap-0.5" title={`Spin Winner: ${session.spinReward.label}`}>
                        <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span className="truncate">{session.spinReward.label}</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Table Details & Active Orders (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
          {selectedTableNumber ? (
            <>
              {/* Header with Table Number & Session Info */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">Table {selectedTableNumber}</h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        selectedTableRecord?.status === 'occupied' || (selectedSession && selectedTableRecord?.status !== 'bill_requested' && selectedTableRecord?.status !== 'paid_pending_reset')
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : selectedTableRecord?.status === 'bill_requested'
                          ? 'bg-rose-500/20 text-rose-400'
                          : selectedTableRecord?.status === 'paid_pending_reset'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {selectedTableRecord?.status === 'available' && selectedSession ? 'occupied' : (selectedTableRecord?.status || 'available').replace(/_/g, ' ')}
                    </span>
                  </div>
                  {selectedSession ? (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-slate-300">
                          Host: <span className="font-semibold text-white">{selectedSession.hostName}</span> (
                          {selectedSession.hostPhone})
                        </p>
                        <button
                          onClick={() => {
                            setReassignName(selectedSession.hostName);
                            setReassignPhone(selectedSession.hostPhone);
                            setShowReassignModal(true);
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium"
                        >
                          Reassign Host
                        </button>
                      </div>
                      {selectedSession.spinStatus === 'completed' && selectedSession.spinReward ? (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-xs font-semibold text-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Spin Reward: <strong className="text-white">{selectedSession.spinReward.label}</strong></span>
                            {selectedSession.spinWinnerName && (
                              <span className="text-[10px] text-amber-300/80">({selectedSession.spinWinnerName})</span>
                            )}
                          </div>
                          {!selectedSession.appliedDiscount && (
                            <button
                              onClick={() => {
                                const foundCoup = unifiedCoupons.find(
                                  (c) =>
                                    c.restaurantId === activeRestaurant.id &&
                                    (c.voucherCode === selectedSession.spinReward?.code ||
                                      (selectedSession.spinWinnerPhone && c.customerPhone === selectedSession.spinWinnerPhone))
                                );
                                if (foundCoup) {
                                  applyDiscountToTable(selectedTableNumber, foundCoup.id);
                                } else {
                                  applyDiscountToTable(selectedTableNumber, selectedSession.spinReward?.code || '');
                                }
                              }}
                              className="px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] shadow transition active:scale-95 cursor-pointer"
                            >
                              Apply to Bill &rarr;
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 pt-0.5">
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-800/80 border border-slate-700/60 rounded text-[10px] text-slate-400">
                            <Sparkles className="w-3 h-3 text-amber-400/60 shrink-0" />
                            <span>Spin &amp; Win: Available</span>
                          </div>
                          <button
                            onClick={() => {
                              setCaptainSpinWinnerName(selectedSession.hostName);
                              setCaptainSpinWinnerPhone(selectedSession.hostPhone);
                              setShowCaptainSpinModal(true);
                            }}
                            className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] transition active:scale-95 cursor-pointer"
                          >
                            Offer Spin &amp; Win
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">No active diner session</p>
                  )}
                </div>

                {/* Action Buttons: Walk-in Assignment & POS Menu */}
                <div className="flex items-center space-x-2 shrink-0">
                  {!selectedSession && (
                    <button
                      onClick={() => {
                        setWalkinName('');
                        setWalkinPhone('');
                        setWalkinGuests(2);
                        setShowWalkinModal(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors"
                      title="Assign an offline/walk-in diner directly to this table"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Assign Walk-in</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setStagedItems({});
                      setMenuSearch('');
                      setMenuSelectedCat('All');
                      setMenuVegOnly(false);
                      setShowAddDishModal(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>POS Menu</span>
                  </button>
                </div>
              </div>

              {/* Multi-Person Joiners List (Section 5) */}
              {selectedSession && selectedSession.members.length > 1 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1.5">
                    Table Diners ({selectedSession.members.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSession.members.map((m) => (
                      <span
                        key={m.id}
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          m.isHost
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {m.name} {m.isHost ? '👑 (Host)' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Orders List with Prep Countdown Timers (Section 7, 9) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px]">
                {tableOrders.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No orders placed yet for this table.
                  </div>
                ) : (
                  tableOrders.map((order) => {
                    // Prep Countdown logic
                    let isOverdue = false;
                    let remainingSeconds = 0;
                    if (order.prepExpiresAt) {
                      const diff = Math.floor((new Date(order.prepExpiresAt).getTime() - currentTime) / 1000);
                      if (diff <= 0) {
                        isOverdue = true;
                      } else {
                        remainingSeconds = diff;
                      }
                    }

                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 rounded-xl border ${
                          isOverdue
                            ? 'bg-rose-950/20 border-rose-500/40'
                            : 'bg-slate-950/70 border-slate-800'
                        }`}
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-white">Order #{order.id.slice(-4)}</span>
                            {/* Visual distinction: Captain Added vs Customer Order (Section 9) */}
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                order.source === 'captain'
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {order.source === 'captain' ? 'Captain Added' : 'Customer Order'}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              order.status === 'received'
                                ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                                : order.status === 'preparing'
                                ? isOverdue
                                  ? 'bg-rose-500 text-white font-bold animate-bounce'
                                  : 'bg-blue-500/20 text-blue-300'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Prep Countdown Display (Section 9) */}
                        {order.status === 'preparing' && (
                          <div
                            className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg mb-2 ${
                              isOverdue
                                ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40 font-bold'
                                : 'bg-slate-900 text-slate-300 border border-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5">
                              <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-400 animate-spin' : 'text-blue-400'}`} />
                              <span>
                                {isOverdue
                                  ? '⚠️ OVERDUE: Customer notified of heavy kitchen load'
                                  : `Kitchen Timer: ${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s remaining`}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0"
                            >
                              <div className="flex items-center space-x-2 flex-wrap gap-1">
                                <span className="font-semibold text-slate-200">
                                  {item.quantity}x {item.name}
                                </span>
                                {item.source === 'captain' && (
                                  <span className="text-[9px] text-purple-400 font-bold bg-purple-950 px-1 rounded">
                                    Captain
                                  </span>
                                )}
                                {item.status === 'delivered' || order.status === 'delivered' ? (
                                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/50 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>Served</span>
                                  </span>
                                ) : order.status === 'preparing' ? (
                                  <button
                                    onClick={() => deliverOrderItem(order.id, item.id)}
                                    className="text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded shadow flex items-center space-x-0.5 transition active:scale-95"
                                    title="Mark dish delivered to table"
                                  >
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>Deliver Dish</span>
                                  </button>
                                ) : null}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-400">₹{item.price * item.quantity}</span>
                                {/* Out of stock mid-order removal (Section 9) */}
                                <button
                                  onClick={() => removeOrderItem(order.id, item.id)}
                                  className="text-slate-500 hover:text-rose-400 transition-colors p-0.5"
                                  title="Remove item (out of stock)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Confirmation Actions (Waiter Cross-Confirmation, Section 9) */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
                          {order.status === 'received' ? (
                            <div className="flex items-center space-x-2 w-full">
                              <select
                                value={selectedPrepMinutes[order.id] || 20}
                                onChange={(e) =>
                                  setSelectedPrepMinutes({
                                    ...selectedPrepMinutes,
                                    [order.id]: Number(e.target.value) as 10 | 20 | 30,
                                  })
                                }
                                className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded px-2 py-1"
                              >
                                <option value={10}>10 Min Prep</option>
                                <option value={20}>20 Min Prep</option>
                                <option value={30}>30 Min Prep</option>
                              </select>
                              <button
                                onClick={() =>
                                  confirmOrder(order.id, selectedPrepMinutes[order.id] || 20)
                                }
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1 px-3 rounded shadow transition-colors flex items-center justify-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Cross-Confirm & Start Kitchen</span>
                              </button>
                            </div>
                          ) : order.status === 'preparing' ? (
                            <button
                              onClick={() => deliverOrder(order.id)}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded shadow transition-colors flex items-center justify-center space-x-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Entire Order Delivered</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Running Tab Summary (Section 7: GST, Service Charge, Packaging) */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST ({gstRate}%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Service Charge ({serviceRate}%)</span>
                  <span>₹{serviceAmount}</span>
                </div>
                {packaging > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Packaging Fee</span>
                    <span>₹{packaging}</span>
                  </div>
                )}
                {selectedSession?.appliedDiscount && (
                  <div className="flex justify-between text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                    <span>Discount ({selectedSession.appliedDiscount.label})</span>
                    <span>-₹{selectedSession.appliedDiscount.amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-1.5">
                  <span>Current Total</span>
                  <span className="text-amber-400">₹{totalBill}</span>
                </div>

                {/* Apply Offer / Add Discount Action (Req 43-48) */}
                <div className="pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => {
                      setDiscountModalOpen(true);
                      setDiscountSearchPhone(selectedSession?.hostPhone || '');
                      setDiscountInputCode('');
                      setDiscountError(null);
                      setDiscountSuccess(null);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{selectedSession?.appliedDiscount ? 'Change / Re-apply Discount' : 'Apply Offer / Add Discount'}</span>
                  </button>
                </div>
              </div>

              {/* Notification Banner */}
              {clearNotification && (
                <div className="bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{clearNotification}</span>
                </div>
              )}

              {/* Payment & Table Reset Actions (Section 8 & 22) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {selectedTableRecord?.status === 'bill_requested' || selectedTableRecord?.status === 'occupied' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Settle Bill & Complete Dining:</span>
                      <span className="text-amber-400 font-bold">₹{totalBill}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => closeTableTab(selectedTableNumber, 'cash')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition active:scale-95"
                      >
                        <Banknote className="w-4 h-4" />
                        <span>Dining Complete (Cash)</span>
                      </button>
                      <button
                        onClick={() => closeTableTab(selectedTableNumber, 'online')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition active:scale-95"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Dining Complete (Online)</span>
                      </button>
                    </div>
                  </div>
                ) : selectedTableRecord?.status === 'paid_pending_reset' ? (
                  <div className="space-y-2">
                    <div className="bg-purple-950/40 border border-purple-800/50 p-3 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                        Dining Complete ✓
                      </span>
                      <p className="text-xs text-slate-300">
                        Bill paid & dining finished. Clean and sanitize table for the next party.
                      </p>
                    </div>
                    <button
                      onClick={() => resetTable(selectedTableNumber)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Table (Ready for Next Guests)</span>
                    </button>
                  </div>
                ) : null}

                {/* Section 22: CLEAR TABLE Action Button */}
                <button
                  onClick={() => setShowClearConfirmModal(true)}
                  className="w-full bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Clear Table (Hard Reset & Archive)</span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Select a table from the floor grid to view live orders and tab details.
            </div>
          )}
        </div>
      </div>

      {/* POS Visual Menu Modal (Section 9: Full Visual Menu Picker with Fast Search & Counters) */}
      {showAddDishModal && selectedTableNumber && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">POS Menu Picker</h3>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Table #{selectedTableNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Search & stage multiple dishes directly to table tab.
                </p>
              </div>
              <button
                onClick={() => setShowAddDishModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/40 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Search dish by name..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {menuSearch && (
                    <button
                      onClick={() => setMenuSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setMenuVegOnly(!menuVegOnly)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition ${
                    menuVegOnly
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-2.5 h-2.5 border border-emerald-500 rounded-sm flex items-center justify-center p-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span>Veg Only</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
                {['All', ...Array.from(new Set(activeMenuItems.map((d) => (d.category || 'Mains').trim()).filter(Boolean)))].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMenuSelectedCat(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      menuSelectedCat === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dishes List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {(() => {
                const displayDishes = activeMenuItems.filter((dish) => {
                  const matchesCat = menuSelectedCat === 'All' || (dish.category || 'Mains').toLowerCase() === menuSelectedCat.toLowerCase();
                  const matchesSearch = !menuSearch || dish.name.toLowerCase().includes(menuSearch.toLowerCase());
                  const matchesVeg = !menuVegOnly || dish.isVeg;
                  return matchesCat && matchesSearch && matchesVeg;
                });

                if (displayDishes.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <Utensils className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs font-semibold">No dishes found matching your criteria</p>
                      <button
                        onClick={() => {
                          setMenuSelectedCat('All');
                          setMenuSearch('');
                          setMenuVegOnly(false);
                        }}
                        className="text-amber-400 text-xs underline font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  );
                }

                return displayDishes.map((dish) => {
                  const qty = stagedItems[dish.id] || 0;
                  return (
                    <div
                      key={dish.id}
                      className={`p-2.5 rounded-2xl border flex items-center justify-between transition ${
                        qty > 0
                          ? 'bg-amber-500/10 border-amber-500/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                        {/* Food Image / Fallback */}
                        {dish.imageUrl ? (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                            <Utensils className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            {dish.isVeg ? (
                              <div className="w-3 h-3 border border-emerald-500 rounded-xs flex items-center justify-center p-0.5 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              </div>
                            ) : (
                              <div className="w-3 h-3 border border-rose-500 rounded-xs flex items-center justify-center p-0.5 shrink-0">
                                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-rose-500" />
                              </div>
                            )}
                            <span className="font-bold text-xs text-white truncate block">
                              {dish.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">
                              {dish.category || 'Mains'}
                            </span>
                            <span className="font-mono font-bold text-amber-400 text-xs">
                              ₹{dish.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {qty > 0 ? (
                          <div className="flex items-center space-x-2 bg-slate-900 border border-amber-500/40 rounded-xl px-2 py-1">
                            <button
                              onClick={() =>
                                setStagedItems((prev) => {
                                  const current = prev[dish.id] || 0;
                                  if (current <= 1) {
                                    const copy = { ...prev };
                                    delete copy[dish.id];
                                    return copy;
                                  }
                                  return { ...prev, [dish.id]: current - 1 };
                                })
                              }
                              className="text-amber-400 hover:text-white p-0.5"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono font-bold text-xs text-white px-1">
                              {qty}
                            </span>
                            <button
                              onClick={() =>
                                setStagedItems((prev) => ({
                                  ...prev,
                                  [dish.id]: (prev[dish.id] || 0) + 1,
                                }))
                              }
                              className="text-amber-400 hover:text-white p-0.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setStagedItems((prev) => ({
                                ...prev,
                                [dish.id]: 1,
                              }))
                            }
                            className="bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bottom Bar */}
            {(() => {
              const stagedEntries = Object.entries(stagedItems);
              const totalItemsStaged = stagedEntries.reduce((sum, [, count]) => sum + count, 0);
              const totalStagedPrice = stagedEntries.reduce((sum, [dishId, count]) => {
                const d = activeMenuItems.find((m) => m.id === dishId);
                return sum + (d ? d.price * count : 0);
              }, 0);

              return (
                <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
                  <div className="text-left">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      {totalItemsStaged} dish{totalItemsStaged === 1 ? '' : 'es'} staged
                    </span>
                    <span className="font-mono font-bold text-white text-base">
                      ₹{totalStagedPrice}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {totalItemsStaged > 0 && (
                      <button
                        onClick={() => setStagedItems({})}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900 transition"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      disabled={totalItemsStaged === 0}
                      onClick={() => {
                        const itemsToAdd = Object.entries(stagedItems).map(([dishId, quantity]) => {
                          const dish = activeMenuItems.find((d) => d.id === dishId)!;
                          return {
                            menuItemId: dish.id,
                            name: dish.name,
                            price: dish.price,
                            quantity,
                          };
                        });
                        captainAddOrder(selectedTableNumber, itemsToAdd);
                        setStagedItems({});
                        setShowAddDishModal(false);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow ${
                        totalItemsStaged === 0
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Send to Kitchen (₹{totalStagedPrice})</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Offline / Walk-in Table Assignment Modal */}
      {showWalkinModal && selectedTableNumber && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Manual Table Assignment</h3>
                  <span className="text-[10px] font-bold text-amber-400">
                    Table #{selectedTableNumber} (Offline / Walk-in)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Use this when guests dine in directly without scanning table QR standees. Opens an active live tab so you can take oral orders.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  Guest Name
                </label>
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder={`e.g. Walk-in Diner (T-${selectedTableNumber})`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  Phone Number (Optional for Loyalty)
                </label>
                <input
                  type="tel"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="e.g. +91 98200 55667"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">
                  Guest Party Size
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setWalkinGuests(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition border ${
                        walkinGuests === num
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowWalkinModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  assignManualTable(
                    selectedTableNumber,
                    walkinName.trim() || `Walk-in Guest (Table ${selectedTableNumber})`,
                    walkinPhone.trim(),
                    walkinGuests
                  );
                  setShowWalkinModal(false);
                  setStagedItems({});
                  setMenuSelectedCat('All');
                  setMenuSearch('');
                  setMenuVegOnly(false);
                  setShowAddDishModal(true);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow transition active:scale-95 flex items-center justify-center space-x-1"
              >
                <span>Assign & Open POS</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ghost Host Reassign Modal (Section 5) */}
      {showReassignModal && selectedTableNumber && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Reassign Host (Table {selectedTableNumber})</h3>
              <button onClick={() => setShowReassignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              If original scanner left early or was a ghost scan, verify the diner is physically present at the table and enter their credentials.
            </p>

            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">Present Diner Name</label>
              <input
                type="text"
                value={reassignName}
                onChange={(e) => setReassignName(e.target.value)}
                placeholder="e.g. Pooja Verma"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">Present Diner Phone Number</label>
              <input
                type="text"
                value={reassignPhone}
                onChange={(e) => setReassignPhone(e.target.value)}
                placeholder="e.g. +91 98200 44556"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowReassignModal(false)}
                className="flex-1 bg-slate-800 text-slate-300 text-xs py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (reassignName && reassignPhone) {
                    reassignSessionHost(selectedTableNumber, reassignName, reassignPhone);
                    setShowReassignModal(false);
                  }
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-lg"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer / Coupon QR Scanner Modal (Section 11) */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Voucher Redemption Console</h3>
              </div>
              <button
                onClick={() => {
                  stopCameraScan();
                  setShowScannerModal(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setScannerTab('code');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  scannerTab === 'code'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan / Code</span>
              </button>
              <button
                onClick={() => {
                  stopCameraScan();
                  setScannerTab('phone');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                  scannerTab === 'phone'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Search by Phone</span>
              </button>
            </div>

            {scannerTab === 'code' ? (
              <div className="space-y-3">
                {/* Camera QR Scanner Viewport */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center">
                  <canvas ref={canvasRef} className="hidden" />

                  {isCameraActive ? (
                    <div className="w-full relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      {/* Scanning Reticle Frame */}
                      <div className="absolute inset-0 border-2 border-amber-500/50 rounded-lg pointer-events-none flex items-center justify-center">
                        <div className="w-32 h-32 border-2 border-amber-400 border-dashed rounded-lg animate-pulse" />
                      </div>
                      <div className="absolute bottom-2 inset-x-2 text-center text-[10px] bg-black/70 text-amber-300 py-1 px-2 rounded backdrop-blur-sm font-semibold">
                        Point camera at diner's voucher QR code
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-400">
                        Scan customer QR code directly with your device camera
                      </p>
                    </div>
                  )}

                  {cameraError && (
                    <p className="text-[11px] text-rose-400 mt-2 text-center font-medium">
                      {cameraError}
                    </p>
                  )}

                  <button
                    onClick={isCameraActive ? stopCameraScan : startCameraScan}
                    className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-colors ${
                      isCameraActive
                        ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200'
                        : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white'
                    }`}
                  >
                    {isCameraActive ? (
                      <>
                        <CameraOff className="w-4 h-4" />
                        <span>Stop Camera Scanner</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 text-amber-400" />
                        <span>Open Camera QR Scanner</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Manual Code Entry */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">
                    Or Enter Voucher Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={scannedCodeInput}
                      onChange={(e) => setScannedCodeInput(e.target.value)}
                      placeholder="e.g. HRTG-8F42K or HRTG-REV15"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono"
                    />
                    <button
                      onClick={() => handleValidateCoupon(scannedCodeInput)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Quick Sample Codes */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">
                    Quick Testing Samples:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {unifiedCoupons.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setScannedCodeInput(c.voucherCode);
                          handleValidateCoupon(c.voucherCode);
                        }}
                        className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {c.voucherCode} ({c.rewardLabel.slice(0, 15)})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Search by Phone Tab */
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">
                    Diner Phone Number Search
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={phoneSearchQuery}
                      onChange={(e) => setPhoneSearchQuery(e.target.value)}
                      placeholder="Enter diner phone number e.g. 98765..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Coupons List by Phone */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {unifiedCoupons
                    .filter(
                      (c) =>
                        c.restaurantId === activeRestaurant.id &&
                        (!phoneSearchQuery.trim() ||
                          c.customerPhone.includes(phoneSearchQuery.trim()))
                    )
                    .slice(0, 8)
                    .map((c) => {
                      const isEligible = c.status === 'held' && c.slot !== 'queued';
                      return (
                        <div
                          key={c.id}
                          className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-xs font-bold text-amber-300">
                                {c.voucherCode}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                  c.status === 'redeemed'
                                    ? 'bg-slate-800 text-slate-400'
                                    : c.slot === 'queued'
                                    ? 'bg-blue-900/40 text-blue-300'
                                    : 'bg-emerald-900/40 text-emerald-300'
                                }`}
                              >
                                {c.status === 'redeemed'
                                  ? 'Redeemed'
                                  : c.slot === 'queued'
                                  ? 'Next Visit'
                                  : 'Active'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
                              {c.rewardLabel}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Phone: {c.customerPhone}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setScannedCodeInput(c.voucherCode);
                              handleValidateCoupon(c.voucherCode);
                            }}
                            disabled={!isEligible}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                              isEligible
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Redeem
                          </button>
                        </div>
                      );
                    })}

                  {unifiedCoupons.filter(
                    (c) =>
                      c.restaurantId === activeRestaurant.id &&
                      (!phoneSearchQuery.trim() ||
                        c.customerPhone.includes(phoneSearchQuery.trim()))
                  ).length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No matching coupons found for this phone number.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validation Feedback Banner */}
            {scanResult && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  scanResult.startsWith('SUCCESS')
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-500/40'
                }`}
              >
                {scanResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Table Confirmation Modal (Section 22) */}
      {showClearConfirmModal && selectedTableNumber && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">CLEAR TABLE #{selectedTableNumber}?</h3>
                <p className="text-xs text-rose-300 font-medium">Session Reset & Audit Logging</p>
              </div>
            </div>

            <div className="bg-rose-950/20 border border-rose-900/40 p-3.5 rounded-xl text-xs text-rose-200 leading-relaxed space-y-2">
              <p className="font-semibold text-white">
                Active session, orders, and open tab will be cleared.
              </p>
              <p className="text-slate-300">
                Physical table & table history will be preserved. This table will immediately become Available for the next diners.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const res = clearTable(
                    selectedTableNumber,
                    user?.id || 'cpt_staff',
                    user?.name || user?.email || 'Captain'
                  );
                  setShowClearConfirmModal(false);
                  setClearNotification(res.message);
                  setTimeout(() => setClearNotification(null), 4000);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Clear Table</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Offer & Discount to Table Modal (Req 43-48) */}
      {discountModalOpen && selectedTableNumber && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Apply Offer / Add Discount</h3>
                  <p className="text-xs text-amber-300">Table #{selectedTableNumber} • Active Bill Discount</p>
                </div>
              </div>
              <button
                onClick={() => setDiscountModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDiscountTab('phone')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  discountTab === 'phone'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Search Diner Phone
              </button>
              <button
                type="button"
                onClick={() => setDiscountTab('code')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  discountTab === 'code'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Enter Voucher Code
              </button>
            </div>

            {discountSuccess && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{discountSuccess}</span>
              </div>
            )}

            {discountError && (
              <div className="p-3 rounded-xl text-xs font-semibold bg-rose-950/50 text-rose-300 border border-rose-500/40 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{discountError}</span>
              </div>
            )}

            {discountTab === 'phone' ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Diner phone (e.g. 98200 11223)..."
                      value={discountSearchPhone}
                      onChange={(e) => setDiscountSearchPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 text-white text-xs border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  {selectedSession?.hostPhone && discountSearchPhone !== selectedSession.hostPhone && (
                    <button
                      type="button"
                      onClick={() => setDiscountSearchPhone(selectedSession.hostPhone)}
                      className="px-2.5 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
                    >
                      Use Host
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {unifiedCoupons
                    .filter(
                      (c) =>
                        c.restaurantId === activeRestaurant.id &&
                        c.status === 'held' &&
                        (!discountSearchPhone.trim() ||
                          c.customerPhone.replace(/\D/g, '').includes(discountSearchPhone.replace(/\D/g, '')))
                    )
                    .map((coupon) => (
                      <div
                        key={coupon.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                              {coupon.voucherCode}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {coupon.source.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white mt-1">{coupon.rewardLabel}</p>
                          <span className="text-[10px] text-slate-500">
                            Expires: {coupon.expiresAt?.slice(0, 10) || '20 Days'}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            const res = applyDiscountToTable(selectedTableNumber, coupon.id);
                            if (res.success) {
                              setDiscountSuccess(res.message);
                              setTimeout(() => {
                                setDiscountModalOpen(false);
                                setDiscountSuccess(null);
                              }, 1500);
                            } else {
                              setDiscountError(res.message);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition active:scale-95 shrink-0 cursor-pointer"
                        >
                          Apply to Bill
                        </button>
                      </div>
                    ))}

                  {unifiedCoupons.filter(
                    (c) =>
                      c.restaurantId === activeRestaurant.id &&
                      c.status === 'held' &&
                      (!discountSearchPhone.trim() ||
                        c.customerPhone.replace(/\D/g, '').includes(discountSearchPhone.replace(/\D/g, '')))
                  ).length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No active, held vouchers found for this phone number.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Voucher / Discount Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HRTG-REV48 or FEAST15"
                    value={discountInputCode}
                    onChange={(e) => setDiscountInputCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-950 font-mono text-white text-xs border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!discountInputCode.trim()) return;
                    const res = applyDiscountToTable(selectedTableNumber, discountInputCode.trim());
                    if (res.success) {
                      setDiscountSuccess(res.message);
                      setTimeout(() => {
                        setDiscountModalOpen(false);
                        setDiscountSuccess(null);
                      }, 1500);
                    } else {
                      setDiscountError(res.message);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition active:scale-95 cursor-pointer"
                >
                  Verify &amp; Apply Discount to Table #{selectedTableNumber}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offer Spin & Win to Table Modal (Req 29 & 30) */}
      {showCaptainSpinModal && selectedTableNumber && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Offer Spin &amp; Win to Table</h3>
                  <p className="text-xs text-amber-300">Table #{selectedTableNumber} • Gamified Dining Reward</p>
                </div>
              </div>
              <button
                onClick={() => setShowCaptainSpinModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Winner / Guest Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={captainSpinWinnerName}
                  onChange={(e) => setCaptainSpinWinnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Winner Phone Number (for Voucher Delivery)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98200 11223"
                  value={captainSpinWinnerPhone}
                  onChange={(e) => setCaptainSpinWinnerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Select Reward or Random Wheel Spin
                </label>
                <select
                  value={captainSpinSelectedRewardId}
                  onChange={(e) => setCaptainSpinSelectedRewardId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">🎲 Random Wheel Probability Spin</option>
                  {activeRewardItems
                    .filter((r) => r.active && r.discountType !== 'no_luck')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} ({item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `₹${item.discountValue} OFF`})
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  let chosenReward = activeRewardItems.find((r) => r.id === captainSpinSelectedRewardId);
                  if (!chosenReward) {
                    // Weighted random spin
                    const activeSlices = activeRewardItems.filter((r) => r.active);
                    const rand = Math.random() * 100;
                    let accum = 0;
                    for (const sl of activeSlices) {
                      accum += sl.probability || 0;
                      if (rand <= accum) {
                        chosenReward = sl;
                        break;
                      }
                    }
                    if (!chosenReward) chosenReward = activeSlices[0];
                  }

                  const name = captainSpinWinnerName.trim() || selectedSession?.hostName || `Guest (Table ${selectedTableNumber})`;
                  const phone = captainSpinWinnerPhone.trim() || selectedSession?.hostPhone || 'Staff Spin';
                  const code = `${activeRestaurant.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()}-SPIN${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                  const rewardPayload = {
                    label: chosenReward.label,
                    code,
                    discountType: chosenReward.discountType,
                    discountValue: chosenReward.discountValue,
                  };

                  recordTableSpinWon(selectedTableNumber, name, phone, rewardPayload);
                  setShowCaptainSpinModal(false);
                  setClearNotification(`Spin & Win completed for Table ${selectedTableNumber}! Won: ${chosenReward.label}`);
                  setTimeout(() => setClearNotification(null), 4000);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm &amp; Award Spin to Table</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
