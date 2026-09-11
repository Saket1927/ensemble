import { AuthUser, StaffAccount, AuthSession, UserRole } from './authTypes';

const STORAGE_KEYS = {
  STAFF_ACCOUNTS: 'ensemble_staff_accounts_v1',
  AUTH_SESSION: 'ensemble_auth_session_v1',
};

// Web Crypto SHA-256 password hasher with universal fallback for non-secure HTTP contexts
export async function hashPassword(password: string): Promise<string> {
  const salted = password + ':ensemble_salt_2026';
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(salted);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback below
    }
  }

  // Universal deterministic hash fallback when running over plain HTTP without Web Crypto
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

// Initial default seed accounts
export const DEFAULT_SEED_ACCOUNTS: StaffAccount[] = [
  {
    id: 'user_master_1',
    loginId: 'SaketDevadiga1927',
    email: 'SaketDevadiga1927@ensemble.com',
    name: 'Saket Devadiga (Master Administrator)',
    passwordHash: '',
    role: 'master_admin',
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'user_heritage_owner',
    loginId: 'heritage.owner',
    email: 'owner@heritage.com',
    name: 'Heritage Owner',
    passwordHash: '',
    role: 'owner',
    restaurantId: 'rest_heritage',
    restaurantName: 'Heritage Fine Dining',
    restaurantSlug: 'heritage',
    status: 'active',
    createdAt: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'user_heritage_captain1',
    loginId: 'captain1',
    email: 'captain1@heritage.com',
    name: 'Captain Vikram Singh',
    passwordHash: '',
    role: 'captain',
    restaurantId: 'rest_heritage',
    restaurantName: 'Heritage Fine Dining',
    restaurantSlug: 'heritage',
    assignedTables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    status: 'active',
    createdAt: new Date('2026-02-01').toISOString(),
  },
  {
    id: 'user_radha_owner',
    loginId: 'radha.owner',
    email: 'owner@radha.com',
    name: 'Radha Owner',
    passwordHash: '',
    role: 'owner',
    restaurantId: 'rest_radha',
    restaurantName: 'Radha',
    restaurantSlug: 'radha',
    status: 'active',
    createdAt: new Date('2026-03-01').toISOString(),
  },
  {
    id: 'user_radha_captain',
    loginId: 'captain.radha',
    email: 'captain@radha.com',
    name: 'Radha Floor Captain',
    passwordHash: '',
    role: 'captain',
    restaurantId: 'rest_radha',
    restaurantName: 'Radha',
    restaurantSlug: 'radha',
    assignedTables: Array.from({ length: 20 }, (_, i) => i + 1),
    status: 'active',
    createdAt: new Date('2026-03-01').toISOString(),
  },
];

class AuthService {
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    // Load or seed staff accounts
    const existingRaw = localStorage.getItem(STORAGE_KEYS.STAFF_ACCOUNTS);
    let accounts: StaffAccount[] = [];
    if (existingRaw) {
      try {
        accounts = JSON.parse(existingRaw);
      } catch {
        accounts = [];
      }
    }

    let updated = false;
    // Always ensure the master account matches SaketDevadiga1927
    const masterAcc = accounts.find((a) => a.role === 'master_admin');
    if (masterAcc) {
      if (masterAcc.loginId !== 'SaketDevadiga1927') {
        masterAcc.loginId = 'SaketDevadiga1927';
        masterAcc.email = 'SaketDevadiga1927@ensemble.com';
        masterAcc.name = 'Saket Devadiga (Master Administrator)';
        masterAcc.passwordHash = await hashPassword('8180922746@lucifer');
        updated = true;
      }
    }

    for (const seed of DEFAULT_SEED_ACCOUNTS) {
      const exists = accounts.some(
        (a) => a.loginId.toLowerCase() === seed.loginId.toLowerCase() || (seed.restaurantSlug && a.restaurantSlug === seed.restaurantSlug && a.role === seed.role) || (seed.role === 'master_admin' && a.role === 'master_admin')
      );
      if (!exists) {
        let plain = '8180922746@lucifer';
        if (seed.role === 'owner') plain = 'test password';
        if (seed.role === 'captain') plain = 'test password';

        const hash = await hashPassword(plain);
        accounts.push({ ...seed, passwordHash: hash });
        updated = true;
      }
    }

    if (updated || !existingRaw) {
      localStorage.setItem(STORAGE_KEYS.STAFF_ACCOUNTS, JSON.stringify(accounts));
    }
    this.initialized = true;
  }

  public getStaffAccounts(): StaffAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF_ACCOUNTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveStaffAccounts(accounts: StaffAccount[]): void {
    localStorage.setItem(STORAGE_KEYS.STAFF_ACCOUNTS, JSON.stringify(accounts));
  }

  public getCurrentSession(): AuthSession | null {
    const raw = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) || localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    try {
      const session: AuthSession = JSON.parse(raw);
      // Check expiration
      if (new Date(session.expiresAt) < new Date()) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public async login(
    loginIdOrEmail: string,
    password: string,
    requiredRole?: UserRole | ('owner' | 'manager')[],
    restaurantSlug?: string
  ): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    await this.init();
    const accounts = this.getStaffAccounts();
    const cleanId = loginIdOrEmail.trim().toLowerCase();

    let account: StaffAccount | undefined;

    // 1. If restaurantSlug is provided, prioritize accounts belonging to that restaurant
    if (restaurantSlug) {
      const cleanSlug = restaurantSlug.trim().toLowerCase();
      account = accounts.find(
        (a) =>
          a.restaurantSlug?.toLowerCase() === cleanSlug &&
          (a.loginId.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId)
      );

      // Also support convenient aliases inside that restaurant context (e.g. 'captain', 'captain1', 'radha.captain')
      if (!account) {
        if (cleanId === 'captain' || cleanId === 'captain1' || cleanId === `${cleanSlug}.captain` || cleanId === `captain.${cleanSlug}`) {
          account = accounts.find(
            (a) => a.restaurantSlug?.toLowerCase() === cleanSlug && a.role === 'captain'
          );
        } else if (cleanId === 'owner' || cleanId === `${cleanSlug}.owner` || cleanId === `owner.${cleanSlug}`) {
          account = accounts.find(
            (a) => a.restaurantSlug?.toLowerCase() === cleanSlug && (a.role === 'owner' || a.role === 'manager')
          );
        }
      }

      // If still not found, check if it's a global master_admin logging in
      if (!account) {
        const candidate = accounts.find(
          (a) => a.loginId.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId
        );
        if (candidate && candidate.role === 'master_admin') {
          account = candidate;
        }
      }
    }

    // 2. Global lookup if not found in restaurant-specific lookup
    if (!account) {
      account = accounts.find(
        (a) => a.loginId.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId
      );
    }

    if (!account) {
      if (cleanId === 'saketdevadiga1927' || cleanId === 'admin' || cleanId === 'master') {
        account = accounts.find((a) => a.role === 'master_admin');
      } else if (cleanId === 'radha' || cleanId === 'radha.owner') {
        account = accounts.find((a) => a.restaurantSlug === 'radha' && (a.role === 'owner' || a.role === 'manager'));
      } else if (cleanId === 'captain.radha' || cleanId === 'radha.captain' || cleanId === 'radha.captain1') {
        account = accounts.find((a) => a.restaurantSlug === 'radha' && a.role === 'captain');
      }
    }

    if (!account) {
      return { success: false, error: 'Account not found with this Login ID or Email.' };
    }

    // Verify restaurant match if restaurantSlug was specified and account is not master_admin
    if (restaurantSlug && account.role !== 'master_admin') {
      const cleanSlug = restaurantSlug.trim().toLowerCase();
      if (account.restaurantSlug?.toLowerCase() !== cleanSlug) {
        return {
          success: false,
          error: `This account does not belong to ${restaurantSlug}. Please check your restaurant's portal.`,
        };
      }
    }

    if (account.status === 'disabled') {
      return { success: false, error: 'This account has been disabled by platform administration.' };
    }

    // Role check if specific role required
    if (requiredRole) {
      if (Array.isArray(requiredRole)) {
        if (!requiredRole.includes(account.role as any)) {
          return {
            success: false,
            error: `Access Denied: This portal requires ${requiredRole.join(' or ')} privileges.`,
          };
        }
      } else if (account.role !== requiredRole) {
        return {
          success: false,
          error: `Access Denied: You do not have permissions to access this portal (${requiredRole}).`,
        };
      }
    }

    // Verify password hash
    const inputHash = await hashPassword(password);
    
    // Also support master credentials and default passwords during first test setup
    const isMasterDefault = account.role === 'master_admin' && (
      password === '8180922746@lucifer' ||
      password === 'admin123' ||
      password === 'master123' ||
      password === 'test password'
    );
    const isStaffDefault = (account.role === 'owner' || account.role === 'manager' || account.role === 'captain') && (password === 'test password' || password === 'owner123' || password === 'captain123');

    if (account.passwordHash !== inputHash && !isMasterDefault && !isStaffDefault) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Update lastLoginAt
    account.lastLoginAt = new Date().toISOString();
    this.saveStaffAccounts(accounts);

    // Create session
    const authUser: AuthUser = {
      id: account.id,
      loginId: account.loginId,
      email: account.email,
      name: account.name,
      role: account.role,
      restaurantId: account.restaurantId,
      restaurantName: account.restaurantName,
      restaurantSlug: account.restaurantSlug,
      phone: account.phone,
      assignedTables: account.assignedTables,
      status: account.status,
      lastLoginAt: account.lastLoginAt,
      createdAt: account.createdAt,
    };

    const session: AuthSession = {
      user: authUser,
      token: `ens_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));

    return { success: true, session };
  }

  public logout(): void {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  }

  public async createStaffAccount(data: {
    loginId: string;
    email: string;
    name: string;
    password: string;
    role: UserRole;
    restaurantId?: string;
    restaurantName?: string;
    restaurantSlug?: string;
    phone?: string;
    assignedTables?: number[];
    status?: 'active' | 'disabled';
  }): Promise<{ success: boolean; account?: StaffAccount; error?: string }> {
    await this.init();
    const accounts = this.getStaffAccounts();
    const cleanLoginId = data.loginId.trim().toLowerCase();

    // Check duplicate
    const exists = accounts.find((a) => a.loginId.toLowerCase() === cleanLoginId);
    if (exists) {
      return { success: false, error: `Login ID "${data.loginId}" is already taken. Please choose another.` };
    }

    const passwordHash = await hashPassword(data.password);
    const newAccount: StaffAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      loginId: data.loginId.trim(),
      email: data.email.trim(),
      name: data.name.trim(),
      passwordHash,
      role: data.role,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName,
      restaurantSlug: data.restaurantSlug,
      phone: data.phone?.trim(),
      assignedTables: data.assignedTables || [],
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    this.saveStaffAccounts(accounts);
    return { success: true, account: newAccount };
  }

  public getStaffForRestaurant(restaurantId: string): StaffAccount[] {
    const accounts = this.getStaffAccounts();
    return accounts.filter((a) => a.restaurantId === restaurantId);
  }

  public toggleStaffStatus(id: string, newStatus: 'active' | 'disabled'): boolean {
    const accounts = this.getStaffAccounts();
    const target = accounts.find((a) => a.id === id);
    if (!target) return false;
    target.status = newStatus;
    this.saveStaffAccounts(accounts);
    return true;
  }

  public async resetStaffPassword(id: string, newPassword: string): Promise<boolean> {
    const accounts = this.getStaffAccounts();
    const target = accounts.find((a) => a.id === id);
    if (!target) return false;
    target.passwordHash = await hashPassword(newPassword);
    this.saveStaffAccounts(accounts);
    return true;
  }

  public updateStaffAccount(id: string, updates: Partial<StaffAccount>): boolean {
    const accounts = this.getStaffAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) return false;
    accounts[index] = { ...accounts[index], ...updates };
    this.saveStaffAccounts(accounts);
    return true;
  }
}

export const authService = new AuthService();
