import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Receipt,
  Bell,
  Clock,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  X,
  CreditCard,
  Users,
  AlertCircle,
  Plus,
  Sparkles,
} from 'lucide-react';

interface OpenTabDrawerProps {
  onOpenMenuToAdd: () => void;
}

export const OpenTabDrawer: React.FC<OpenTabDrawerProps> = ({ onOpenMenuToAdd }) => {
  const {
    activeRestaurant,
    activeTable,
    orders,
    currentTableSession,
    customerSession,
    callCaptain,
    callCooldownRemaining,
    captainCalls,
    askForBill,
    activeTables,
  } = useTenant();

  const [isOpen, setIsOpen] = useState(false);
  const [callStatusMessage, setCallStatusMessage] = useState<string | null>(null);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  // Selected table record and active table orders
  const currentTableRecord = activeTables.find((t) => t.tableNumber === activeTable);
  const tableOrders = orders.filter((o) => o.tableNumber === activeTable && o.status !== 'cancelled');

  // Pending call check for this table
  const hasPendingCall = captainCalls.some(
    (c) => c.tableNumber === activeTable && c.status === 'pending'
  );

  // Prep Countdown calculation
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const preparingOrder = tableOrders.find((o) => o.status === 'preparing');
  let isOverdue = false;
  let remainingSeconds = 0;
  if (preparingOrder && preparingOrder.prepExpiresAt) {
    const diff = Math.floor((new Date(preparingOrder.prepExpiresAt).getTime() - currentTime) / 1000);
    if (diff <= 0) {
      isOverdue = true;
    } else {
      remainingSeconds = diff;
    }
  }

  // Running Charges Calculation
  const subtotal = tableOrders.reduce((sum, order) => {
    return sum + order.items.reduce((iSum, item) => iSum + item.price * item.quantity, 0);
  }, 0);

  const gstRate = activeRestaurant.chargesConfig?.gstPercent || 5;
  const serviceRate = activeRestaurant.chargesConfig?.serviceChargePercent || 5;
  const packaging = activeRestaurant.chargesConfig?.packagingFee || 30;

  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const serviceAmount = Math.round((subtotal * serviceRate) / 100);
  const totalAmount = subtotal > 0 ? subtotal + gstAmount + serviceAmount + packaging : 0;

  // Phase Determination
  let phaseText = 'No Orders Yet';
  let phasePillClass = 'bg-slate-100 text-slate-700';

  if (currentTableRecord?.status === 'bill_requested') {
    phaseText = 'Asked for Bill';
    phasePillClass = 'bg-rose-100 text-rose-800 border border-rose-200';
  } else if (currentTableRecord?.status === 'paid_pending_reset') {
    phaseText = 'Tab Closed (Pending Reset)';
    phasePillClass = 'bg-purple-100 text-purple-800 border border-purple-200';
  } else if (tableOrders.some((o) => o.status === 'received')) {
    phaseText = 'Order Received • Awaiting Captain Confirmation';
    phasePillClass = 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse';
  } else if (preparingOrder) {
    phaseText = isOverdue
      ? 'Due to heavy orders, it’s taking a bit longer'
      : `Kitchen Preparing (${Math.floor(remainingSeconds / 60)}m remaining)`;
    phasePillClass = isOverdue
      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
      : 'bg-blue-100 text-blue-800 border border-blue-200';
  } else if (tableOrders.some((o) => o.status === 'delivered')) {
    phaseText = 'Delivered to Table';
    phasePillClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  }

  const handleCallCaptainClick = () => {
    const res = callCaptain(activeTable);
    setCallStatusMessage(res.message);
    setTimeout(() => {
      if (!hasPendingCall) setCallStatusMessage(null);
    }, 4000);
  };

  if (tableOrders.length === 0 && !currentTableSession) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Tab Pill (Always visible above bottom nav) */}
      <div className="fixed bottom-16 inset-x-0 z-30 px-3 max-w-md mx-auto pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/95 text-white rounded-2xl p-3 shadow-2xl border border-slate-800 backdrop-blur-md flex items-center justify-between gap-3">
          {/* Left Info: Table & Total */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2.5 text-left flex-1 min-w-0"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}
            >
              <Receipt className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xs">Table {activeTable} Live Tab</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">₹{totalAmount}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{phaseText}</p>
            </div>
          </button>

          {/* Right Action: Call Captain & Expand */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleCallCaptainClick}
              disabled={callCooldownRemaining > 0}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center space-x-1 transition-all ${
                callCooldownRemaining > 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : hasPendingCall
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{callCooldownRemaining > 0 ? `${callCooldownRemaining}s` : 'Call Captain'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Unacknowledged Call Captain Banner (Section 10) */}
        {hasPendingCall && (
          <div className="mt-1 bg-amber-950/90 text-amber-200 border border-amber-500/40 px-3 py-1.5 rounded-xl text-[10px] font-medium flex items-center justify-between pointer-events-auto animate-pulse">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-amber-400 animate-spin" />
              <span>All captains are busy, someone will attend you shortly.</span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Live Tab Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm">Table {activeTable} • Live Open Tab</h3>
                  <p className="text-[10px] text-amber-200/90">
                    Host: {currentTableSession?.hostName || customerSession?.name || 'Guest'}
                    {currentTableSession?.members && ` (${currentTableSession.members.length} Diners)`}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Phase Indicator */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Phase Progression:
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${phasePillClass}`}>
                {phaseText}
              </span>
            </div>

            {/* Overdue Kitchen Notification (Section 9) */}
            {isOverdue && (
              <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 flex items-center space-x-2 font-medium">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Due to heavy orders, it’s taking a bit longer. Our chef is handcrafting your meal.</span>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {tableOrders.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No items ordered yet. Browse our menu to start your dining tab!
                </div>
              ) : (
                tableOrders.map((order) => (
                  <div key={order.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>Order #{order.id.slice(-4)}</span>
                      <span className="capitalize px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-xs text-slate-800">
                          <span className="font-medium">
                            {it.quantity}x {it.name}
                            {it.source === 'captain' && (
                              <span className="ml-1 text-[9px] text-purple-700 font-bold bg-purple-100 px-1 rounded">
                                Captain Added
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-slate-900 font-semibold">
                            ₹{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* Quick Additions Button (Section 7: "You may also like" / additions) */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenMenuToAdd();
                }}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-50/50 hover:bg-amber-50 text-amber-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Dishes to this Tab</span>
              </button>
            </div>

            {/* Running Charges Breakdown (Section 7) */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({gstRate}%)</span>
                <span>₹{gstAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge ({serviceRate}%)</span>
                <span>₹{serviceAmount}</span>
              </div>
              {packaging > 0 && (
                <div className="flex justify-between">
                  <span>Packaging Fee</span>
                  <span>₹{packaging}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2 mt-1">
                <span>Running Total (Billed to Host)</span>
                <span className="text-emerald-700 font-mono">₹{totalAmount}</span>
              </div>
            </div>

            {/* Bottom Actions: Call Captain & Ask For Bill (Section 7, 8) */}
            <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-2">
              <button
                onClick={handleCallCaptainClick}
                disabled={callCooldownRemaining > 0}
                className="w-full py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center space-x-1 transition-colors"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span>{callCooldownRemaining > 0 ? `Wait ${callCooldownRemaining}s` : 'Call Captain'}</span>
              </button>

              <button
                onClick={() => {
                  askForBill(activeTable);
                  setIsOpen(false);
                }}
                disabled={currentTableRecord?.status === 'bill_requested' || subtotal === 0}
                className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center space-x-1 transition-transform active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {currentTableRecord?.status === 'bill_requested' ? 'Bill Requested ✓' : 'Ask for Bill'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
