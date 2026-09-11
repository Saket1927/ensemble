import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { MenuItem } from '../../types/tenant';
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
  UtensilsCrossed,
  Check,
  Building,
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
    activeMenuItems,
    placeCustomerOrder,
    billConfigsMap,
  } = useTenant();

  const [isOpen, setIsOpen] = useState(false);
  const [callStatusMessage, setCallStatusMessage] = useState<string | null>(null);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const primaryColor = activeRestaurant.branding.primaryColor || '#162c21';
  const secondaryColor = activeRestaurant.branding.secondaryColor || '#c5a96d';

  // Selected table record and active table orders
  const currentTableRecord = activeTables.find((t) => t.tableNumber === activeTable);
  const tableOrders = orders.filter((o) => o.tableNumber === activeTable && o.status !== 'cancelled');

  const isBillRequested =
    currentTableRecord?.status === 'bill_requested' ||
    currentTableRecord?.status === 'paid_pending_reset';

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

  // Running Charges Calculation for Bill phase
  const subtotal = tableOrders.reduce((sum, order) => {
    return sum + order.items.reduce((iSum, item) => iSum + item.price * item.quantity, 0);
  }, 0);

  const billConfig = billConfigsMap[activeRestaurant.id];
  const gstRate = billConfig
    ? billConfig.charges.find((c) => c.id === 'ch_gst' && c.active)?.value || 5
    : activeRestaurant.chargesConfig?.gstPercent || 5;

  const serviceRate = billConfig
    ? billConfig.charges.find((c) => c.id === 'ch_sc' && c.active)?.value || 5
    : activeRestaurant.chargesConfig?.serviceChargePercent || 5;

  const packaging = billConfig
    ? billConfig.charges.find((c) => c.id === 'ch_pkg' && c.active)?.value || 30
    : activeRestaurant.chargesConfig?.packagingFee || 30;

  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const serviceAmount = Math.round((subtotal * serviceRate) / 100);
  const totalAmount = subtotal > 0 ? subtotal + gstAmount + serviceAmount + packaging : 0;

  // Total items count across all orders
  const totalItemsCount = tableOrders.reduce((sum, ord) => {
    return sum + ord.items.reduce((iSum, it) => iSum + it.quantity, 0);
  }, 0);

  // Phase Determination
  let phaseText = 'No Orders Yet';
  let phasePillClass = 'bg-slate-100 text-slate-700';

  if (currentTableRecord?.status === 'bill_requested') {
    phaseText = 'Bill Requested';
    phasePillClass = 'bg-rose-100 text-rose-800 border border-rose-200';
  } else if (currentTableRecord?.status === 'paid_pending_reset') {
    phaseText = 'Paid & Settled';
    phasePillClass = 'bg-purple-100 text-purple-800 border border-purple-200';
  } else if (tableOrders.some((o) => o.status === 'received')) {
    phaseText = 'Order Received • Awaiting Captain';
    phasePillClass = 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse';
  } else if (preparingOrder) {
    phaseText = isOverdue
      ? 'Chef Handcrafting Meal'
      : `Kitchen Preparing (${Math.floor(remainingSeconds / 60)}m left)`;
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

  // Group ordered items by Category (Section 24)
  interface EnrichedOrderedItem {
    id: string;
    orderId: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    source: 'customer' | 'captain';
    orderStatus: string;
    imageUrl?: string;
    category: string;
  }

  const allOrderedItems: EnrichedOrderedItem[] = [];
  tableOrders.forEach((order) => {
    order.items.forEach((item) => {
      const matchMenu = activeMenuItems.find(
        (m) => m.id === item.menuItemId || m.name.toLowerCase() === item.name.toLowerCase()
      );
      allOrderedItems.push({
        id: item.id,
        orderId: order.id,
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        source: item.source || order.source,
        orderStatus: order.status,
        imageUrl: matchMenu?.imageUrl,
        category: matchMenu?.category || 'Mains',
      });
    });
  });

  // Group by standard categories
  const categoryBuckets: Record<string, EnrichedOrderedItem[]> = {
    'Starters': [],
    'Main Course': [],
    'Breads': [],
    'Desserts': [],
    'Beverages': [],
    'Other Additions': [],
  };

  allOrderedItems.forEach((it) => {
    const catLow = it.category.toLowerCase();
    if (catLow.includes('start') || catLow.includes('appetiz') || catLow.includes('kebab') || catLow.includes('tikka')) {
      categoryBuckets['Starters'].push(it);
    } else if (catLow.includes('bread') || catLow.includes('roti') || catLow.includes('naan') || catLow.includes('paratha')) {
      categoryBuckets['Breads'].push(it);
    } else if (catLow.includes('dessert') || catLow.includes('sweet') || catLow.includes('kulfi') || catLow.includes('jamun') || catLow.includes('ice cream')) {
      categoryBuckets['Desserts'].push(it);
    } else if (catLow.includes('beverag') || catLow.includes('drink') || catLow.includes('cocktail') || catLow.includes('lassi') || catLow.includes('shake')) {
      categoryBuckets['Beverages'].push(it);
    } else if (catLow.includes('main') || catLow.includes('curry') || catLow.includes('biryani') || catLow.includes('gravy') || catLow.includes('dal')) {
      categoryBuckets['Main Course'].push(it);
    } else {
      categoryBuckets['Other Additions'].push(it);
    }
  });

  // Suggestions for "Complete Your Table" / "You May Also Like" (Breads & Desserts)
  const suggestionItems = activeMenuItems.filter((dish) => {
    if (!dish.isAvailable) return false;
    const cat = dish.category.toLowerCase();
    return (
      cat.includes('bread') ||
      cat.includes('roti') ||
      cat.includes('naan') ||
      cat.includes('dessert') ||
      cat.includes('sweet') ||
      dish.name.toLowerCase().includes('naan') ||
      dish.name.toLowerCase().includes('roti') ||
      dish.name.toLowerCase().includes('gulab')
    );
  }).slice(0, 4);

  const handleAddSuggestion = (dish: MenuItem) => {
    placeCustomerOrder(activeTable, [
      {
        menuItemId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
      },
    ]);
    setAddedItemNotice(`Added 1x ${dish.name} to Table ${activeTable}!`);
    setTimeout(() => setAddedItemNotice(null), 2500);
  };

  if (tableOrders.length === 0 && !currentTableSession) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Tab Pill (Always visible above bottom nav) */}
      <div className="fixed bottom-16 inset-x-0 z-30 px-3 max-w-md mx-auto pointer-events-none">
        <div className="pointer-events-auto bg-slate-950 text-white rounded-2xl p-3 shadow-2xl border border-slate-800/90 backdrop-blur-md flex items-center justify-between gap-3">
          {/* Left Info: Table & Status (NO PRICE BEFORE BILL!) */}
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
                {/* Price ONLY visible after bill requested/generated */}
                {isBillRequested ? (
                  <span className="text-[11px] text-amber-400 font-mono font-bold">₹{totalAmount}</span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    ({totalItemsCount} dish{totalItemsCount === 1 ? '' : 'es'})
                  </span>
                )}
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

        {/* Call Captain Notice */}
        {hasPendingCall && (
          <div className="mt-1 bg-amber-950/90 text-amber-200 border border-amber-500/40 px-3 py-1.5 rounded-xl text-[10px] font-medium flex items-center justify-between pointer-events-auto animate-pulse">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-amber-400 animate-spin" />
              <span>Captain notified. Floor staff will attend your table shortly.</span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Live Tab Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans animate-slide-up">
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center space-x-2.5">
                <Receipt className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm">
                    {isBillRequested ? `Table ${activeTable} • Final Dining Bill` : `Table ${activeTable} • Live Open Tab`}
                  </h3>
                  <p className="text-[10px] text-amber-200/90">
                    Host: {currentTableSession?.hostName || customerSession?.name || 'Guest'}
                    {currentTableSession?.members && ` • ${currentTableSession.members.length} Diners`}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Toast if item added */}
            {addedItemNotice && (
              <div className="p-2.5 bg-emerald-600 text-white text-xs font-semibold text-center flex items-center justify-center space-x-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{addedItemNotice}</span>
              </div>
            )}

            {/* Phase Progression */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Current State:
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${phasePillClass}`}>
                {phaseText}
              </span>
            </div>

            {/* Overdue Kitchen Notice */}
            {isOverdue && !isBillRequested && (
              <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 flex items-center space-x-2 font-medium">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Our chef is handcrafting your order with care. Thank you for your patience!</span>
              </div>
            )}

            {/* Body View: CONDITIONAL BETWEEN (1) OPEN TAB WITHOUT PRICES vs (2) BILL BREAKDOWN */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!isBillRequested ? (
                /* ============================================================
                   CASE 1: OPEN TAB BEFORE BILL (NO PRICES, IMAGES, CATEGORIZED)
                   ============================================================ */
                <div className="space-y-4">
                  <div className="text-[11px] text-slate-500">
                    Dishes placed for your table session. Add fresh accompaniments or request the final bill when ready.
                  </div>

                  {/* Categorized Ordered Items */}
                  {Object.entries(categoryBuckets).map(([catName, items]) => {
                    if (items.length === 0) return null;

                    return (
                      <div key={catName} className="space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1">
                          {catName} ({items.length})
                        </div>

                        <div className="space-y-2">
                          {items.map((it) => (
                            <div
                              key={it.id}
                              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200"
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                {/* Food Image with Neutral Fallback (Section 23) */}
                                {it.imageUrl ? (
                                  <img
                                    src={it.imageUrl}
                                    alt={it.name}
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                                    <UtensilsCrossed className="w-5 h-5" />
                                  </div>
                                )}

                                <div className="truncate">
                                  <div className="font-bold text-xs text-slate-900 truncate">
                                    {it.name}
                                  </div>
                                  <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                      Qty × {it.quantity}
                                    </span>
                                    {it.source === 'captain' && (
                                      <span className="text-[9px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                        Captain Added
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge (NO PRICES DISPLAYED!) */}
                              <div className="shrink-0 ml-2">
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold capitalize bg-white text-slate-700 border border-slate-300">
                                  {it.orderStatus}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Section 25: COMPLETE YOUR TABLE / YOU MAY ALSO LIKE */}
                  {suggestionItems.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Complete Your Table • You May Also Like</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Instant Additions</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {suggestionItems.map((dish) => (
                          <div
                            key={dish.id}
                            className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-2.5 flex flex-col justify-between"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              {dish.imageUrl ? (
                                <img
                                  src={dish.imageUrl}
                                  alt={dish.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-amber-200 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                                  <UtensilsCrossed className="w-4 h-4" />
                                </div>
                              )}
                              <div className="truncate">
                                <div className="font-bold text-[11px] text-slate-900 truncate">
                                  {dish.name}
                                </div>
                                <div className="text-[10px] text-amber-800 font-mono font-bold">
                                  ₹{dish.price}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddSuggestion(dish)}
                              className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold rounded-lg flex items-center justify-center space-x-1 shadow-sm transition"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Add to Tab</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ============================================================
                   CASE 2: BILL BREAKDOWN (PRICES REVEALED AFTER GET BILL FLOW)
                   ============================================================ */
                <div className="space-y-4">
                  {/* Bill Branding Header */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1">
                    <h4 className="font-serif font-black text-sm text-slate-900 uppercase tracking-wider">
                      {billConfig?.restaurantName || activeRestaurant.name}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {billConfig?.address || activeRestaurant.address}
                    </p>
                    {billConfig?.gstin && (
                      <p className="text-[10px] text-slate-600 font-mono font-bold">
                        GSTIN: {billConfig.gstin}
                      </p>
                    )}
                    <div className="pt-1 text-[10px] text-slate-500 font-mono">
                      Table #{activeTable} • {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  {/* Itemized Price Table (Section 27) */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 p-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 grid grid-cols-12 gap-2">
                      <span className="col-span-6">Dish</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Price</span>
                      <span className="col-span-2 text-right">Amount</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs text-slate-800">
                      {allOrderedItems.map((item, idx) => (
                        <div key={`${item.id}_${idx}`} className="p-2.5 grid grid-cols-12 gap-2 items-center">
                          <span className="col-span-6 font-semibold truncate">{item.name}</span>
                          <span className="col-span-2 text-center text-slate-500">×{item.quantity}</span>
                          <span className="col-span-2 text-right font-mono text-slate-500">₹{item.price}</span>
                          <span className="col-span-2 text-right font-mono font-bold">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Charges & Tax Calculation Breakdown */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({gstRate}%)</span>
                      <span className="font-mono">₹{gstAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Staff Service Charge ({serviceRate}%)</span>
                      <span className="font-mono">₹{serviceAmount}</span>
                    </div>
                    {packaging > 0 && (
                      <div className="flex justify-between">
                        <span>Packaging &amp; Cutlery Fee</span>
                        <span className="font-mono">₹{packaging}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-2 mt-1">
                      <span>GRAND TOTAL</span>
                      <span className="text-emerald-700 font-mono text-base">₹{totalAmount}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-500">
                    {billConfig?.footerMessage || 'Thank you for dining with us! Service captain will process your payment.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-2">
              <button
                onClick={handleCallCaptainClick}
                disabled={callCooldownRemaining > 0}
                className="w-full py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span>{callCooldownRemaining > 0 ? `Wait ${callCooldownRemaining}s` : 'Call Captain'}</span>
              </button>

              {!isBillRequested ? (
                <button
                  onClick={() => {
                    askForBill(activeTable);
                  }}
                  disabled={subtotal === 0}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center space-x-1.5 transition-transform active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>Ask for Bill &rarr;</span>
                </button>
              ) : (
                <div className="w-full py-2.5 px-3 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center justify-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bill Requested ✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
