export type StaffRole = 'owner' | 'manager' | 'captain';

export interface StaffMember {
  id: string;
  restaurantId: string;
  name: string;
  email: string;
  role: StaffRole;
  assignedTables: number[];
  isActive: boolean;
}

export interface SessionMember {
  id: string;
  name: string;
  phone: string;
  isHost: boolean;
  joinedAt: string;
}

export interface TableSession {
  id: string;
  restaurantId: string;
  tableNumber: number;
  hostName: string;
  hostPhone: string;
  members: SessionMember[];
  geofenceVerified: boolean;
  geofenceOverridden: boolean;
  status: 'active' | 'bill_requested' | 'paid_pending_reset' | 'closed' | 'discarded';
  paymentMethod?: 'cash' | 'online';
  createdAt: string;
  closedAt?: string;
}

export interface CaptainCall {
  id: string;
  restaurantId: string;
  tableNumber: number;
  status: 'pending' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  assignedCaptainId?: string;
}

export interface OrderItemEntry {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  source: 'customer' | 'captain'; // Section 9: clearly labeled "Captain Added" vs "Customer Order"
  notes?: string;
  removedByCaptain?: boolean;
}

export interface CaptainOrder {
  id: string;
  tabId: string;
  tableNumber: number;
  orderedByName: string;
  orderedByPhone: string;
  items: OrderItemEntry[];
  status: 'received' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  estimatedPrepMinutes?: 10 | 20 | 30 | number;
  prepStartedAt?: string;
  prepExpiresAt?: string; // ISO timestamp for countdown
  isOverdue?: boolean;
  source?: 'customer' | 'captain';
  createdAt: string;
}

export interface OpenTabDetails {
  id: string;
  sessionId: string;
  tableNumber: number;
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  packagingFee: number;
  discountAmount: number;
  appliedCouponId?: string;
  totalAmount: number;
  status: 'open' | 'bill_requested' | 'paid';
}
