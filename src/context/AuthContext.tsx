import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthSession, StaffAccount, UserRole } from '../services/auth/authTypes';
import { authService } from '../services/auth/authService';

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  login: (
    loginIdOrEmail: string,
    password: string,
    requiredRole?: UserRole | ('owner' | 'manager')[],
    restaurantSlug?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: (redirectRoute?: string) => void;
  createStaffAccount: (data: {
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
  }) => Promise<{ success: boolean; account?: StaffAccount; error?: string }>;
  getStaffForRestaurant: (restaurantId: string) => StaffAccount[];
  toggleStaffStatus: (id: string, newStatus: 'active' | 'disabled') => boolean;
  resetStaffPassword: (id: string, newPassword: string) => Promise<boolean>;
  updateStaffAccount: (id: string, updates: Partial<StaffAccount>) => boolean;
  refreshAccounts: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [version, setVersion] = useState<number>(0);

  useEffect(() => {
    const initializeAuth = async () => {
      await authService.init();
      const current = authService.getCurrentSession();
      if (current) {
        setSession(current);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [version]);

  const login = async (
    loginIdOrEmail: string,
    password: string,
    requiredRole?: UserRole | ('owner' | 'manager')[],
    restaurantSlug?: string
  ) => {
    const res = await authService.login(loginIdOrEmail, password, requiredRole, restaurantSlug);
    if (res.success && res.session) {
      setSession(res.session);
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const logout = (redirectRoute?: string) => {
    authService.logout();
    setSession(null);
    if (redirectRoute) {
      window.location.href = redirectRoute;
    }
  };

  const createStaffAccount = async (data: {
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
  }) => {
    const res = await authService.createStaffAccount(data);
    if (res.success) {
      setVersion((v) => v + 1);
    }
    return res;
  };

  const getStaffForRestaurant = (restaurantId: string) => {
    return authService.getStaffForRestaurant(restaurantId);
  };

  const toggleStaffStatus = (id: string, newStatus: 'active' | 'disabled') => {
    const ok = authService.toggleStaffStatus(id, newStatus);
    if (ok) setVersion((v) => v + 1);
    return ok;
  };

  const resetStaffPassword = async (id: string, newPassword: string) => {
    const ok = await authService.resetStaffPassword(id, newPassword);
    if (ok) setVersion((v) => v + 1);
    return ok;
  };

  const updateStaffAccount = (id: string, updates: Partial<StaffAccount>) => {
    const ok = authService.updateStaffAccount(id, updates);
    if (ok) setVersion((v) => v + 1);
    return ok;
  };

  const refreshAccounts = () => {
    setVersion((v) => v + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session,
        isLoading,
        login,
        logout,
        createStaffAccount,
        getStaffForRestaurant,
        toggleStaffStatus,
        resetStaffPassword,
        updateStaffAccount,
        refreshAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
