import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { MenuItem } from '../../types/tenant';
import { Search, Flame, Sparkles, Filter, X, ShoppingBag, Plus, Minus, CheckCircle2, ArrowRight } from 'lucide-react';

interface CartItem {
  dish: MenuItem;
  quantity: number;
}

import { PostOrderReviewModal } from './PostOrderReviewModal';

export const CustomerMenu: React.FC = () => {
  const {
    activeRestaurant,
    activeMenuItems,
    activeTable,
    activeTables,
    placeCustomerOrder,
    orders,
    currentTableSession,
  } = useTenant();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVegOnly, setFilterVegOnly] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  // Cart State (Zomato/Swiggy style)
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isReviewCartOpen, setIsReviewCartOpen] = useState<boolean>(false);
  const [orderPlacedSuccess, setOrderPlacedSuccess] = useState<boolean>(false);
  const [showPostOrderReviewModal, setShowPostOrderReviewModal] = useState<boolean>(false);

  const primaryColor = activeRestaurant.branding.primaryColor;
  const secondaryColor = activeRestaurant.branding.secondaryColor;

  // Extract unique categories cleanly
  const categories = [
    'All',
    ...Array.from(new Set(activeMenuItems.map((item) => (item.category || 'Mains').trim()).filter(Boolean))),
  ];

  // Filtered dishes
  const filteredDishes = activeMenuItems.filter((dish) => {
    const dishCat = (dish.category || 'Mains').trim().toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' || dishCat === selectedCategory.trim().toLowerCase();
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !filterVegOnly || dish.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  // Cart helper actions
  const addToCart = (dish: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [dish.id]: {
        dish,
        quantity: (prev[dish.id]?.quantity || 0) + 1,
      },
    }));
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) => {
      const currentQty = prev[dishId]?.quantity || 0;
      if (currentQty <= 1) {
        const next = { ...prev };
        delete next[dishId];
        return next;
      }
      return {
        ...prev,
        [dishId]: {
          ...prev[dishId],
          quantity: currentQty - 1,
        },
      };
    });
  };

  const cartList = Object.values(cart);
  const totalCartCount = cartList.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartList.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const tableOrders = orders.filter(
    (o) => (o.restaurantId ? o.restaurantId === activeRestaurant.id : true) && o.tableNumber === activeTable && o.status !== 'cancelled'
  );
  const currentTableRecord = activeTables.find((t) => t.tableNumber === activeTable);
  const isDiningComplete = currentTableRecord?.status === 'paid_pending_reset';
  const isTableCleared = currentTableRecord?.status === 'available' && tableOrders.length === 0;
  const hasLiveTab = !isTableCleared && (tableOrders.length > 0 || !!currentTableSession);

  const handlePlaceOrder = () => {
    if (isDiningComplete || cartList.length === 0) return;

    placeCustomerOrder(
      activeTable,
      cartList.map((item) => ({
        menuItemId: item.dish.id,
        name: item.dish.name,
        price: item.dish.price,
        quantity: item.quantity,
      }))
    );

    setCart({});
    setOrderPlacedSuccess(true);
    setIsReviewCartOpen(false);
    setTimeout(() => {
      setOrderPlacedSuccess(false);
      setShowPostOrderReviewModal(true);
    }, 1200);
  };

  return (
    <div className="space-y-4 px-4 pt-2 pb-40 animate-fade-in relative">
      {/* Header Title */}
      <div className="pt-2">
        <span
          className="text-[10px] font-bold uppercase tracking-widest block"
          style={{ color: secondaryColor }}
        >
          Curated Gastronomy
        </span>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          The Menu
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Select your signature dishes and add them to Table {activeTable}'s live tab.
        </p>
      </div>

      {/* Dining Complete / Session Settled Alert (Req 9, 52) */}
      {isDiningComplete && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start space-x-3 text-emerald-900 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm">Table {activeTable} Dining Complete • Bill Settled</div>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              Your table bill has been settled by the captain. Order placement is closed for this dining session. Thank you for dining with us! You can still browse our menu dishes or check your settled tab.
            </p>
          </div>
        </div>
      )}

      {/* Search & Veg Filter */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dishes, flavours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
          />
        </div>

        {/* Veg Only Toggle Button */}
        <button
          onClick={() => setFilterVegOnly(!filterVegOnly)}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border flex items-center space-x-1.5 transition ${
            filterVegOnly
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <div className="w-3 h-3 border border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>
          <span className="text-[11px]">Veg Only</span>
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              selectedCategory === cat
                ? 'text-white shadow-sm font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
            style={{
              backgroundColor: selectedCategory === cat ? primaryColor : undefined,
              borderColor: selectedCategory === cat ? primaryColor : undefined,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dishes List */}
      <div className="space-y-3.5 pt-1">
        {filteredDishes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <p className="text-sm font-serif font-bold text-slate-700">No dishes match your criteria</p>
            <p className="text-xs text-slate-400">Try resetting filters or searching for another item.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setFilterVegOnly(false);
              }}
              className="text-xs font-bold text-emerald-700 underline pt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const inCartQty = cart[dish.id]?.quantity || 0;
            const isAvailable = dish.isAvailable !== false;
            const fallbackImage =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={dish.id}
                className={`bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex space-x-3 group ${
                  !isAvailable ? 'opacity-70' : ''
                }`}
              >
                {/* Dish Image */}
                <div
                  onClick={() => setSelectedDish(dish)}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 cursor-pointer"
                >
                  <img
                    src={dish.imageUrl || fallbackImage}
                    alt={dish.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      !isAvailable ? 'grayscale opacity-75' : ''
                    }`}
                  />
                  {dish.isChefSpecial && isAvailable && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-400/90 text-slate-950 font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center space-x-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Special</span>
                    </span>
                  )}
                  {!isAvailable && (
                    <span className="absolute bottom-1.5 left-1.5 bg-rose-600 text-white font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Dish Info */}
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div onClick={() => setSelectedDish(dish)} className="cursor-pointer">
                    {/* Veg / Non-veg Indicator & Category */}
                    <div className="flex items-center space-x-1.5 mb-1">
                      {dish.isVeg ? (
                        <div className="w-3.5 h-3.5 border border-emerald-600 rounded-[2px] flex items-center justify-center p-0.5 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 border border-rose-700 rounded-[2px] flex items-center justify-center p-0.5 shrink-0">
                          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-rose-700" />
                        </div>
                      )}
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {dish.category || 'Mains'}
                      </span>
                      {dish.rating && (
                        <span className="text-[10px] text-amber-600 font-bold ml-auto flex items-center">
                          ★ {dish.rating}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-serif font-bold text-sm text-slate-900 leading-snug group-hover:text-amber-900 transition">
                      {dish.name}
                    </h3>

                    {/* Description preview */}
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  {/* Price & Add to Cart Controls */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                    <span className="font-serif font-bold text-slate-900 text-sm">
                      ₹{dish.price}
                    </span>

                    {/* Quantity Stepper or Add Button */}
                    {!isAvailable ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-400 border border-slate-200">
                        Sold Out
                      </span>
                    ) : isDiningComplete ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                        Closed
                      </span>
                    ) : inCartQty > 0 ? (
                      <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-300 rounded-lg px-2 py-1 text-emerald-900 shadow-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(dish.id);
                          }}
                          className="hover:text-emerald-700 p-0.5"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold font-mono px-1">{inCartQty}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(dish);
                          }}
                          className="hover:text-emerald-700 p-0.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(dish);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold border transition-all shadow-sm flex items-center space-x-1"
                        style={{
                          backgroundColor: `${secondaryColor}15`,
                          borderColor: secondaryColor,
                          color: primaryColor,
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Cart Bar (Zomato/Swiggy UX, Section 6) */}
      {totalCartCount > 0 && (
        <div className={`fixed ${hasLiveTab ? 'bottom-[136px]' : 'bottom-20'} inset-x-0 z-30 px-4 max-w-md mx-auto pointer-events-none animate-slideUp transition-all duration-300`}>
          <button
            onClick={() => setIsReviewCartOpen(true)}
            className="pointer-events-auto w-full py-3 px-4 rounded-2xl text-white shadow-2xl flex items-center justify-between transition-transform active:scale-98"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center space-x-2 text-left">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                {totalCartCount}
              </div>
              <div>
                <span className="text-xs font-bold block leading-tight">
                  {totalCartCount} item{totalCartCount > 1 ? 's' : ''} added
                </span>
                <span className="text-[10px] text-amber-200">Table {activeTable} Tab</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-sm">₹{cartSubtotal}</span>
              <span className="text-xs font-bold flex items-center">
                Review & Order <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Dish Detail Modal */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="relative h-56 w-full">
              <img
                src={selectedDish.imageUrl}
                alt={selectedDish.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDish(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
              {selectedDish.isChefSpecial && (
                <div className="absolute bottom-3 left-3 bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1 shadow-md">
                  <Sparkles className="w-3 h-3" />
                  <span>Chef Recommendation</span>
                </div>
              )}
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {selectedDish.isVeg ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>Vegetarian</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      <span>Non-Vegetarian</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedDish.category}
                  </span>
                </div>
                <div className="font-serif text-xl font-bold text-slate-900">
                  ₹{selectedDish.price}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900">
                  {selectedDish.name}
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {selectedDish.description}
                </p>
              </div>

              {/* Extra Culinary Meta */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Preparation</span>
                  <span className="font-medium text-slate-800">Fresh Charcoal Dum</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Guest Rating</span>
                  <span className="font-bold text-amber-600 flex items-center">
                    ★ {selectedDish.rating} / 5.0
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (selectedDish.isAvailable !== false && !isDiningComplete) {
                      addToCart(selectedDish);
                      setSelectedDish(null);
                    }
                  }}
                  disabled={selectedDish.isAvailable === false || isDiningComplete}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-md transition flex items-center justify-center space-x-2 ${
                    selectedDish.isAvailable === false || isDiningComplete ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : ''
                  }`}
                  style={{
                    backgroundColor: selectedDish.isAvailable === false || isDiningComplete ? undefined : primaryColor,
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {selectedDish.isAvailable === false
                      ? 'Item Currently Sold Out'
                      : isDiningComplete
                      ? 'Bill Settled • Ordering Closed'
                      : `Add to Order (₹${selectedDish.price})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Cart Modal (Section 6: review → place order) */}
      {isReviewCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div
              className="p-4 flex items-center justify-between text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Review Table {activeTable} Order</h3>
              </div>
              <button onClick={() => setIsReviewCartOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderPlacedSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Order Received!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your selection has been forwarded to the Captain Interface for floor confirmation. Kitchen prep will start immediately.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {cartList.map((item) => (
                    <div key={item.dish.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.dish.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">₹{item.dish.price} each</p>
                      </div>

                      <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-2 py-1">
                        <button onClick={() => removeFromCart(item.dish.id)} className="p-0.5 text-slate-600">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold font-mono px-1">{item.quantity}</span>
                        <button onClick={() => addToCart(item.dish)} className="p-0.5 text-slate-600">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Items Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    *Taxes (GST 5%) & service charges apply automatically on your live open tab.
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Confirm & Place Order (₹{cartSubtotal})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Post-Order Celebration & Instant Discount Review Modal */}
      <PostOrderReviewModal
        isOpen={showPostOrderReviewModal}
        onClose={() => setShowPostOrderReviewModal(false)}
      />
    </div>
  );
};
