import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { realtimeHub } from '../services/realtime/realtimeService';
import {
  Restaurant,
  MenuItem,
  Customer,
  Review,
  RewardWheelItem,
  CustomerReward,
  UnifiedCoupon,
  Offer,
  SocialSubmission,
  MasterBillUpload,
  TableRecord,
  Campaign,
  TenantRole,
  CustomerViewMode,
  MasterGlobalCustomer,
  TableSessionLog,
  TableDayHistory,
  ClearTableAuditLog,
  BillConfiguration,
} from '../types/tenant';
import {
  StaffRole,
  TableSession,
  SessionMember,
  CaptainCall,
  CaptainOrder,
  OrderItemEntry,
} from '../types/captain';
import {
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  INITIAL_REWARD_ITEMS,
  INITIAL_OFFERS,
  INITIAL_CUSTOMERS,
  INITIAL_REVIEWS,
  INITIAL_SOCIAL_SUBMISSIONS,
  INITIAL_TABLES,
  INITIAL_CAMPAIGNS,
} from '../data/seedData';

// Initial Captain Calls
const SEED_CAPTAIN_CALLS: CaptainCall[] = [
  {
    id: 'call_1',
    restaurantId: 'rest_heritage',
    tableNumber: 7,
    status: 'pending',
    createdAt: new Date(Date.now() - 45000).toISOString(),
    assignedCaptainId: 'cpt_vikram',
  },
];

// Initial Active Table Sessions
const SEED_TABLE_SESSIONS: Record<string, TableSession[]> = {
  rest_heritage: [
    {
      id: 'sess_table_12',
      restaurantId: 'rest_heritage',
      tableNumber: 12,
      hostName: 'Abhishek Sharma',
      hostPhone: '+91 98200 11223',
      members: [
        {
          id: 'mem_1',
          name: 'Abhishek Sharma',
          phone: '+91 98200 11223',
          isHost: true,
          joinedAt: '12:30 PM',
        },
        {
          id: 'mem_2',
          name: 'Pooja Verma',
          phone: '+91 98200 44556',
          isHost: false,
          joinedAt: '12:35 PM',
        },
      ],
      geofenceVerified: true,
      geofenceOverridden: false,
      status: 'active',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
};

// Initial Orders
const SEED_ORDERS: CaptainOrder[] = [
  {
    id: 'ord_101',
    restaurantId: 'rest_heritage',
    tabId: 'tab_table_12',
    tableNumber: 12,
    orderedByName: 'Abhishek Sharma',
    orderedByPhone: '+91 98200 11223',
    items: [
      {
        id: 'ord_item_1',
        menuItemId: 'dish_h1',
        name: 'Galouti Kebab Lucknowi',
        price: 540,
        quantity: 1,
        source: 'customer',
      },
      {
        id: 'ord_item_2',
        menuItemId: 'dish_h3',
        name: 'Murg Dum Biryani Handi',
        price: 590,
        quantity: 2,
        source: 'customer',
      },
      {
        id: 'ord_item_3',
        menuItemId: 'dish_h5',
        name: 'Heritage Garlic Naan',
        price: 95,
        quantity: 3,
        source: 'captain', // Captain oral addition
      },
    ],
    status: 'preparing',
    estimatedPrepMinutes: 20,
    prepStartedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    prepExpiresAt: new Date(Date.now() + 12 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    source: 'customer',
  },
];

// Seed Master Bill Uploads for Audit
const SEED_BILL_UPLOADS: MasterBillUpload[] = [
  {
    id: 'bill_up_1',
    restaurantId: 'rest_heritage',
    restaurantName: 'HERITAGE',
    tableNumber: 8,
    customerName: 'Rohit Kulkarni',
    customerPhone: '+91 98201 99887',
    billPhotoUrl: 'https://images.unsplash.com/photo-1554415707-9e4966675033?auto=format&fit=crop&w=600&q=80',
    reportedAppTotal: 2450,
    auditedStatus: 'pending',
    bonusScratchWon: {
      label: '15% OFF Next Visit',
      value: 15,
      code: 'HRTG-AUDIT15K',
    },
    uploadedAt: 'Today, 2:15 PM',
  },
  {
    id: 'bill_up_2',
    restaurantId: 'rest_bambaihouse',
    restaurantName: 'BAMBAI HOUSE',
    tableNumber: 4,
    customerName: 'Ananya Deshmukh',
    customerPhone: '+91 98202 33441',
    billPhotoUrl: 'https://images.unsplash.com/photo-1554415707-9e4966675033?auto=format&fit=crop&w=600&q=80',
    reportedAppTotal: 1890,
    auditedStatus: 'verified',
    uploadedAt: 'Yesterday, 8:40 PM',
  },
];

// Initial Unified 2-Coupon Wallet
const SEED_UNIFIED_COUPONS: UnifiedCoupon[] = [
  {
    id: 'coup_active_1',
    restaurantId: 'rest_heritage',
    customerPhone: '+91 98200 11223',
    voucherCode: 'HRTG-8F42K',
    rewardLabel: '15% OFF Royal Dining',
    discountType: 'percentage',
    discountValue: 15,
    slot: 'active',
    source: 'spin_win',
    status: 'held',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    activatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 86400000).toISOString(), // 20-day clock
    tableNumber: 12,
  },
  {
    id: 'coup_queued_1',
    restaurantId: 'rest_heritage',
    customerPhone: '+91 98200 11223',
    voucherCode: 'HRTG-NEXT20G',
    rewardLabel: '₹200 Flat OFF Next Visit',
    discountType: 'fixed',
    discountValue: 200,
    slot: 'queued',
    source: 'instagram',
    status: 'held',
    createdAt: new Date().toISOString(),
    expiresAt: 'Starts fresh upon activation (20 days)',
    tableNumber: 12,
  },
];

// Seed Table History
const todayHistoryStr = new Date().toISOString().split('T')[0];

const SEED_TABLE_HISTORY: Record<string, TableDayHistory[]> = {
  rest_heritage: [
    {
      date: todayHistoryStr,
      displayDate: 'Today',
      tableNumber: 12,
      restaurantId: 'rest_heritage',
      qrScans: 8,
      uniqueVisitors: 6,
      totalPeople: 14,
      visits: 3,
      newCustomers: 2,
      returningCustomers: 1,
      orders: 5,
      revenue: 4250,
      averageSpend: 1416,
      reviews: 2,
      spins: 3,
      couponsRedeemed: 1,
      discountGiven: 250,
      captainCalls: 2,
      billRequests: 2,
      peakTime: '1:30 PM - 2:30 PM',
      sessions: [
        {
          id: 'sess_hist_1',
          sessionId: 'sess_101',
          restaurantId: 'rest_heritage',
          tableNumber: 12,
          date: todayHistoryStr,
          displayDate: 'Today, 1:15 PM',
          startTime: new Date(Date.now() - 4 * 3600000).toISOString(),
          endTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
          hostName: 'Rohit Kulkarni',
          hostPhone: '+91 98201 99887',
          guestCount: 4,
          ordersCount: 3,
          totalSpend: 3200,
          status: 'cleared',
          paymentMethod: 'online',
          dishesOrdered: [
            { name: 'Galouti Kebab Lucknowi', quantity: 2, price: 540, category: 'Starters' },
            { name: 'Murg Dum Biryani Handi', quantity: 2, price: 590, category: 'Main Course' },
            { name: 'Heritage Garlic Naan', quantity: 4, price: 95, category: 'Breads' },
          ],
          captainCallsCount: 1,
          billRequested: true,
          reviewed: true,
          spunWheel: true,
          clearedByCaptain: 'Captain Vikram',
        },
      ],
    },
    {
      date: todayHistoryStr,
      displayDate: 'Today',
      tableNumber: 7,
      restaurantId: 'rest_heritage',
      qrScans: 4,
      uniqueVisitors: 3,
      totalPeople: 6,
      visits: 2,
      newCustomers: 1,
      returningCustomers: 1,
      orders: 3,
      revenue: 2850,
      averageSpend: 1425,
      reviews: 1,
      spins: 2,
      couponsRedeemed: 0,
      discountGiven: 0,
      captainCalls: 0,
      billRequests: 1,
      peakTime: '12:45 PM - 1:45 PM',
      sessions: [
        {
          id: 'sess_hist_2',
          sessionId: 'sess_102',
          restaurantId: 'rest_heritage',
          tableNumber: 7,
          date: todayHistoryStr,
          displayDate: 'Today, 12:45 PM',
          startTime: new Date(Date.now() - 6 * 3600000).toISOString(),
          endTime: new Date(Date.now() - 5 * 3600000).toISOString(),
          hostName: 'Vikram Joshi',
          hostPhone: '+91 98200 77665',
          guestCount: 2,
          ordersCount: 2,
          totalSpend: 1850,
          status: 'cleared',
          paymentMethod: 'cash',
          dishesOrdered: [
            { name: 'Dal Makhani Bukhara', quantity: 1, price: 420, category: 'Main Course' },
            { name: 'Heritage Garlic Naan', quantity: 3, price: 95, category: 'Breads' },
          ],
          captainCallsCount: 0,
          billRequested: true,
          reviewed: true,
          spunWheel: false,
          clearedByCaptain: 'Captain Vikram',
        },
      ],
    },
  ],
};

// Default Bill Configurations
const DEFAULT_BILL_CONFIGS: Record<string, BillConfiguration> = {
  rest_heritage: {
    restaurantId: 'rest_heritage',
    restaurantName: 'Heritage Fine Dining',
    logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=80&q=80',
    address: 'Plot 42, Bandra Kurla Complex, Mumbai, MH 400051',
    phone: '+91 22 2847 9000',
    gstin: '27AABCH1234F1Z8',
    fssai: '11521018000342',
    website: 'https://heritagedining.in',
    socialHandle: '@heritagemumbai',
    footerMessage: 'Thank you for dining with us! Scan to review or earn rewards.',
    thankYouMessage: 'We look forward to hosting you again soon.',
    termsAndConditions: 'Discretionary service charge is voluntary and may be removed upon request.',
    paymentInstructions: 'Scan QR at table or pay at counter.',
    templateStyle: 'standard',
    charges: [
      { id: 'chg_gst', name: 'GST (CGST 2.5% + SGST 2.5%)', type: 'percentage', value: 5, active: true, order: 1 },
      { id: 'chg_srv', name: 'Discretionary Service Charge', type: 'percentage', value: 5, active: true, order: 2 },
      { id: 'chg_pkg', name: 'Packaging / Hygiene Fee', type: 'fixed', value: 20, active: false, order: 3 },
    ],
    showLogo: true,
    showGstin: true,
    showAddress: true,
    showPhone: true,
    showTableNumber: true,
    showCustomerName: true,
    showPaymentMethod: true,
    showTaxBreakdown: true,
    showDiscountBreakdown: true,
    showFooterMessage: true,
  },
};

interface CustomerSessionState {
  name: string;
  phone: string;
  isHost: boolean;
  tableNumber: number;
}

interface TenantContextType {
  // Navigation & Tenant state
  role: TenantRole;
  setRole: (role: TenantRole) => void;
  staffRole: StaffRole;
  setStaffRole: (role: StaffRole) => void;
  activeRestaurantSlug: string;
  setActiveRestaurantSlug: (slug: string) => void;
  activeRestaurant: Restaurant;
  activeTable: number;
  setActiveTable: (table: number) => void;
  customerViewMode: CustomerViewMode;
  setCustomerViewMode: (mode: CustomerViewMode) => void;
  customerActiveTab: 'home' | 'menu' | 'reviews' | 'rewards' | 'social';
  setCustomerActiveTab: (tab: 'home' | 'menu' | 'reviews' | 'rewards' | 'social') => void;

  // Multi-Tenant Collections
  restaurants: Restaurant[];
  activeMenuItems: MenuItem[];
  activeRewardItems: RewardWheelItem[];
  activeOffers: Offer[];
  activeCustomers: Customer[];
  activeReviews: Review[];
  activeSocialSubmissions: SocialSubmission[];
  activeTables: TableRecord[];
  activeCampaigns: Campaign[];

  // Customer Identity & GPS Geofence (Section 5)
  customerSession: CustomerSessionState | null;
  registerCustomerSession: (name: string, phone: string, tableNumber: number) => { isReturning: boolean; isHost: boolean };
  logoutCustomerSession: () => void;
  geofenceStatus: 'checking' | 'passed' | 'failed' | 'requested_override' | 'overridden';
  setGeofenceStatus: (status: 'checking' | 'passed' | 'failed' | 'requested_override' | 'overridden') => void;
  requestGeofenceOverride: (tableNumber: number) => void;
  captainApproveGeofence: (tableNumber: number) => void;

  // Multi-Person Sessions (Section 5)
  tableSessions: Record<string, TableSession[]>;
  currentTableSession: TableSession | null;
  joinTableSession: (tableNumber: number, name: string, phone: string) => void;
  reassignSessionHost: (tableNumber: number, newHostName: string, newHostPhone: string) => void;
  assignManualTable: (tableNumber: number, guestName: string, guestPhone: string, guestCount: number) => void;

  // Call Captain (Section 10)
  captainCalls: CaptainCall[];
  callCaptain: (tableNumber: number) => { success: boolean; message: string };
  acknowledgeCaptainCall: (callId: string) => void;
  callCooldownRemaining: number;

  // Open Tab & Orders (Section 6, 7, 8, 9)
  orders: CaptainOrder[];
  activeOrders: CaptainOrder[];
  placeCustomerOrder: (tableNumber: number, items: { menuItemId: string; name: string; price: number; quantity: number }[]) => void;
  captainAddOrder: (tableNumber: number, items: { menuItemId: string; name: string; price: number; quantity: number }[]) => void;
  confirmOrder: (orderId: string, prepMinutes: 10 | 20 | 30) => void;
  deliverOrder: (orderId: string) => void;
  deliverOrderItem: (orderId: string, itemId: string) => void;
  cancelOrder: (orderId: string) => void;
  removeOrderItem: (orderId: string, itemId: string) => void;
  askForBill: (tableNumber: number) => void;
  closeTableTab: (tableNumber: number, paymentMethod: 'cash' | 'online') => void;
  resetTable: (tableNumber: number) => void;
  forceCloseSession: (tableNumber: number) => void;

  // Unified 2-Coupon Engine (Section 13)
  unifiedCoupons: UnifiedCoupon[];
  customerWallet: CustomerReward[];
  canSpin: boolean;
  unlockedExtraSpins: number;
  grantCustomerSpin: () => void;
  consumeCustomerSpin: () => void;
  addUnifiedCoupon: (coupon: Omit<UnifiedCoupon, 'id' | 'createdAt' | 'status'>) => {
    status: 'held' | 'queued' | 'limit_reached';
    coupon?: UnifiedCoupon;
  };
  deleteCoupon: (id: string) => void;
  activateQueuedCoupon: (id: string) => void;
  redeemCoupon: (id: string) => void;
  addCustomerReward: (reward: Omit<CustomerReward, 'id' | 'createdAt'>) => CustomerReward;
  redeemReward: (id: string) => void;

  // Master Admin Bill Upload (Section 8a)
  masterBillUploads: MasterBillUpload[];
  uploadBillToMaster: (data: {
    tableNumber: number;
    customerName: string;
    customerPhone: string;
    billPhotoUrl: string;
    reportedAppTotal: number;
  }) => { wonDiscount: { label: string; value: number; code: string } | null };
  updateBillAuditStatus: (id: string, status: 'verified' | 'discrepancy_flagged') => void;

  // Restaurant Admin Actions
  addRestaurant: (newRest: Partial<Restaurant>) => Restaurant;
  ensureRestaurantExists: (slug: string) => Restaurant;
  resolveRestaurant: (slug: string) => Restaurant | null;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void;
  toggleRestaurantStatus: (id: string) => void;
  updateRestaurantPlanFeatures: (id: string, features: any) => void;

  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  batchImportMenuItems: (items: Omit<MenuItem, 'id'>[], conflictResolution: 'keep' | 'overwrite') => { importedCount: number };

  addReview: (review: Omit<Review, 'id' | 'date' | 'verified'>) => void;
  submitSocialProof: (data: {
    customerName: string;
    customerPhone: string;
    platform: any;
    screenshotUrl: string;
    instagramHandle?: string;
  }) => void;
  approveSocialSubmission: (id: string) => void;
  rejectSocialSubmission: (id: string) => void;

  updateRewardItem: (id: string, updates: Partial<RewardWheelItem>) => void;
  addRewardItem: (item: Omit<RewardWheelItem, 'id'>) => RewardWheelItem;
  deleteRewardItem: (id: string) => void;
  saveRewardConfiguration: (restaurantId: string, items: RewardWheelItem[]) => boolean;
  createOffer: (offer: Omit<Offer, 'id' | 'usedCount'>) => void;
  toggleOfferActive: (id: string) => void;

  // Table Management & History
  addTable: (tableNumber: number) => void;
  deleteTable: (tableNumber: number) => void;
  toggleTableActive: (tableNumber: number) => void;
  recordTableScan: (restaurantId: string, tableNumber: number, slug?: string) => void;
  clearTable: (tableNumber: number, captainId?: string, captainName?: string) => { success: boolean; message: string };
  tableHistoryMap: Record<string, TableDayHistory[]>;
  clearTableAudits: ClearTableAuditLog[];

  // Bill Configurations
  billConfigsMap: Record<string, BillConfiguration>;
  activeBillConfig: BillConfiguration;
  updateBillConfiguration: (config: BillConfiguration) => void;

  resetToDefaults: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  RESTAURANTS: 'ensemble_restaurants_v3',
  MENU: 'ensemble_menu_v3',
  REWARDS: 'ensemble_rewards_v3',
  OFFERS: 'ensemble_offers_v3',
  CUSTOMERS: 'ensemble_customers_v3',
  REVIEWS: 'ensemble_reviews_v3',
  SOCIAL: 'ensemble_social_v3',
  TABLES: 'ensemble_tables_v3',
  WALLET: 'ensemble_wallet_v3',
  UNIFIED_COUPONS: 'ensemble_unified_coupons_v3',
  ORDERS: 'ensemble_orders_v3',
  TABLE_SESSIONS: 'ensemble_sessions_v3',
  CAPTAIN_CALLS: 'ensemble_captain_calls_v3',
  BILL_UPLOADS: 'ensemble_bill_uploads_v3',
  TABLE_HISTORY: 'ensemble_table_history_v3',
  BILL_CONFIGS: 'ensemble_bill_configs_v3',
  CLEAR_TABLE_AUDITS: 'ensemble_clear_table_audits_v3',
  CUSTOMER_SESSION: 'ensemble_customer_session_v3',
};

export function rebalanceWheelProbabilities(
  items: RewardWheelItem[],
  fixedId?: string,
  fixedProb?: number
): RewardWheelItem[] {
  const active = items.filter((i) => i.active);
  if (active.length === 0) return items;

  if (active.length === 1) {
    return items.map((i) =>
      i.active ? { ...i, probability: 100 } : { ...i, probability: 0 }
    );
  }

  if (fixedId !== undefined && fixedProb !== undefined) {
    const clamped = Math.max(0, Math.min(100, Math.round(fixedProb * 10) / 10));
    const remaining = Math.round((100 - clamped) * 10) / 10;
    const others = active.filter((i) => i.id !== fixedId);
    const m = others.length;

    if (m === 0) {
      return items.map((i) =>
        i.id === fixedId ? { ...i, probability: 100 } : { ...i, probability: 0 }
      );
    }

    const base = Math.floor((remaining / m) * 10) / 10;
    let distributed = 0;
    const shareMap = new Map<string, number>();

    others.forEach((item, idx) => {
      if (idx === m - 1) {
        const last = Math.round((remaining - distributed) * 10) / 10;
        shareMap.set(item.id, Math.max(0, last));
      } else {
        distributed = Math.round((distributed + base) * 10) / 10;
        shareMap.set(item.id, Math.max(0, base));
      }
    });

    return items.map((item) => {
      if (!item.active) return { ...item, probability: 0 };
      if (item.id === fixedId) return { ...item, probability: clamped };
      return { ...item, probability: shareMap.get(item.id) ?? 0 };
    });
  }

  const count = active.length;
  const base = Math.floor((100 / count) * 10) / 10;
  let distributed = 0;
  const shareMap = new Map<string, number>();

  active.forEach((item, idx) => {
    if (idx === count - 1) {
      const last = Math.round((100 - distributed) * 10) / 10;
      shareMap.set(item.id, Math.max(0, last));
    } else {
      distributed = Math.round((distributed + base) * 10) / 10;
      shareMap.set(item.id, Math.max(0, base));
    }
  });

  return items.map((item) =>
    item.active
      ? { ...item, probability: shareMap.get(item.id) ?? 0 }
      : { ...item, probability: 0 }
  );
}

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<TenantRole>('customer');
  const [staffRole, setStaffRole] = useState<StaffRole>('owner');
  const [activeRestaurantSlug, setActiveRestaurantSlug] = useState<string>('heritage');
  const [activeTable, setActiveTable] = useState<number>(1);
  const [customerViewMode, setCustomerViewMode] = useState<CustomerViewMode>('mobile_frame');
  const [customerActiveTab, setCustomerActiveTab] = useState<'home' | 'menu' | 'reviews' | 'rewards' | 'social'>('home');

  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = loadState<Restaurant[]>(STORAGE_KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
    const merged = [...saved];
    for (const initR of INITIAL_RESTAURANTS) {
      if (!merged.some((r) => r.slug.toLowerCase() === initR.slug.toLowerCase())) {
        merged.push(initR);
      }
    }
    return merged;
  });
  const [menuItemsMap, setMenuItemsMap] = useState<Record<string, MenuItem[]>>(() =>
    loadState(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS)
  );
  const [rewardItemsMap, setRewardItemsMap] = useState<Record<string, RewardWheelItem[]>>(() =>
    loadState(STORAGE_KEYS.REWARDS, INITIAL_REWARD_ITEMS)
  );
  const [offersMap, setOffersMap] = useState<Record<string, Offer[]>>(() =>
    loadState(STORAGE_KEYS.OFFERS, INITIAL_OFFERS)
  );
  const [customersMap, setCustomersMap] = useState<Record<string, Customer[]>>(() =>
    loadState(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  );
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>(() =>
    loadState(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS)
  );
  const [socialSubmissionsMap, setSocialSubmissionsMap] = useState<Record<string, SocialSubmission[]>>(() =>
    loadState(STORAGE_KEYS.SOCIAL, INITIAL_SOCIAL_SUBMISSIONS)
  );
  const [tablesMap, setTablesMap] = useState<Record<string, TableRecord[]>>(() => {
    const saved = loadState<Record<string, TableRecord[]>>(STORAGE_KEYS.TABLES, INITIAL_TABLES);
    const combined = { ...INITIAL_TABLES, ...saved };
    const sanitized: Record<string, TableRecord[]> = {};
    for (const [restId, tables] of Object.entries(combined)) {
      const rest = INITIAL_RESTAURANTS.find((r) => r.id === restId);
      const slug = rest?.slug || restId.replace('rest_', '');
      sanitized[restId] = (tables || []).map((t) => ({
        ...t,
        qrUrl: `https://ensemble-restaurant.vercel.app/${slug}/t/${t.tableNumber}`,
      }));
    }
    return sanitized;
  });
  const [campaignsMap] = useState<Record<string, Campaign[]>>(INITIAL_CAMPAIGNS);

  // New Phase 1 State
  const [tableSessions, setTableSessions] = useState<Record<string, TableSession[]>>(() =>
    loadState(STORAGE_KEYS.TABLE_SESSIONS, SEED_TABLE_SESSIONS)
  );
  const [orders, setOrders] = useState<CaptainOrder[]>(() => {
    const raw = loadState<CaptainOrder[]>(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    return raw.map((o) => (o.restaurantId ? o : { ...o, restaurantId: 'rest_heritage' }));
  });
  const [captainCalls, setCaptainCalls] = useState<CaptainCall[]>(() =>
    loadState(STORAGE_KEYS.CAPTAIN_CALLS, SEED_CAPTAIN_CALLS)
  );
  const [masterBillUploads, setMasterBillUploads] = useState<MasterBillUpload[]>(() =>
    loadState(STORAGE_KEYS.BILL_UPLOADS, SEED_BILL_UPLOADS)
  );
  const [unifiedCoupons, setUnifiedCoupons] = useState<UnifiedCoupon[]>(() =>
    loadState(STORAGE_KEYS.UNIFIED_COUPONS, SEED_UNIFIED_COUPONS)
  );
  const [tableHistoryMap, setTableHistoryMap] = useState<Record<string, TableDayHistory[]>>(() =>
    loadState(STORAGE_KEYS.TABLE_HISTORY, SEED_TABLE_HISTORY)
  );
  const [billConfigsMap, setBillConfigsMap] = useState<Record<string, BillConfiguration>>(() =>
    loadState(STORAGE_KEYS.BILL_CONFIGS, DEFAULT_BILL_CONFIGS)
  );
  const [clearTableAudits, setClearTableAudits] = useState<ClearTableAuditLog[]>(() =>
    loadState(STORAGE_KEYS.CLEAR_TABLE_AUDITS, [])
  );

  // Legacy wallet sync
  const [customerWallet, setCustomerWallet] = useState<CustomerReward[]>(() =>
    loadState(STORAGE_KEYS.WALLET, [
      {
        id: 'rew_init_1',
        restaurantId: 'rest_heritage',
        code: 'HRTG-WELCOME10',
        rewardLabel: '10% OFF Welcome Bonus',
        discountType: 'percentage',
        discountValue: 10,
        createdAt: 'Today',
        expiresAt: '7 Days',
        status: 'active',
        qrData: 'HRTG-WELCOME10-T12',
        tableNumber: 12,
      },
    ])
  );

  // Customer Session & Geofence
  const [customerSession, setCustomerSession] = useState<CustomerSessionState | null>(() =>
    loadState<CustomerSessionState | null>(STORAGE_KEYS.CUSTOMER_SESSION, null)
  );
  const [geofenceStatus, setGeofenceStatus] = useState<'checking' | 'passed' | 'failed' | 'requested_override' | 'overridden'>('passed');

  // Call Captain Cooldown
  const [lastCallTimestamp, setLastCallTimestamp] = useState<number>(0);
  const [callCooldownRemaining, setCallCooldownRemaining] = useState<number>(0);

  const [canSpin, setCanSpin] = useState<boolean>(true);
  const [unlockedExtraSpins, setUnlockedExtraSpins] = useState<number>(0);

  // Cooldown countdown tick
  useEffect(() => {
    if (callCooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCallCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [callCooldownRemaining]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
  }, [restaurants]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItemsMap));
  }, [menuItemsMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewardItemsMap));
  }, [rewardItemsMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offersMap));
  }, [offersMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customersMap));
  }, [customersMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviewsMap));
  }, [reviewsMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOCIAL, JSON.stringify(socialSubmissionsMap));
  }, [socialSubmissionsMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tablesMap));
  }, [tablesMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(customerWallet));
  }, [customerWallet]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNIFIED_COUPONS, JSON.stringify(unifiedCoupons));
  }, [unifiedCoupons]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLE_SESSIONS, JSON.stringify(tableSessions));
  }, [tableSessions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAPTAIN_CALLS, JSON.stringify(captainCalls));
  }, [captainCalls]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILL_UPLOADS, JSON.stringify(masterBillUploads));
  }, [masterBillUploads]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLE_HISTORY, JSON.stringify(tableHistoryMap));
  }, [tableHistoryMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILL_CONFIGS, JSON.stringify(billConfigsMap));
  }, [billConfigsMap]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLEAR_TABLE_AUDITS, JSON.stringify(clearTableAudits));
  }, [clearTableAudits]);
  useEffect(() => {
    if (customerSession) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_SESSION, JSON.stringify(customerSession));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOMER_SESSION);
    }
  }, [customerSession]);

  // Instant Cross-Tab Synchronization Listener
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === STORAGE_KEYS.MENU) {
          setMenuItemsMap(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.REWARDS) {
          setRewardItemsMap(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.RESTAURANTS) {
          setRestaurants(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.TABLES) {
          setTablesMap(JSON.parse(e.newValue));
        }
      } catch {
        // ignore JSON parse errors
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Resolve active restaurant
  const activeRestaurant =
    restaurants.find((r) => r.slug === activeRestaurantSlug) || restaurants[0];
  const activeRestaurantId = activeRestaurant.id;

  const activeMenuItems = menuItemsMap[activeRestaurantId] || [];
  const activeRewardItems = rewardItemsMap[activeRestaurantId] || [];
  const activeOffers = offersMap[activeRestaurantId] || [];
  const activeCustomers = customersMap[activeRestaurantId] || [];
  const activeReviews = reviewsMap[activeRestaurantId] || [];
  const activeSocialSubmissions = socialSubmissionsMap[activeRestaurantId] || [];
  const activeTables = tablesMap[activeRestaurantId] || [];
  const activeCampaigns = campaignsMap[activeRestaurantId] || [];
  const activeOrders = orders.filter((o) => o.restaurantId === activeRestaurantId);

  // Real-Time Cross-Device Synchronization Hub Subscription
  useEffect(() => {
    if (!activeRestaurant?.slug) return;
    const unsub = realtimeHub.subscribe(activeRestaurant.slug, (envelope) => {
      const { type, tableNumber, payload, restaurantId } = envelope;

      if (type === 'TABLE_SCAN' && tableNumber) {
        const targetRestId = restaurantId || activeRestaurantId;
        setTablesMap((prev) => {
          let list = prev[targetRestId];
          if (!list || list.length === 0) {
            const count = activeRestaurant.tablesCount || 20;
            list = Array.from({ length: count }, (_, i) => ({
              tableNumber: i + 1,
              restaurantId: targetRestId,
              qrUrl: `https://ensemble-restaurant.vercel.app/${activeRestaurant.slug}/t/${i + 1}`,
              status: 'available',
              totalScans: 0,
              lastScanned: 'Never',
            }));
          }
          const updated = list.map((t) => {
            if (t.tableNumber === tableNumber) {
              return {
                ...t,
                status: 'occupied' as const,
                totalScans: (t.totalScans || 0) + 1,
                lastScanned: 'Just now',
              };
            }
            return t;
          });
          return { ...prev, [targetRestId]: updated };
        });

        setTableSessions((prev) => {
          const list = prev[targetRestId] || [];
          const existing = list.find(
            (s) => s.tableNumber === tableNumber && (s.status === 'active' || s.status === 'bill_requested')
          );
          if (existing) return prev;
          const newSess: TableSession = {
            id: `sess_${targetRestId}_t${tableNumber}_${Date.now()}`,
            restaurantId: targetRestId,
            tableNumber,
            hostName: 'Table Guest',
            hostPhone: '',
            members: [],
            geofenceVerified: true,
            geofenceOverridden: false,
            status: 'active',
            createdAt: new Date().toISOString(),
          };
          return { ...prev, [targetRestId]: [newSess, ...list] };
        });
      }

      if (type === 'SESSION_CREATED' && tableNumber) {
        const targetRestId = restaurantId || activeRestaurantId;
        setTablesMap((prev) => {
          let list = prev[targetRestId];
          if (!list || list.length === 0) {
            const count = activeRestaurant.tablesCount || 20;
            list = Array.from({ length: count }, (_, i) => ({
              tableNumber: i + 1,
              restaurantId: targetRestId,
              qrUrl: `https://ensemble-restaurant.vercel.app/${activeRestaurant.slug}/t/${i + 1}`,
              status: 'available',
              totalScans: 0,
              lastScanned: 'Never',
            }));
          }
          const updated = list.map((t) =>
            t.tableNumber === tableNumber ? { ...t, status: 'occupied' as const, lastScanned: 'Just now' } : t
          );
          return { ...prev, [targetRestId]: updated };
        });

        setTableSessions((prev) => {
          const list = prev[targetRestId] || [];
          const hostName = payload?.hostName || 'Table Guest';
          const hostPhone = payload?.hostPhone || '';
          const members = payload?.members && payload.members.length > 0 ? payload.members : [{
            id: `mem_${Date.now()}`,
            name: hostName,
            phone: hostPhone,
            isHost: true,
            joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];

          const existingIdx = list.findIndex(
            (s) => s.tableNumber === tableNumber && s.status !== 'closed' && s.status !== 'discarded'
          );

          if (existingIdx >= 0) {
            const copy = [...list];
            copy[existingIdx] = {
              ...copy[existingIdx],
              hostName,
              hostPhone,
              members,
              status: 'active',
            };
            return { ...prev, [targetRestId]: copy };
          }

          const newSess: TableSession = {
            id: payload?.sessionId || `sess_${targetRestId}_t${tableNumber}_${Date.now()}`,
            restaurantId: targetRestId,
            tableNumber,
            hostName,
            hostPhone,
            members,
            geofenceVerified: true,
            geofenceOverridden: false,
            status: 'active',
            createdAt: new Date().toISOString(),
          };
          return { ...prev, [targetRestId]: [newSess, ...list] };
        });
      }

      if (type === 'MEMBER_JOINED' && tableNumber && payload?.member) {
        const targetRestId = restaurantId || activeRestaurantId;
        setTableSessions((prev) => {
          const list = prev[targetRestId] || [];
          return {
            ...prev,
            [targetRestId]: list.map((s) => {
              if (s.tableNumber === tableNumber && s.status === 'active') {
                if (s.members.some((m) => m.phone === payload.member.phone)) return s;
                return { ...s, members: [...s.members, payload.member] };
              }
              return s;
            }),
          };
        });
      }

      if (type === 'ORDER_PLACED' && payload?.order) {
        setOrders((prev) => {
          if (prev.some((o) => o.id === payload.order.id)) return prev;
          return [payload.order, ...prev];
        });
      }

      if (type === 'ORDER_CONFIRMED' && payload?.orderId) {
        setOrders((prev) =>
          prev.map((o) => (o.id === payload.orderId ? { ...o, status: 'preparing' as const, estimatedPrepMinutes: payload.prepMinutes } : o))
        );
      }

      if (type === 'ORDER_DELIVERED' && payload?.orderId) {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === payload.orderId) {
              if (payload.itemId) {
                const updatedItems = o.items.map((it) =>
                  it.id === payload.itemId ? { ...it, status: 'delivered' as const, deliveredAt: new Date().toISOString() } : it
                );
                const allDelivered = updatedItems.every((it) => it.status === 'delivered');
                return {
                  ...o,
                  status: allDelivered ? ('delivered' as const) : o.status,
                  items: updatedItems,
                };
              }
              return {
                ...o,
                status: 'delivered' as const,
                items: o.items.map((it) => ({ ...it, status: 'delivered' as const, deliveredAt: new Date().toISOString() })),
              };
            }
            return o;
          })
        );
      }

      if (type === 'CALL_CAPTAIN' && payload?.call) {
        setCaptainCalls((prev) => {
          if (prev.some((c) => c.id === payload.call.id)) return prev;
          return [payload.call, ...prev];
        });
      }

      if (type === 'RESOLVE_CALL' && payload?.callId) {
        setCaptainCalls((prev) =>
          prev.map((c) => (c.id === payload.callId ? { ...c, status: 'acknowledged' as const } : c))
        );
      }

      if (type === 'BILL_REQUESTED' && tableNumber) {
        const targetRestId = restaurantId || activeRestaurantId;
        setTablesMap((prev) => ({
          ...prev,
          [targetRestId]: (prev[targetRestId] || []).map((t) =>
            t.tableNumber === tableNumber ? { ...t, status: 'bill_requested' as const } : t
          ),
        }));
        setTableSessions((prev) => ({
          ...prev,
          [targetRestId]: (prev[targetRestId] || []).map((s) =>
            s.tableNumber === tableNumber && s.status === 'active' ? { ...s, status: 'bill_requested' as const } : s
          ),
        }));
      }

      if (type === 'CLEAR_TABLE' && tableNumber) {
        const targetRestId = restaurantId || activeRestaurantId;
        setTablesMap((prev) => ({
          ...prev,
          [targetRestId]: (prev[targetRestId] || []).map((t) =>
            t.tableNumber === tableNumber ? { ...t, status: 'available' as const } : t
          ),
        }));
        setTableSessions((prev) => ({
          ...prev,
          [targetRestId]: (prev[targetRestId] || []).map((s) =>
            s.tableNumber === tableNumber && s.status !== 'closed' ? { ...s, status: 'closed' as const } : s
          ),
        }));
        setCaptainCalls((prev) =>
          prev.filter((c) => !(c.restaurantId === targetRestId && c.tableNumber === tableNumber))
        );
      }

      if (type === 'MENU_SYNC' && payload?.menuItems) {
        const targetRestId = restaurantId || activeRestaurantId;
        setMenuItemsMap((prev) => ({
          ...prev,
          [targetRestId]: payload.menuItems,
        }));
      }

      if (type === 'SPIN_CONFIG_SYNC' && payload?.rewardItems) {
        const targetRestId = restaurantId || activeRestaurantId;
        setRewardItemsMap((prev) => ({
          ...prev,
          [targetRestId]: payload.rewardItems,
        }));
      }
    });

    return () => unsub();
  }, [activeRestaurant?.id, activeRestaurant?.slug, activeRestaurantId]);

  // Active Bill Configuration
  const activeBillConfig: BillConfiguration = billConfigsMap[activeRestaurantId] || {
    restaurantId: activeRestaurantId,
    restaurantName: activeRestaurant.name,
    logoUrl: activeRestaurant.branding.logoUrl,
    address: activeRestaurant.address || 'Mumbai, Maharashtra, India',
    phone: activeRestaurant.phone || '+91 99999 00000',
    gstin: '27AABCR8765Q1Z2',
    fssai: '11521018000999',
    website: `https://ensemble-restaurant.vercel.app/${activeRestaurant.slug}`,
    socialHandle: activeRestaurant.socials?.instagram || `@${activeRestaurant.slug}`,
    footerMessage: 'Thank you for dining with us! Scan the QR to earn rewards or leave a review.',
    thankYouMessage: 'We look forward to welcoming you back.',
    termsAndConditions: 'Discretionary service charge is voluntary and may be removed upon request.',
    templateStyle: 'standard',
    charges: [
      { id: 'chg_gst', name: 'GST (CGST 2.5% + SGST 2.5%)', type: 'percentage', value: 5, active: true, order: 1 },
      { id: 'chg_srv', name: 'Discretionary Service Charge', type: 'percentage', value: 5, active: true, order: 2 },
      { id: 'chg_pkg', name: 'Packaging / Hygiene Fee', type: 'fixed', value: 20, active: false, order: 3 },
    ],
    showLogo: true,
    showGstin: true,
    showAddress: true,
    showPhone: true,
    showTableNumber: true,
    showCustomerName: true,
    showPaymentMethod: true,
    showTaxBreakdown: true,
    showDiscountBreakdown: true,
    showFooterMessage: true,
  };

  const updateBillConfiguration = (config: BillConfiguration) => {
    setBillConfigsMap((prev) => ({
      ...prev,
      [config.restaurantId]: config,
    }));
  };

  // Active table session
  const currentTableSession =
    (tableSessions[activeRestaurantId] || []).find(
      (s) => s.tableNumber === activeTable && s.status !== 'closed' && s.status !== 'discarded'
    ) || null;

  // Spin control
  const grantCustomerSpin = () => {
    setCanSpin(true);
    setUnlockedExtraSpins((prev) => prev + 1);
  };

  const consumeCustomerSpin = () => {
    if (unlockedExtraSpins > 0) {
      setUnlockedExtraSpins((prev) => prev - 1);
    } else {
      setCanSpin(false);
    }
  };

  // Section 5: Customer Registration (No OTP, returning recognition, 10-digit normalization)
  const registerCustomerSession = (name: string, phone: string, tableNumber: number) => {
    const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
    const userClean = cleanDigits(phone);
    const existing = activeCustomers.find((c) => cleanDigits(c.phone) === userClean);
    const isReturning = !!existing;

    // Check if table already has an active session
    const existingSession = (tableSessions[activeRestaurantId] || []).find(
      (s) => s.tableNumber === tableNumber && (s.status === 'active' || s.status === 'bill_requested')
    );

    const isPlaceholder = !existingSession || !existingSession.hostPhone || existingSession.hostName === 'Table Guest';
    let isHost = true;
    let finalMembers: SessionMember[] = [];
    const sessionId = existingSession?.id || `sess_${Date.now()}`;

    if (!isPlaceholder && existingSession) {
      const hostClean = cleanDigits(existingSession.hostPhone);
      const matchesHostPhone = hostClean.length > 0 && userClean.length > 0 && hostClean === userClean;
      const wasAlreadyHost = customerSession?.isHost === true && customerSession.tableNumber === tableNumber;
      isHost = matchesHostPhone || wasAlreadyHost;

      if (!existingSession.members.some((m) => cleanDigits(m.phone) === userClean)) {
        const newMember: SessionMember = {
          id: `mem_${Date.now()}`,
          name,
          phone,
          isHost,
          joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        finalMembers = [...existingSession.members, newMember];
        setTableSessions((prev) => ({
          ...prev,
          [activeRestaurantId]: (prev[activeRestaurantId] || []).map((s) =>
            s.id === existingSession.id ? { ...s, members: finalMembers } : s
          ),
        }));
      } else {
        finalMembers = existingSession.members;
      }
    } else {
      isHost = true;
      const hostMember: SessionMember = {
        id: `mem_${Date.now()}`,
        name,
        phone,
        isHost: true,
        joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      finalMembers = [hostMember];

      if (existingSession) {
        setTableSessions((prev) => ({
          ...prev,
          [activeRestaurantId]: (prev[activeRestaurantId] || []).map((s) =>
            s.id === existingSession.id ? { ...s, hostName: name, hostPhone: phone, members: finalMembers, status: 'active' } : s
          ),
        }));
      } else {
        const newSession: TableSession = {
          id: sessionId,
          restaurantId: activeRestaurantId,
          tableNumber,
          hostName: name,
          hostPhone: phone,
          members: finalMembers,
          geofenceVerified: true,
          geofenceOverridden: false,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        setTableSessions((prev) => ({
          ...prev,
          [activeRestaurantId]: [newSession, ...(prev[activeRestaurantId] || [])],
        }));
      }

      // Mark physical table as occupied
      setTablesMap((prev) => ({
        ...prev,
        [activeRestaurantId]: (prev[activeRestaurantId] || []).map((t) =>
          t.tableNumber === tableNumber ? { ...t, status: 'occupied', totalScans: (t.totalScans || 0) + 1, lastScanned: 'Just now' } : t
        ),
      }));
    }

    const sessionObj = {
      name,
      phone,
      isHost,
      tableNumber,
    };
    setCustomerSession(sessionObj);
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_SESSION, JSON.stringify(sessionObj));

    // Real-Time Broadcast for cross-device mobile-to-laptop synchronization
    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'SESSION_CREATED', activeRestaurantId, {
        hostName: isHost ? name : (existingSession?.hostName || name),
        hostPhone: isHost ? phone : (existingSession?.hostPhone || phone),
        members: finalMembers,
        sessionId,
        status: 'active',
      }, tableNumber);
    }

    return { isReturning, isHost };
  };

  const logoutCustomerSession = () => {
    setCustomerSession(null);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_SESSION);
  };

  // Section 5: Geofencing Overrides
  const requestGeofenceOverride = (tableNumber: number) => {
    setGeofenceStatus('requested_override');
    const newCall: CaptainCall = {
      id: `geo_req_${Date.now()}`,
      restaurantId: activeRestaurantId,
      tableNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setCaptainCalls((prev) => [newCall, ...prev]);
  };

  const captainApproveGeofence = (tableNumber: number) => {
    setGeofenceStatus('overridden');
    setTableSessions((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((s) =>
        s.tableNumber === tableNumber ? { ...s, geofenceOverridden: true, geofenceVerified: true } : s
      ),
    }));
  };

  // Section 5: Multi-person Host Reassignment
  const joinTableSession = (tableNumber: number, name: string, phone: string) => {
    registerCustomerSession(name, phone, tableNumber);
  };

  const reassignSessionHost = (tableNumber: number, newHostName: string, newHostPhone: string) => {
    setTableSessions((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((s) => {
        if (s.tableNumber === tableNumber && (s.status === 'active' || s.status === 'bill_requested')) {
          const updatedMembers: SessionMember[] = s.members.map((m) => ({
            ...m,
            isHost: m.phone === newHostPhone,
          }));
          if (!updatedMembers.some((m) => m.phone === newHostPhone)) {
            updatedMembers.push({
              id: `mem_${Date.now()}`,
              name: newHostName,
              phone: newHostPhone,
              isHost: true,
              joinedAt: 'Reassigned',
            });
          }
          return {
            ...s,
            hostName: newHostName,
            hostPhone: newHostPhone,
            members: updatedMembers,
          };
        }
        return s;
      }),
    }));

    if (customerSession && customerSession.tableNumber === tableNumber) {
      setCustomerSession((prev) =>
        prev ? { ...prev, isHost: prev.phone === newHostPhone } : null
      );
    }
  };

  const assignManualTable = (tableNumber: number, guestName: string, guestPhone: string, guestCount: number) => {
    const finalName = guestName.trim() || `Walk-in Guest (Table ${tableNumber})`;
    const finalPhone = guestPhone.trim() || 'Offline Walk-in';
    const sessionId = `sess_manual_${tableNumber}_${Date.now()}`;
    const newMember: SessionMember = {
      id: `mem_${Date.now()}`,
      name: finalName,
      phone: finalPhone,
      isHost: true,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newSession: TableSession = {
      id: sessionId,
      restaurantId: activeRestaurantId,
      tableNumber,
      hostName: finalName,
      hostPhone: finalPhone,
      members: [newMember],
      geofenceVerified: true,
      geofenceOverridden: true,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setTableSessions((prev) => ({
      ...prev,
      [activeRestaurantId]: [newSession, ...(prev[activeRestaurantId] || []).filter((s) => s.tableNumber !== tableNumber || s.status === 'closed')],
    }));

    setTablesMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((t) =>
        t.tableNumber === tableNumber ? { ...t, status: 'occupied', totalScans: (t.totalScans || 0) + 1, lastScanned: 'Walk-in Assigned' } : t
      ),
    }));

    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'SESSION_CREATED', activeRestaurantId, {
        hostName: finalName,
        hostPhone: finalPhone,
        members: [newMember],
        sessionId,
        status: 'active',
        guestCount,
      }, tableNumber);
    }
  };

  // Section 10: Call Captain (60s Cooldown)
  const callCaptain = (tableNumber: number) => {
    const now = Date.now();
    if (now - lastCallTimestamp < 60000) {
      const rem = Math.ceil((60000 - (now - lastCallTimestamp)) / 1000);
      return { success: false, message: `Please wait ${rem}s before calling again.` };
    }

    setLastCallTimestamp(now);
    setCallCooldownRemaining(60);

    const newCall: CaptainCall = {
      id: `call_${Date.now()}`,
      restaurantId: activeRestaurantId,
      tableNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setCaptainCalls((prev) => [newCall, ...prev]);

    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'CALL_CAPTAIN', activeRestaurantId, { call: newCall }, tableNumber);
    }

    return { success: true, message: 'All captains are busy, someone will attend you shortly.' };
  };

  const acknowledgeCaptainCall = (callId: string) => {
    setCaptainCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: 'acknowledged', acknowledgedAt: new Date().toISOString() } : c))
    );
  };

  // Helper to record diner visit and table revenue ONLY when an order is actually placed
  const updateOrderHistoryAndCustomer = (
    tableNumber: number,
    orderTotal: number,
    itemNames: string[],
    explicitName?: string,
    explicitPhone?: string
  ) => {
    const todayDate = new Date().toISOString().split('T')[0];

    // 1. Update Table History (orders count, revenue, and active visits)
    setTableHistoryMap((prev) => {
      const list = prev[activeRestaurantId] || [];
      const existingDayIndex = list.findIndex(
        (d) => d.date === todayDate && d.tableNumber === tableNumber
      );
      if (existingDayIndex >= 0) {
        const copy = [...list];
        copy[existingDayIndex] = {
          ...copy[existingDayIndex],
          orders: (copy[existingDayIndex].orders || 0) + 1,
          revenue: (copy[existingDayIndex].revenue || 0) + orderTotal,
          visits: Math.max(1, copy[existingDayIndex].visits || 1),
        };
        return { ...prev, [activeRestaurantId]: copy };
      } else {
        const newDay: TableDayHistory = {
          date: todayDate,
          displayDate: 'Today',
          tableNumber,
          restaurantId: activeRestaurantId,
          qrScans: 1,
          uniqueVisitors: 1,
          totalPeople: 1,
          visits: 1,
          newCustomers: 1,
          returningCustomers: 0,
          orders: 1,
          revenue: orderTotal,
          averageSpend: orderTotal,
          reviews: 0,
          spins: 0,
          couponsRedeemed: 0,
          discountGiven: 0,
          captainCalls: 0,
          billRequests: 0,
          sessions: [],
        };
        return { ...prev, [activeRestaurantId]: [newDay, ...list] };
      }
    });

    // 2. Update Customers Map (Only when order is placed!)
    const targetSession = (tableSessions[activeRestaurantId] || []).find(
      (s) => s.tableNumber === tableNumber && (s.status === 'active' || s.status === 'bill_requested')
    );
    const guestName = explicitName || customerSession?.name || targetSession?.hostName || `Guest (Table ${tableNumber})`;
    const guestPhone = explicitPhone || customerSession?.phone || targetSession?.hostPhone || '';

    if (guestPhone && guestPhone !== 'Staff Added') {
      setCustomersMap((prev) => {
        const list = prev[activeRestaurantId] || [];
        const cleanDigits = (p: string) => (p || '').replace(/\D/g, '').slice(-10);
        const userClean = cleanDigits(guestPhone);
        const existingIdx = list.findIndex((c) => cleanDigits(c.phone) === userClean);
        if (existingIdx >= 0) {
          const copy = [...list];
          const newVisits = (copy[existingIdx].visits || 1) + 1;
          const newTotalSpend = (copy[existingIdx].totalSpend || 0) + orderTotal;
          copy[existingIdx] = {
            ...copy[existingIdx],
            name: guestName && !guestName.startsWith('Guest') ? guestName : copy[existingIdx].name,
            totalSpend: newTotalSpend,
            lastVisit: 'Today',
            visits: newVisits,
            averageBill: Math.round(newTotalSpend / newVisits),
          };
          return { ...prev, [activeRestaurantId]: copy };
        } else {
          const newCust: Customer = {
            id: `cust_${Date.now()}`,
            restaurantId: activeRestaurantId,
            name: guestName,
            phone: guestPhone,
            totalSpend: orderTotal,
            visits: 1,
            averageBill: orderTotal,
            reviewsCount: 0,
            rewardsRedeemed: 0,
            favoriteDishes: itemNames.slice(0, 2),
            engagement: {
              instagram: false,
              whatsapp: true,
            },
            tags: [`Table ${tableNumber}`],
            lastVisit: 'Today',
          };
          return { ...prev, [activeRestaurantId]: [newCust, ...list] };
        }
      });
    }
  };

  // Section 6 & 7 & 9: Ordering & Tab Management
  const placeCustomerOrder = (
    tableNumber: number,
    items: { menuItemId: string; name: string; price: number; quantity: number }[]
  ) => {
    const orderItems: OrderItemEntry[] = items.map((it) => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: it.menuItemId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      source: 'customer',
      status: 'preparing',
    }));

    const newOrder: CaptainOrder = {
      id: `ord_${Date.now()}`,
      restaurantId: activeRestaurantId,
      tabId: `tab_table_${tableNumber}`,
      tableNumber,
      orderedByName: customerSession?.name || 'Table Guest',
      orderedByPhone: customerSession?.phone || 'Guest',
      items: orderItems,
      status: 'received',
      createdAt: new Date().toISOString(),
      source: 'customer',
    };

    setOrders((prev) => [newOrder, ...prev]);

    const orderTotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    updateOrderHistoryAndCustomer(tableNumber, orderTotal, items.map((i) => i.name));

    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'ORDER_PLACED', activeRestaurantId, { order: newOrder }, tableNumber);
    }
  };

  const captainAddOrder = (
    tableNumber: number,
    items: { menuItemId: string; name: string; price: number; quantity: number }[]
  ) => {
    // If table has no active session, auto-assign table
    const existingSession = (tableSessions[activeRestaurantId] || []).find(
      (s) => s.tableNumber === tableNumber && (s.status === 'active' || s.status === 'bill_requested')
    );
    if (!existingSession) {
      assignManualTable(tableNumber, `Guest (Table ${tableNumber})`, 'Staff Added', 2);
    }

    const orderItems: OrderItemEntry[] = items.map((it) => ({
      id: `item_cpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: it.menuItemId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      source: 'captain', // Clearly marked Captain Added
      status: 'preparing',
    }));

    const newOrder: CaptainOrder = {
      id: `ord_cpt_${Date.now()}`,
      restaurantId: activeRestaurantId,
      tabId: `tab_table_${tableNumber}`,
      tableNumber,
      orderedByName: 'Captain (Direct Oral Order)',
      orderedByPhone: 'Staff Added',
      items: orderItems,
      status: 'confirmed',
      estimatedPrepMinutes: 15,
      prepStartedAt: new Date().toISOString(),
      prepExpiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
      createdAt: new Date().toISOString(),
      source: 'captain',
    };

    setOrders((prev) => [newOrder, ...prev]);

    const orderTotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    updateOrderHistoryAndCustomer(tableNumber, orderTotal, items.map((i) => i.name), 'Captain Order', 'Staff Added');

    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'ORDER_PLACED', activeRestaurantId, { order: newOrder }, tableNumber);
    }
  };

  const confirmOrder = (orderId: string, prepMinutes: 10 | 20 | 30) => {
    const now = Date.now();
    let orderTable = activeTable;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          orderTable = o.tableNumber;
          return {
            ...o,
            status: 'preparing',
            estimatedPrepMinutes: prepMinutes,
            prepStartedAt: new Date(now).toISOString(),
            prepExpiresAt: new Date(now + prepMinutes * 60000).toISOString(),
          };
        }
        return o;
      })
    );
    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'ORDER_CONFIRMED', activeRestaurantId, { orderId, prepMinutes }, orderTable);
    }
  };

  const deliverOrder = (orderId: string) => {
    let orderTable = activeTable;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          orderTable = o.tableNumber;
          return {
            ...o,
            status: 'delivered' as const,
            items: o.items.map((it) => ({ ...it, status: 'delivered' as const, deliveredAt: new Date().toISOString() })),
          };
        }
        return o;
      })
    );
    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'ORDER_DELIVERED', activeRestaurantId, { orderId, status: 'delivered' }, orderTable);
    }
  };

  const deliverOrderItem = (orderId: string, itemId: string) => {
    let orderTable = activeTable;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          orderTable = o.tableNumber;
          const updatedItems = o.items.map((it) =>
            it.id === itemId ? { ...it, status: 'delivered' as const, deliveredAt: new Date().toISOString() } : it
          );
          const allDelivered = updatedItems.every((it) => it.status === 'delivered');
          return {
            ...o,
            status: allDelivered ? ('delivered' as const) : o.status,
            items: updatedItems,
          };
        }
        return o;
      })
    );
    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'ORDER_DELIVERED', activeRestaurantId, { orderId, itemId, status: 'delivered' }, orderTable);
    }
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
  };

  const removeOrderItem = (orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.filter((it) => it.id !== itemId);
          return { ...o, items: updatedItems };
        }
        return o;
      })
    );
  };

  const askForBill = (tableNumber: number) => {
    setTablesMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((t) =>
        t.tableNumber === tableNumber ? { ...t, status: 'bill_requested' } : t
      ),
    }));
    setTableSessions((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((s) =>
        s.tableNumber === tableNumber && s.status === 'active' ? { ...s, status: 'bill_requested' } : s
      ),
    }));

    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'BILL_REQUESTED', activeRestaurantId, {}, tableNumber);
    }
  };

  const closeTableTab = (tableNumber: number, paymentMethod: 'cash' | 'online') => {
    setTablesMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((t) =>
        t.tableNumber === tableNumber ? { ...t, status: 'paid_pending_reset' } : t
      ),
    }));
    setTableSessions((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((s) =>
        s.tableNumber === tableNumber ? { ...s, status: 'paid_pending_reset', paymentMethod, closedAt: new Date().toISOString() } : s
      ),
    }));
  };

  const resetTable = (tableNumber: number) => {
    setTablesMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((t) =>
        t.tableNumber === tableNumber ? { ...t, status: 'available' } : t
      ),
    }));
    setTableSessions((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((s) =>
        s.tableNumber === tableNumber && s.status !== 'closed' ? { ...s, status: 'closed', closedAt: new Date().toISOString() } : s
      ),
    }));
    setOrders((prev) =>
      prev.filter(
        (o) =>
          !(
            o.tableNumber === tableNumber &&
            (o.restaurantId ? o.restaurantId === activeRestaurantId : true)
          )
      )
    );
    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'CLEAR_TABLE', activeRestaurantId, {}, tableNumber);
    }
  };

  const forceCloseSession = (tableNumber: number) => {
    resetTable(tableNumber);
  };

  const recordTableScan = (restaurantId: string, tableNumber: number, explicitSlug?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayDate = now.toISOString().split('T')[0];

    const targetRest = restaurants.find((r) => r.id === restaurantId || (explicitSlug && r.slug.toLowerCase() === explicitSlug.toLowerCase())) || activeRestaurant;
    const effectiveSlug = explicitSlug || targetRest?.slug || activeRestaurantSlug;
    const effectiveRestId = targetRest?.id || restaurantId;

    // 1. Update Table Record: mark table as occupied, increment scan count
    setTablesMap((prev) => {
      let list = prev[effectiveRestId];
      if (!list || list.length === 0) {
        const count = targetRest?.tablesCount || 20;
        const origin = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
          ? window.location.origin.replace(/\/$/, '')
          : 'https://ensemble-restaurant.vercel.app';
        list = Array.from({ length: count }, (_, i) => ({
          tableNumber: i + 1,
          restaurantId: effectiveRestId,
          qrUrl: `${origin}/${effectiveSlug}/t/${i + 1}`,
          status: 'available',
          totalScans: 0,
          lastScanned: 'Never',
        }));
      }
      const updated = list.map((t) => {
        if (t.tableNumber === tableNumber) {
          return {
            ...t,
            status: 'occupied' as const,
            totalScans: (t.totalScans || 0) + 1,
            lastScanned: `Today, ${timeStr}`,
          };
        }
        return t;
      });
      return { ...prev, [effectiveRestId]: updated };
    });

    // 2. Ensure an active session exists
    setTableSessions((prev) => {
      const list = prev[effectiveRestId] || [];
      const existing = list.find((s) => s.tableNumber === tableNumber && (s.status === 'active' || s.status === 'bill_requested'));
      if (existing) return prev;

      const newSession: TableSession = {
        id: `sess_${effectiveRestId}_t${tableNumber}_${Date.now()}`,
        restaurantId: effectiveRestId,
        tableNumber,
        hostName: 'Table Guest',
        hostPhone: '',
        members: [],
        geofenceVerified: true,
        geofenceOverridden: false,
        status: 'active',
        createdAt: now.toISOString(),
      };
      return { ...prev, [effectiveRestId]: [newSession, ...list] };
    });

    // 3. Real-Time Broadcast across network to Captain View
    if (effectiveSlug) {
      realtimeHub.publish(effectiveSlug, 'TABLE_SCAN', effectiveRestId, {
        tableNumber,
        scannedAt: timeStr,
      }, tableNumber);
    }

    // 3. Update scan count in TableDayHistory
    setTableHistoryMap((prev) => {
      const list = prev[restaurantId] || [];
      const existingDayIndex = list.findIndex(
        (d) => d.date === todayDate && d.tableNumber === tableNumber
      );
      if (existingDayIndex >= 0) {
        const copy = [...list];
        copy[existingDayIndex] = {
          ...copy[existingDayIndex],
          qrScans: copy[existingDayIndex].qrScans + 1,
        };
        return { ...prev, [restaurantId]: copy };
      } else {
        const newDay: TableDayHistory = {
          date: todayDate,
          displayDate: 'Today',
          tableNumber,
          restaurantId,
          qrScans: 1,
          uniqueVisitors: 1,
          totalPeople: 1,
          visits: 0,
          newCustomers: 1,
          returningCustomers: 0,
          orders: 0,
          revenue: 0,
          averageSpend: 0,
          reviews: 0,
          spins: 0,
          couponsRedeemed: 0,
          discountGiven: 0,
          captainCalls: 0,
          billRequests: 0,
          sessions: [],
        };
        return { ...prev, [restaurantId]: [newDay, ...list] };
      }
    });
  };

  const clearTable = (tableNumber: number, captainId: string = 'cpt_staff', captainName: string = 'Captain') => {
    const now = new Date();
    const timestamp = now.toISOString();
    const todayDate = timestamp.split('T')[0];

    // Find current session and orders for this table in active restaurant
    const currentSess = (tableSessions[activeRestaurantId] || []).find(
      (s) => s.tableNumber === tableNumber && s.status !== 'closed' && s.status !== 'discarded'
    );
    const tableOrders = orders.filter(
      (o) => o.restaurantId === activeRestaurantId && o.tableNumber === tableNumber && o.status !== 'cancelled' && (o.status as string) !== 'archived'
    );
    const tableCalls = captainCalls.filter(
      (c) => c.restaurantId === activeRestaurantId && c.tableNumber === tableNumber
    );

    // Compute financial totals
    const grossAmount = tableOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.price * item.quantity, 0),
      0
    );
    const config = activeBillConfig;
    const gstCharge = config.charges.find((c) => c.name.toLowerCase().includes('gst') && c.active)?.value || 5;
    const serviceCharge = config.charges.find((c) => c.name.toLowerCase().includes('service') && c.active)?.value || 0;
    const netAmount = Math.round(grossAmount * (1 + (gstCharge + serviceCharge) / 100));

    const sessionStart = currentSess?.createdAt || timestamp;

    // 1. Create audit log
    const auditLog: ClearTableAuditLog = {
      id: `audit_clr_${Date.now()}`,
      restaurantId: activeRestaurantId,
      tableNumber,
      captainId: captainId || 'cpt_staff',
      captainName: captainName || 'Captain',
      timestamp,
      reason: 'manual_clear',
      activeSessionId: currentSess?.id,
    };
    setClearTableAudits((prev) => [auditLog, ...prev]);

    // 2. Create historical TableSessionLog & update TableDayHistory if there were orders/session
    if (tableOrders.length > 0 || currentSess) {
      const sessionLog: TableSessionLog = {
        id: `sess_log_${Date.now()}`,
        sessionId: currentSess?.id || `sess_hist_${Date.now()}`,
        tableNumber,
        restaurantId: activeRestaurantId,
        date: todayDate,
        displayDate: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        startTime: sessionStart,
        endTime: timestamp,
        hostName: currentSess?.hostName || 'Table Guest',
        hostPhone: currentSess?.hostPhone || '',
        guestCount: currentSess?.members?.length || 1,
        ordersCount: tableOrders.length,
        totalSpend: grossAmount,
        status: 'cleared',
        paymentMethod: 'none',
        dishesOrdered: tableOrders.flatMap((o) =>
          o.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            price: it.price,
          }))
        ),
        captainCallsCount: tableCalls.length,
        billRequested: true,
        reviewed: false,
        spunWheel: false,
        clearedByCaptain: captainName || 'Captain',
      };

      setTableHistoryMap((prev) => {
        const list = prev[activeRestaurantId] || [];
        const existingDayIndex = list.findIndex(
          (d) => d.date === todayDate && d.tableNumber === tableNumber
        );

        if (existingDayIndex >= 0) {
          const day = list[existingDayIndex];
          const updatedDay: TableDayHistory = {
            ...day,
            visits: day.visits + 1,
            totalPeople: day.totalPeople + (currentSess?.members?.length || 1),
            orders: day.orders + tableOrders.length,
            revenue: day.revenue + grossAmount,
            averageSpend: Math.round((day.revenue + grossAmount) / (day.visits + 1)),
            captainCalls: day.captainCalls + tableCalls.length,
            sessions: [sessionLog, ...day.sessions],
          };
          const copy = [...list];
          copy[existingDayIndex] = updatedDay;
          return { ...prev, [activeRestaurantId]: copy };
        } else {
          const newDay: TableDayHistory = {
            date: todayDate,
            displayDate: 'Today',
            tableNumber,
            restaurantId: activeRestaurantId,
            qrScans: 1,
            uniqueVisitors: 1,
            totalPeople: currentSess?.members?.length || 1,
            visits: 1,
            newCustomers: 1,
            returningCustomers: 0,
            orders: tableOrders.length,
            revenue: grossAmount,
            averageSpend: grossAmount,
            reviews: 0,
            spins: 0,
            couponsRedeemed: 0,
            discountGiven: 0,
            captainCalls: tableCalls.length,
            billRequests: 1,
            sessions: [sessionLog],
          };
          return { ...prev, [activeRestaurantId]: [newDay, ...list] };
        }
      });
    }

    // 3. Archive orders for this table so they don't leak into live active views
    setOrders((prev) =>
      prev.map((o) =>
        o.restaurantId === activeRestaurantId && o.tableNumber === tableNumber && (o.status as string) !== 'archived'
          ? { ...o, status: 'archived' as any }
          : o
      )
    );

    // 4. Close table sessions for this table
    setTableSessions((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((s) =>
        s.tableNumber === tableNumber && s.status !== 'closed'
          ? { ...s, status: 'closed' }
          : s
      ),
    }));

    // 5. Clear pending calls for this table
    setCaptainCalls((prev) =>
      prev.filter((c) => !(c.restaurantId === activeRestaurantId && c.tableNumber === tableNumber && c.status === 'pending'))
    );

    // 6. Reset physical table status to 'available' (PHYSICAL TABLE IS NEVER DELETED!)
    setTablesMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((t) =>
        t.tableNumber === tableNumber ? { ...t, status: 'available' } : t
      ),
    }));

    // 7. Real-Time Broadcast across network
    if (activeRestaurant?.slug) {
      realtimeHub.publish(activeRestaurant.slug, 'CLEAR_TABLE', activeRestaurantId, {
        captainId,
        captainName,
      }, tableNumber);
    }

    return { success: true, message: `Table ${tableNumber} has been successfully cleared and reset to available.` };
  };

  // Section 13: 1-Active-Coupon Rule & Next-Visit Rewards Engine
  const addUnifiedCoupon = (
    couponData: Omit<UnifiedCoupon, 'id' | 'createdAt' | 'status'>
  ): { status: 'held' | 'queued' | 'limit_reached'; coupon?: UnifiedCoupon } => {
    const userPhone = couponData.customerPhone || customerSession?.phone || 'Guest';
    const existingHeld = unifiedCoupons.filter(
      (c) =>
        c.customerPhone === userPhone &&
        c.restaurantId === activeRestaurantId &&
        c.status === 'held'
    );

    // Business Rule: Diners can only have ONE active coupon at a time.
    // Any newly earned reward automatically becomes a NEXT-VISIT reward (queued).
    const hasActive = existingHeld.some((c) => c.slot === 'active');
    const slot: 'active' | 'queued' = hasActive ? 'queued' : 'active';
    const expiresAt = slot === 'active'
      ? new Date(Date.now() + 20 * 86400000).toISOString() // 20-day clock on activation
      : 'Valid for 20 days once activated on your next visit';

    const newCoupon: UnifiedCoupon = {
      ...couponData,
      id: `coup_${Date.now()}`,
      slot,
      status: 'held',
      createdAt: new Date().toISOString(),
      activatedAt: slot === 'active' ? new Date().toISOString() : undefined,
      expiresAt,
    };

    setUnifiedCoupons((prev) => [newCoupon, ...prev]);

    // Also add to legacy wallet for backward compatibility
    addCustomerReward({
      restaurantId: couponData.restaurantId,
      code: couponData.voucherCode,
      rewardLabel: couponData.rewardLabel,
      discountType: couponData.discountType,
      discountValue: couponData.discountValue,
      status: 'active',
      expiresAt: '20 Days',
      tableNumber: couponData.tableNumber || activeTable,
    });

    return { status: slot === 'active' ? 'held' : 'queued', coupon: newCoupon };
  };

  const deleteCoupon = (id: string) => {
    setUnifiedCoupons((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      const hasActive = remaining.some((c) => c.slot === 'active' && c.status === 'held');
      if (!hasActive) {
        const queuedIdx = remaining.findIndex((c) => c.slot === 'queued' && c.status === 'held');
        if (queuedIdx !== -1) {
          remaining[queuedIdx] = {
            ...remaining[queuedIdx],
            slot: 'active',
            activatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
          };
        }
      }
      return remaining;
    });
  };

  const activateQueuedCoupon = (id: string) => {
    setUnifiedCoupons((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              slot: 'active',
              activatedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
            }
          : c
      )
    );
  };

  const redeemCoupon = (id: string) => {
    setUnifiedCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'redeemed' } : c))
    );
  };

  // Section 8a: Master Admin Bill Upload
  const uploadBillToMaster = (data: {
    tableNumber: number;
    customerName: string;
    customerPhone: string;
    billPhotoUrl: string;
    reportedAppTotal: number;
  }) => {
    const rand = Math.random();
    let wonDiscount: { label: string; value: number; code: string } | null = null;

    if (rand < 0.6) {
      const value = rand < 0.3 ? 20 : 15;
      const code = `AUDIT-${Math.random().toString(36).substring(2, 7).toUpperCase()}${value}`;
      wonDiscount = {
        label: `${value}% OFF Next Dining Experience`,
        value,
        code,
      };

      addUnifiedCoupon({
        restaurantId: activeRestaurantId,
        customerPhone: data.customerPhone,
        voucherCode: code,
        rewardLabel: wonDiscount.label,
        discountType: 'percentage',
        discountValue: value,
        slot: 'active',
        source: 'bill_upload',
        expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(),
        tableNumber: data.tableNumber,
      });
    }

    const newUpload: MasterBillUpload = {
      id: `bill_${Date.now()}`,
      restaurantId: activeRestaurantId,
      restaurantName: activeRestaurant.name,
      tableNumber: data.tableNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      billPhotoUrl: data.billPhotoUrl,
      reportedAppTotal: data.reportedAppTotal,
      auditedStatus: 'pending',
      bonusScratchWon: wonDiscount || undefined,
      uploadedAt: 'Just now',
    };

    setMasterBillUploads((prev) => [newUpload, ...prev]);
    return { wonDiscount };
  };

  const updateBillAuditStatus = (id: string, status: 'verified' | 'discrepancy_flagged') => {
    setMasterBillUploads((prev) =>
      prev.map((b) => (b.id === id ? { ...b, auditedStatus: status } : b))
    );
  };

  const addCustomerReward = (reward: Omit<CustomerReward, 'id' | 'createdAt'>): CustomerReward => {
    const newCustReward: CustomerReward = {
      ...reward,
      id: `rew_cust_${Date.now()}`,
      createdAt: 'Just now',
    };
    setCustomerWallet((prev) => [newCustReward, ...prev]);
    return newCustReward;
  };

  const redeemReward = (id: string) => {
    setCustomerWallet((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'redeemed' } : r))
    );
  };

  // Restaurant Admin actions
  const addRestaurant = (newRest: Partial<Restaurant>): Restaurant => {
    const slug = (newRest.slug || newRest.name || 'restaurant')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const id = newRest.id || `rest_${slug}`;

    const fullRest: Restaurant = {
      id,
      slug,
      name: newRest.name || 'New Restaurant',
      brandTitle: newRest.brandTitle || `${newRest.name || 'Restaurant'} • Fine Dining`,
      tagline: newRest.tagline || 'Exquisite Flavours, Memorable Moments.',
      description: newRest.description || 'Welcome to our restaurant.',
      cuisine: newRest.cuisine || 'Multi-Cuisine',
      address: newRest.address || 'Mumbai, India',
      city: newRest.city || 'Mumbai',
      latitude: 19.2312,
      longitude: 72.9864,
      geofenceRadiusMeters: 150,
      phone: newRest.phone || '+91 99999 00000',
      email: newRest.email || `contact@${slug}.com`,
      website: newRest.website || `https://ensemble-restaurant.vercel.app/${slug}`,
      googleReviewUrl: newRest.googleReviewUrl || `https://g.page/r/${slug}/review`,
      status: 'active',
      plan: newRest.plan || 'Growth',
      planFeatures: newRest.planFeatures || {
        captainModule: true,
        ordering: true,
        socialRewards: true,
        spinRewards: true,
        billUpload: true,
        customBranding: true,
        analytics: true,
        reviews: true,
      },
      chargesConfig: newRest.chargesConfig || {
        gstPercent: 5,
        serviceChargePercent: 5,
        packagingFee: 30,
      },
      expiryDate: newRest.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      mrr: newRest.plan === 'Enterprise' ? 14999 : 7999,
      createdAt: new Date().toISOString().split('T')[0],
      branding: {
        primaryColor: newRest.branding?.primaryColor || '#162c21',
        secondaryColor: newRest.branding?.secondaryColor || '#c5a96d',
        accentColor: newRest.branding?.accentColor || '#fbf9f5',
        surfaceColor: '#ffffff',
        textColor: '#1c1c1c',
        fontFamily: newRest.branding?.fontFamily || 'Plus Jakarta Sans, sans-serif',
        logoUrl: newRest.branding?.logoUrl || INITIAL_RESTAURANTS[0].branding.logoUrl,
        heroImageUrl:
          newRest.branding?.heroImageUrl ||
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85',
        coverImageUrl:
          newRest.branding?.coverImageUrl ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=85',
      },
      socials: {
        instagram: newRest.socials?.instagram || `@${slug}`,
        facebook: newRest.socials?.facebook || `${slug}`,
        whatsapp: newRest.socials?.whatsapp || '+919999900000',
        tiktok: newRest.socials?.tiktok || `@${slug}`,
        youtube: newRest.socials?.youtube || `@${slug}`,
      },
      hashtags: newRest.hashtags || [`#${newRest.name || 'Restaurant'}`, '#EnsembleDining'],
      tablesCount: newRest.tablesCount || 20,
    };

    setRestaurants((prev) => [fullRest, ...prev]);

    const origin = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
      ? window.location.origin.replace(/\/$/, '')
      : 'https://ensemble-restaurant.vercel.app';

    const newTables: TableRecord[] = Array.from({ length: fullRest.tablesCount }, (_, i) => ({
      tableNumber: i + 1,
      restaurantId: id,
      qrUrl: `${origin}/${slug}/t/${i + 1}`,
      status: 'available',
      totalScans: 0,
      lastScanned: 'Never',
    }));

    setTablesMap((prev) => ({ ...prev, [id]: newTables }));
    const starterDishes: MenuItem[] = (INITIAL_MENU_ITEMS['rest_demo'] || []).map((d) => ({
      ...d,
      id: `dish_${id}_${d.id.replace('dish_', '')}`,
      restaurantId: id,
    }));
    setMenuItemsMap((prev) => ({ ...prev, [id]: starterDishes }));
    setOffersMap((prev) => ({ ...prev, [id]: [] }));
    setCustomersMap((prev) => ({ ...prev, [id]: [] }));
    setReviewsMap((prev) => ({ ...prev, [id]: [] }));
    setSocialSubmissionsMap((prev) => ({ ...prev, [id]: [] }));
    setTableSessions((prev) => ({ ...prev, [id]: [] }));
    setTableHistoryMap((prev) => ({ ...prev, [id]: [] }));
    setBillConfigsMap((prev) => ({
      ...prev,
      [id]: {
        restaurantId: id,
        restaurantName: fullRest.name,
        logoUrl: fullRest.branding.logoUrl,
        address: fullRest.address,
        phone: fullRest.phone,
        gstin: '27AABCR8765Q1Z2',
        fssai: '11521018000999',
        website: `https://ensemble-restaurant.vercel.app/${fullRest.slug}`,
        socialHandle: fullRest.socials.instagram,
        footerMessage: 'Thank you for dining with us! Scan to review or earn rewards.',
        thankYouMessage: 'We look forward to hosting you again soon.',
        termsAndConditions: 'Discretionary service charge is voluntary and may be removed upon request.',
        templateStyle: 'standard',
        charges: [
          { id: 'chg_gst', name: 'GST (CGST 2.5% + SGST 2.5%)', type: 'percentage', value: 5, active: true, order: 1 },
          { id: 'chg_srv', name: 'Discretionary Service Charge', type: 'percentage', value: 5, active: true, order: 2 },
          { id: 'chg_pkg', name: 'Packaging / Hygiene Fee', type: 'fixed', value: 20, active: false, order: 3 },
        ],
        showLogo: true,
        showGstin: true,
        showAddress: true,
        showPhone: true,
        showTableNumber: true,
        showCustomerName: true,
        showPaymentMethod: true,
        showTaxBreakdown: true,
        showDiscountBreakdown: true,
        showFooterMessage: true,
      },
    }));

    // Initialize clean balanced starter rewards summing to exactly 100% probability
    const starterRewards: RewardWheelItem[] = [
      {
        id: `rew_${id}_1`,
        label: '10% OFF',
        discountType: 'percentage',
        discountValue: 10,
        description: '10% welcome discount on dining bill',
        probability: 40,
        color: fullRest.branding.primaryColor,
        textColor: '#ffffff',
        active: true,
        expiryDays: 7,
      },
      {
        id: `rew_${id}_2`,
        label: '15% OFF',
        discountType: 'percentage',
        discountValue: 15,
        description: '15% celebration discount on food & beverages',
        probability: 30,
        color: fullRest.branding.secondaryColor,
        textColor: '#1c1917',
        active: true,
        expiryDays: 7,
      },
      {
        id: `rew_${id}_3`,
        label: '20% OFF',
        discountType: 'percentage',
        discountValue: 20,
        description: '20% luxury discount on your next visit',
        probability: 20,
        color: '#8b733e',
        textColor: '#ffffff',
        active: true,
        expiryDays: 14,
      },
      {
        id: `rew_${id}_4`,
        label: 'Better Luck Next Time',
        discountType: 'no_luck',
        discountValue: 0,
        description: 'Complimentary chef welcome bites on next visit',
        probability: 10,
        color: '#2a3a30',
        textColor: fullRest.branding.secondaryColor,
        active: true,
        expiryDays: 0,
      },
    ];
    setRewardItemsMap((prev) => ({ ...prev, [id]: starterRewards }));

    return fullRest;
  };

  const ensureRestaurantExists = (slug: string): Restaurant => {
    const cleanSlug = slug.toLowerCase().trim();
    const existing = restaurants.find((r) => r.slug.toLowerCase() === cleanSlug);
    if (existing) return existing;

    const formattedName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
    return addRestaurant({
      name: formattedName,
      slug: cleanSlug,
      tablesCount: 20,
    });
  };

  const resolveRestaurant = (slug: string): Restaurant | null => {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().trim();
    if (
      !cleanSlug ||
      ['admin', 'master', 'restaurant', 'captain', 'api', 'auth', 'login', 'preview'].includes(cleanSlug)
    ) {
      return null;
    }

    // 1. Check loaded restaurants in current state
    const existing = restaurants.find((r) => r.slug.toLowerCase() === cleanSlug);
    if (existing) return existing;

    // 2. Check static seed restaurants
    const seed = INITIAL_RESTAURANTS.find((r) => r.slug.toLowerCase() === cleanSlug);
    if (seed) {
      setRestaurants((prev) => {
        if (prev.some((r) => r.slug.toLowerCase() === cleanSlug)) return prev;
        return [seed, ...prev];
      });
      return seed;
    }

    // 3. Fallback: Auto-provision for valid restaurant slug
    if (/^[a-z0-9_-]{2,50}$/.test(cleanSlug)) {
      return ensureRestaurantExists(cleanSlug);
    }

    return null;
  };

  const updateRestaurant = (id: string, updates: Partial<Restaurant>) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, branding: { ...r.branding, ...updates.branding } } : r))
    );
  };

  const toggleRestaurantStatus = (id: string) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'active' ? 'suspended' : 'active';
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  const updateRestaurantPlanFeatures = (id: string, features: any) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, planFeatures: { ...r.planFeatures, ...features } } : r))
    );
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const targetRestId = item.restaurantId || activeRestaurantId;
    const newItem: MenuItem = {
      ...item,
      id: `dish_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: targetRestId,
      isAvailable: item.isAvailable !== false,
      rating: item.rating || 4.8,
    };
    setMenuItemsMap((prev) => {
      const currentList = prev[targetRestId] || [];
      const updated = [newItem, ...currentList];
      const nextMap = { ...prev, [targetRestId]: updated };
      try {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(nextMap));
      } catch (err) {
        console.error('Failed to write menu to localStorage:', err);
      }
      realtimeHub.publish(
        activeRestaurantSlug,
        'MENU_SYNC',
        targetRestId,
        { menuItems: updated }
      );
      return nextMap;
    });
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItemsMap((prev) => {
      const currentList = prev[activeRestaurantId] || [];
      const updated = currentList.map((dish) =>
        dish.id === id ? { ...dish, ...updates } : dish
      );
      const nextMap = { ...prev, [activeRestaurantId]: updated };
      try {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(nextMap));
      } catch (err) {
        console.error('Failed to write menu to localStorage:', err);
      }
      realtimeHub.publish(
        activeRestaurantSlug,
        'MENU_SYNC',
        activeRestaurantId,
        { menuItems: updated }
      );
      return nextMap;
    });
  };

  const deleteMenuItem = (id: string) => {
    setMenuItemsMap((prev) => {
      const currentList = prev[activeRestaurantId] || [];
      const updated = currentList.filter((dish) => dish.id !== id);
      const nextMap = { ...prev, [activeRestaurantId]: updated };
      try {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(nextMap));
      } catch (err) {
        console.error('Failed to write menu to localStorage:', err);
      }
      realtimeHub.publish(
        activeRestaurantSlug,
        'MENU_SYNC',
        activeRestaurantId,
        { menuItems: updated }
      );
      return nextMap;
    });
  };

  const batchImportMenuItems = (items: Omit<MenuItem, 'id'>[], conflictResolution: 'keep' | 'overwrite') => {
    const existing = menuItemsMap[activeRestaurantId] || [];
    let updated = [...existing];
    let count = 0;

    items.forEach((newItem) => {
      const matchIndex = updated.findIndex(
        (e) => e.name.toLowerCase().trim() === newItem.name.toLowerCase().trim()
      );
      if (matchIndex >= 0) {
        if (conflictResolution === 'overwrite') {
          updated[matchIndex] = { ...newItem, id: updated[matchIndex].id, restaurantId: activeRestaurantId };
          count++;
        }
      } else {
        updated.push({
          ...newItem,
          id: `dish_${Date.now()}_${count++}`,
          restaurantId: activeRestaurantId,
          isAvailable: newItem.isAvailable !== false,
          rating: newItem.rating || 4.8,
        });
      }
    });

    const nextMap = { ...menuItemsMap, [activeRestaurantId]: updated };
    setMenuItemsMap(nextMap);
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(nextMap));
    } catch (err) {
      console.error('Failed to write menu to localStorage:', err);
    }
    realtimeHub.publish(
      activeRestaurantSlug,
      'MENU_SYNC',
      activeRestaurantId,
      { menuItems: updated }
    );

    return { importedCount: count };
  };

  const addReview = (review: Omit<Review, 'id' | 'date' | 'verified'>) => {
    const newRev: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      date: 'Just now',
      verified: true,
    };
    setReviewsMap((prev) => ({
      ...prev,
      [activeRestaurantId]: [newRev, ...(prev[activeRestaurantId] || [])],
    }));
    grantCustomerSpin();
  };

  const submitSocialProof = (data: {
    customerName: string;
    customerPhone: string;
    platform: any;
    screenshotUrl: string;
    instagramHandle?: string;
  }) => {
    const newSub: SocialSubmission = {
      id: `soc_${Date.now()}`,
      restaurantId: activeRestaurantId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      platform: data.platform,
      screenshotUrl: data.screenshotUrl,
      instagramHandle: data.instagramHandle,
      hashtags: activeRestaurant.hashtags.join(' '),
      submittedAt: 'Just now',
      status: 'pending',
    };
    setSocialSubmissionsMap((prev) => ({
      ...prev,
      [activeRestaurantId]: [newSub, ...(prev[activeRestaurantId] || [])],
    }));

    grantCustomerSpin();
  };

  const approveSocialSubmission = (id: string) => {
    setSocialSubmissionsMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((sub) =>
        sub.id === id ? { ...sub, status: 'approved' } : sub
      ),
    }));
    grantCustomerSpin();
  };

  const rejectSocialSubmission = (id: string) => {
    setSocialSubmissionsMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((sub) =>
        sub.id === id ? { ...sub, status: 'rejected' } : sub
      ),
    }));
  };

  const addRewardItem = (item: Omit<RewardWheelItem, 'id'>): RewardWheelItem => {
    const newItem: RewardWheelItem = {
      ...item,
      id: `rwd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      active: item.active !== false,
      probability: item.probability || 0,
    };
    const currentList = rewardItemsMap[activeRestaurantId] || [];
    const withNew = [...currentList, newItem];
    const balanced = rebalanceWheelProbabilities(withNew);

    const nextMap = { ...rewardItemsMap, [activeRestaurantId]: balanced };
    setRewardItemsMap(nextMap);
    try {
      localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(nextMap));
    } catch (err) {
      console.error('Failed to write rewards to localStorage:', err);
    }
    realtimeHub.publish(
      activeRestaurantSlug,
      'SPIN_CONFIG_SYNC',
      activeRestaurantId,
      { rewardItems: balanced }
    );
    return newItem;
  };

  const deleteRewardItem = (id: string) => {
    const currentList = rewardItemsMap[activeRestaurantId] || [];
    const filtered = currentList.filter((item) => item.id !== id);
    const balanced = rebalanceWheelProbabilities(filtered);

    const nextMap = { ...rewardItemsMap, [activeRestaurantId]: balanced };
    setRewardItemsMap(nextMap);
    try {
      localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(nextMap));
    } catch (err) {
      console.error('Failed to write rewards to localStorage:', err);
    }
    realtimeHub.publish(
      activeRestaurantSlug,
      'SPIN_CONFIG_SYNC',
      activeRestaurantId,
      { rewardItems: balanced }
    );
  };

  const updateRewardItem = (id: string, updates: Partial<RewardWheelItem>) => {
    setRewardItemsMap((prev) => {
      const currentList = prev[activeRestaurantId] || [];
      const updated = currentList.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      return { ...prev, [activeRestaurantId]: updated };
    });
  };

  const saveRewardConfiguration = (restaurantId: string, items: RewardWheelItem[]): boolean => {
    const targetRestId = restaurantId || activeRestaurantId;
    if (!items || items.length === 0) return false;

    // Validate
    for (const item of items) {
      if (!item.label || item.label.trim() === '') return false;
      if (item.probability < 0 || item.probability > 100 || isNaN(item.probability)) return false;
    }

    const activeList = items.filter((i) => i.active);
    if (activeList.length === 0) return false;

    const total = activeList.reduce((sum, i) => sum + i.probability, 0);
    // Strict tolerance: within 0.5%
    if (Math.abs(total - 100) > 0.5) {
      return false;
    }

    // Normalize so last active item guarantees exact 100.0 sum
    let activeSum = 0;
    const finalItems = items.map((item, idx) => {
      if (!item.active) return { ...item, probability: 0 };
      return item;
    });

    const activeIndexes: number[] = [];
    finalItems.forEach((item, idx) => {
      if (item.active) activeIndexes.push(idx);
    });

    if (activeIndexes.length > 0) {
      let runSum = 0;
      for (let i = 0; i < activeIndexes.length - 1; i++) {
        runSum = Math.round((runSum + finalItems[activeIndexes[i]].probability) * 10) / 10;
      }
      const lastIdx = activeIndexes[activeIndexes.length - 1];
      finalItems[lastIdx].probability = Math.max(0, Math.round((100 - runSum) * 10) / 10);
    }

    const nextMap = { ...rewardItemsMap, [targetRestId]: finalItems };
    setRewardItemsMap(nextMap);
    try {
      localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(nextMap));
    } catch (err) {
      console.error('Failed to write rewards to localStorage:', err);
    }

    realtimeHub.publish(
      activeRestaurantSlug,
      'SPIN_CONFIG_SYNC',
      targetRestId,
      { rewardItems: finalItems }
    );

    return true;
  };

  const createOffer = (offer: Omit<Offer, 'id' | 'usedCount'>) => {
    const newOff: Offer = {
      ...offer,
      id: `off_${Date.now()}`,
      usedCount: 0,
    };
    setOffersMap((prev) => ({
      ...prev,
      [activeRestaurantId]: [newOff, ...(prev[activeRestaurantId] || [])],
    }));
  };

  const toggleOfferActive = (id: string) => {
    setOffersMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((off) =>
        off.id === id ? { ...off, active: !off.active } : off
      ),
    }));
  };

  const addTable = (tableNumber: number) => {
    const origin = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
      ? window.location.origin.replace(/\/$/, '')
      : 'https://ensemble-restaurant.vercel.app';
    const newTable: TableRecord = {
      tableNumber,
      restaurantId: activeRestaurantId,
      qrUrl: `${origin}/${activeRestaurantSlug}/t/${tableNumber}`,
      status: 'available',
      totalScans: 0,
      lastScanned: 'Never',
    };
    setTablesMap((prev) => ({
      ...prev,
      [activeRestaurantId]: [...(prev[activeRestaurantId] || []), newTable].sort((a, b) => a.tableNumber - b.tableNumber),
    }));
  };

  const deleteTable = (tableNumber: number) => {
    setTablesMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).filter((t) => t.tableNumber !== tableNumber),
    }));
  };

  const toggleTableActive = (tableNumber: number) => {
    setTablesMap((prev) => ({
      ...prev,
      [activeRestaurantId]: (prev[activeRestaurantId] || []).map((t) =>
        t.tableNumber === tableNumber ? { ...t, status: t.status === 'cleaning' ? 'available' : 'cleaning' } : t
      ),
    }));
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setRestaurants(INITIAL_RESTAURANTS);
    setMenuItemsMap(INITIAL_MENU_ITEMS);
    setRewardItemsMap(INITIAL_REWARD_ITEMS);
    setOffersMap(INITIAL_OFFERS);
    setCustomersMap(INITIAL_CUSTOMERS);
    setReviewsMap(INITIAL_REVIEWS);
    setSocialSubmissionsMap(INITIAL_SOCIAL_SUBMISSIONS);
    setTablesMap(INITIAL_TABLES);
    setTableSessions(SEED_TABLE_SESSIONS);
    setOrders(SEED_ORDERS);
    setCaptainCalls(SEED_CAPTAIN_CALLS);
    setMasterBillUploads(SEED_BILL_UPLOADS);
    setUnifiedCoupons(SEED_UNIFIED_COUPONS);
    setTableHistoryMap(SEED_TABLE_HISTORY);
    setBillConfigsMap(DEFAULT_BILL_CONFIGS);
    setClearTableAudits([]);
    setCustomerWallet([]);
    setCanSpin(true);
    setUnlockedExtraSpins(0);
    setActiveRestaurantSlug('heritage');
    setActiveTable(1);
    setCustomerSession(null);
    setGeofenceStatus('passed');
  };

  return (
    <TenantContext.Provider
      value={{
        role,
        setRole,
        staffRole,
        setStaffRole,
        activeRestaurantSlug,
        setActiveRestaurantSlug,
        activeRestaurant,
        activeTable,
        setActiveTable,
        customerViewMode,
        setCustomerViewMode,
        customerActiveTab,
        setCustomerActiveTab,

        restaurants,
        activeMenuItems,
        activeRewardItems,
        activeOffers,
        activeCustomers,
        activeReviews,
        activeSocialSubmissions,
        activeTables,
        activeCampaigns,

        customerSession,
        registerCustomerSession,
        logoutCustomerSession,
        geofenceStatus,
        setGeofenceStatus,
        requestGeofenceOverride,
        captainApproveGeofence,

        tableSessions,
        currentTableSession,
        joinTableSession,
        reassignSessionHost,
        assignManualTable,

        captainCalls,
        callCaptain,
        acknowledgeCaptainCall,
        callCooldownRemaining,

        orders,
        activeOrders,
        placeCustomerOrder,
        captainAddOrder,
        confirmOrder,
        deliverOrder,
        deliverOrderItem,
        cancelOrder,
        removeOrderItem,
        askForBill,
        closeTableTab,
        resetTable,
        forceCloseSession,

        unifiedCoupons,
        customerWallet,
        canSpin,
        unlockedExtraSpins,
        grantCustomerSpin,
        consumeCustomerSpin,
        addUnifiedCoupon,
        deleteCoupon,
        activateQueuedCoupon,
        redeemCoupon,
        addCustomerReward,
        redeemReward,

        masterBillUploads,
        uploadBillToMaster,
        updateBillAuditStatus,

        addRestaurant,
        ensureRestaurantExists,
        resolveRestaurant,
        updateRestaurant,
        toggleRestaurantStatus,
        updateRestaurantPlanFeatures,

        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        batchImportMenuItems,

        addReview,
        submitSocialProof,
        approveSocialSubmission,
        rejectSocialSubmission,

        updateRewardItem,
        addRewardItem,
        deleteRewardItem,
        saveRewardConfiguration,
        createOffer,
        toggleOfferActive,

        addTable,
        deleteTable,
        toggleTableActive,
        recordTableScan,
        clearTable,
        tableHistoryMap,
        clearTableAudits,

        billConfigsMap,
        activeBillConfig,
        updateBillConfiguration,

        resetToDefaults,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
