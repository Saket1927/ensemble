export type UserRole = 'master_admin' | 'owner' | 'manager' | 'captain';

export interface AuthUser {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId?: string;
  restaurantName?: string;
  restaurantSlug?: string;
  phone?: string;
  assignedTables?: number[];
  status: 'active' | 'disabled';
  lastLoginAt?: string;
  createdAt: string;
}

export interface StaffAccount {
  id: string;
  loginId: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  restaurantId?: string;
  restaurantName?: string;
  restaurantSlug?: string;
  phone?: string;
  assignedTables?: number[];
  status: 'active' | 'disabled';
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}
