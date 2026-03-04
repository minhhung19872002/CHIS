import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { UserInfo } from '../api/auth';

interface OtpPending {
  userId: string;
  maskedEmail: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  otpPending: OtpPending | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<'success' | 'otp' | false>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<boolean>;
  cancelOtp: () => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) as UserInfo : null;
  });
  const [otpPending, setOtpPending] = useState<OtpPending | null>(null);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!user && !!localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      authApi.getProfile().then(res => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }
  }, [user]);

  const login = useCallback(async (username: string, password: string): Promise<'success' | 'otp' | false> => {
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      if (res.data.requiresOtp) {
        setOtpPending({
          userId: res.data.otpUserId || '',
          maskedEmail: res.data.maskedEmail || '',
        });
        return 'otp';
      }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return 'success';
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (otp: string): Promise<boolean> => {
    if (!otpPending) return false;
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ userId: otpPending.userId, otp });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setOtpPending(null);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [otpPending]);

  const resendOtp = useCallback(async (): Promise<boolean> => {
    if (!otpPending) return false;
    try {
      await authApi.resendOtp(otpPending.userId);
      return true;
    } catch {
      return false;
    }
  }, [otpPending]);

  const cancelOtp = useCallback(() => {
    setOtpPending(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setOtpPending(null);
  }, []);

  const hasPermission = useCallback((permission: string) => {
    return user?.permissions?.includes(permission) ?? false;
  }, [user]);

  const hasRole = useCallback((role: string) => {
    return user?.roles?.includes(role) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, otpPending, loading, login, verifyOtp, resendOtp, cancelOtp, logout, hasPermission, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
