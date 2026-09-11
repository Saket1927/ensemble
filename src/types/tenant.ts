import { StaffRole, TableSession, SessionMember, CaptainCall, CaptainOrder, OpenTabDetails } from './captain';

export type TenantRole = 'master_admin' | 'restaurant_admin' | 'customer' | 'captain';

export type CustomerViewMode = 'mobile_frame' | 'responsive';

export interface Branding {
  primaryColor: string;    // e.g. #162c21 (Forest green)
  secondaryColor: string;  // e.g. #c5a96d (Warm gold)
  accentColor: string;     // e.g. #fbf9f5 (Warm ivory)
  surfaceColor: string;    // #ffffff
  textColor: string;       // #1c1c1c
  fontFamily: string;
  logoUrl: string;
  heroImageUrl: string;
  coverImageUrl: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsapp: string;
  tiktok: string;
  youtube: string;
}

export interface RestaurantPlanFeatures {
  captainModule: boolean;
  ordering: boolean;
  socialRewards: boolean;
  spinRewards: boolean;
  billUpload: boolean;
  customBranding: boolean;
}

export interface ChargesConfig {
  gstPercent: number;           // e.g. 5%
  serviceChargePercent: number; // e.g. 5%
  packagingFee: number;         // e.g. flat flat ₹30
}

export interface Restaurant {
  id: string;
  slug: string; // e.g. "heritage", "bambaihouse", "thetable"
  name: string;
  brandTitle: string;
  tagline: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number; // 150m
  phone: string;
  email: string;
  website: string;
  googleReviewUrl: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'Starter' | 'Growth' | 'Enterprise';
  planFeatures?: RestaurantPlanFeatures;
  chargesConfig?: ChargesConfig;
  tags?: string[];
  mrr: number;
  createdAt: string;
  branding: Branding;
  socials: SocialLinks;
  hashtags: string[];
  tablesCount: number;
  openingTime?: string;
  closingTime?: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  category: 'Starters' | 'Mains' | 'Breads' | 'Rice' | 'Desserts' | 'Beverages' | string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  isChefSpecial?: boolean;
  isAvailable: boolean;
  rating: number;
  calories?: string;
  spiceLevel?: 1 | 2 | 3;
}

export interface Customer {
  id: string;
  restaurantId: string;
  name: string;
  phone: string;
  email?: string;
  visits: number;
  lastVisit: string;
  totalSpend: number;
  averageBill: number;
  reviewsCount: number;
  rewardsRedeemed: number;
  favoriteDishes: string[];
  engagement: {
    instagram: boolean;
    whatsapp: boolean;
    tiktok?: boolean;
  };
  tags: string[];
  birthday?: string;
  anniversary?: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  photoUrl?: string;
  dishFeedback?: {
    dishName: string;
    rating: number;
  }[];
  routedToGoogle?: boolean;
  isPrivateFeedback?: boolean;
  verified: boolean;
  tableNumber?: string | number;
  reply?: string;
}

export interface RewardWheelItem {
  id: string;
  label: string;
  discountType: 'percentage' | 'fixed' | 'free_item' | 'no_luck';
  discountValue: number;
  description: string;
  probability: number; // 0-100
  color: string;
  textColor: string;
  active: boolean;
  expiryDays: number;
}

// Unified 2-Coupon Model (Section 3)
export interface UnifiedCoupon {
  id: string;
  restaurantId: string;
  customerPhone: string;
  voucherCode: string; // e.g. HRTG-8F42K
  rewardLabel: string;
  discountType: 'percentage' | 'fixed' | 'free_item';
  discountValue: number;
  slot: 'active' | 'queued' | 'pending_approval'; // 1 active, 1 queued
  source: 'spin_win' | 'review' | 'instagram' | 'bill_upload' | 'referral' | 'deal_of_the_day';
  status: 'held' | 'redeemed' | 'expired' | 'deleted';
  createdAt: string;
  activatedAt?: string;
  expiresAt: string; // 20-day clock calculated fresh upon activation
  tableNumber?: number;
}

export interface CustomerReward {
  id: string;
  restaurantId: string;
  code: string;
  rewardLabel: string;
  discountType: 'percentage' | 'fixed' | 'free_item';
  discountValue: number;
  minBill?: number;
  status: 'active' | 'redeemed' | 'expired';
  createdAt: string;
  expiresAt: string;
  qrData?: string;
  tableNumber?: number;
  customerPhone?: string;
  voucherCode?: string;
  expiryDate?: string;
  wonDate?: string;
  source?: string;
}

export interface Offer {
  id: string;
  restaurantId: string;
  name: string;
  code: string;
  offerType?: 'discount' | 'deal_of_the_day' | 'deal_of_the_week' | 'campaign';
  discountType: 'percentage' | 'fixed' | 'free_item';
  discountValue: number;
  minBill: number;
  validFrom: string;
  validUntil: string;
  applicableDays: string[];
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export interface SocialSubmission {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  platform: 'Instagram' | 'Facebook' | 'WhatsApp' | 'TikTok';
  screenshotUrl: string; // Mandatory
  instagramHandle?: string; // Optional
  hashtags: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  autoDeleteAt?: string;
}

// Master Admin Bill Audit Record (Section 14a)
export interface MasterBillUpload {
  id: string;
  restaurantId: string;
  restaurantName: string;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  billPhotoUrl: string;
  reportedAppTotal: number;
  auditedStatus: 'pending' | 'verified' | 'discrepancy_flagged';
  bonusScratchWon?: {
    label: string;
    value: number;
    code: string;
  };
  uploadedAt: string;
}

export interface TableRecord {
  tableNumber: number;
  restaurantId: string;
  qrUrl: string;
  status: 'available' | 'occupied' | 'bill_requested' | 'paid_pending_reset' | 'cleaning' | 'active';
  totalScans: number;
  lastScanned: string;
  assignedCaptain?: string;
}

export interface Campaign {
  id: string;
  restaurantId: string;
  name: string;
  targetAudience: 'Inactive 30+ days' | 'Birthday Month' | 'Anniversary' | 'High-Value VIP' | 'First-Time Visitors';
  offer: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
  sentCount: number;
  conversionRate: string;
  active: boolean;
}

export interface PlatformStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalCustomers: number;
  totalQrScans: string;
  totalReviews: number;
  totalRewards: number;
  totalRedemptions: number;
  mrr: string;
}

// Global Customer Identity (Section 16)
export interface MasterGlobalCustomer {
  phone: string;
  name: string;
  totalRestaurantsFrequented: number;
  restaurantNames: string[];
  totalLifetimeVisits: number;
  totalLifetimeSpend: number;
  averageSpendPerVisit: number;
  totalReviewsWritten: number;
  totalRewardsRedeemed: number;
  lastSeenAt: string;
}
