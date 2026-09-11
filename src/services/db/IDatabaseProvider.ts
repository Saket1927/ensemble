import { Restaurant, MenuItem, Customer, Review, Offer, SocialSubmission, TableRecord, MasterBillUpload, MasterGlobalCustomer } from '../../types/tenant';
import { TableSession, CaptainCall, CaptainOrder, OpenTabDetails, StaffMember, StaffRole } from '../../types/captain';

export interface IDatabaseProvider {
  // Tenants
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | null>;
  updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<void>;

  // Sessions & Members (Multi-person QR scan)
  getSession(restaurantId: string, tableNumber: number): Promise<TableSession | null>;
  createSession(restaurantId: string, tableNumber: number, hostName: string, hostPhone: string): Promise<TableSession>;
  joinSession(sessionId: string, memberName: string, memberPhone: string): Promise<void>;
  reassignHost(sessionId: string, newHostName: string, newHostPhone: string, captainStaffId: string): Promise<void>;
  verifyGeofence(sessionId: string, overriddenByCaptainId?: string): Promise<void>;

  // Open Tab & Orders
  getOpenTab(sessionId: string): Promise<OpenTabDetails | null>;
  addItemToTab(sessionId: string, item: MenuItem, quantity: number, orderedByName: string, orderedByPhone: string): Promise<void>;
  removeItemFromTab(sessionId: string, orderItemId: string): Promise<void>;
  requestBill(sessionId: string): Promise<void>;
  closeTab(sessionId: string, paymentMethod: 'cash' | 'online', closedByCaptainId: string): Promise<void>;
  resetTable(restaurantId: string, tableNumber: number): Promise<void>;

  // Captain Calls
  callCaptain(restaurantId: string, tableNumber: number): Promise<CaptainCall>;
  acknowledgeCaptainCall(callId: string, captainId: string): Promise<void>;
  resolveCaptainCall(callId: string): Promise<void>;

  // Orders
  getCaptainOrders(restaurantId: string): Promise<CaptainOrder[]>;
  updateOrderTimer(orderId: string, minutes: 10 | 20 | 30): Promise<void>;
  markOrderDelivered(orderId: string): Promise<void>;

  // Menu Items
  getMenuItems(restaurantId: string): Promise<MenuItem[]>;
  saveMenuItem(item: MenuItem): Promise<void>;
  deleteMenuItem(itemId: string): Promise<void>;

  // Master Admin
  getMasterBillUploads(): Promise<MasterBillUpload[]>;
  uploadMasterBill(upload: Omit<MasterBillUpload, 'id' | 'uploadedAt' | 'auditedStatus'>): Promise<MasterBillUpload>;
  getMasterGlobalCustomers(): Promise<MasterGlobalCustomer[]>;
}
