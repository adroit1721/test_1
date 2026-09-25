import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeStorage } from '../utils/safeStorage';
import {
  loginOfficer as apiLoginOfficer,
  updateOfficerCredentials as apiUpdateOfficerCredentials,
  verifyAuthToken as apiVerifyAuthToken,
  setAuthToken as apiSetAuthToken,
} from '../utils/apiClient';

interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
}

interface AdminAuthContextType {
  officerId: string;
  isAdminLoggedIn: boolean;
  loginOfficer: (
    username: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    isLocked?: boolean;
    lockoutUntil?: number;
    remainingSeconds?: number;
    attemptsLeft?: number;
  }>;
  logoutAdmin: () => void;
  updateOfficerCredentials: (
    currentPassword: string,
    newOfficerId: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string; error?: string }>;
  lockoutStatus: LockoutStatus;
  clearLockout: () => void;
  isSupabaseActive: boolean;
  isAppwriteActive: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officerId, setOfficerId] = useState<string>(() => {
    return safeStorage.getItem('ngdc_officer_id') || 'PUO-819';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return safeStorage.getItem('ngdc_admin_session') === 'active';
  });

  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>({
    isLocked: false,
    remainingSeconds: 0,
  });

  // Lockout timer ticker
  useEffect(() => {
    if (!lockoutStatus.isLocked || lockoutStatus.remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutStatus((prev) => {
        if (prev.remainingSeconds <= 1) {
          return { isLocked: false, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutStatus.isLocked, lockoutStatus.remainingSeconds]);

  const loginOfficerHandler = useCallback(async (username: string, password: string) => {
    try {
      const res = await apiLoginOfficer(username, password);
      if (res.success) {
        setIsAdminLoggedIn(true);
        setOfficerId(username || 'PUO-819');
        safeStorage.setItem('ngdc_admin_session', 'active');
        safeStorage.setItem('ngdc_officer_id', username || 'PUO-819');
        setLockoutStatus({ isLocked: false, remainingSeconds: 0 });
        return { success: true };
      }
      if (res.isLocked && res.remainingSeconds) {
        setLockoutStatus({ isLocked: true, remainingSeconds: res.remainingSeconds });
      }
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || 'Login request failed' };
    }
  }, []);

  const logoutAdminHandler = useCallback(() => {
    setIsAdminLoggedIn(false);
    apiSetAuthToken(null);
    safeStorage.removeItem('ngdc_admin_session');
  }, []);

  // Verify stored session token on mount to prevent silent fake-login states
  useEffect(() => {
    const verifySession = async () => {
      if (isAdminLoggedIn) {
        const isValid = await apiVerifyAuthToken();
        if (!isValid) {
          console.warn('[AdminAuth] Proactive token verification failed. Logging out...');
          logoutAdminHandler();
        }
      }
    };
    verifySession();
  }, [isAdminLoggedIn, logoutAdminHandler]);

  const updateOfficerCredentialsHandler = useCallback(
    async (currentPassword: string, newOfficerId: string, newPassword: string) => {
      try {
        const res = await apiUpdateOfficerCredentials(currentPassword, newOfficerId, newPassword);
        if (res.success) {
          setOfficerId(newOfficerId);
          safeStorage.setItem('ngdc_officer_id', newOfficerId);
          return { success: true, message: 'Admin credentials updated successfully' };
        }
        return { success: false, message: res.error || 'Failed to update credentials', error: res.error };
      } catch (err: any) {
        return { success: false, message: err.message || 'Error updating credentials', error: err.message };
      }
    },
    []
  );

  const clearLockoutHandler = useCallback(() => {
    setLockoutStatus({ isLocked: false, remainingSeconds: 0 });
  }, []);

  const value: AdminAuthContextType = {
    officerId,
    isAdminLoggedIn,
    loginOfficer: loginOfficerHandler,
    logoutAdmin: logoutAdminHandler,
    updateOfficerCredentials: updateOfficerCredentialsHandler,
    lockoutStatus,
    clearLockout: clearLockoutHandler,
    isSupabaseActive: true,
    isAppwriteActive: true,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
