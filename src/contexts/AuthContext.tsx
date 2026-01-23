'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MembershipLevel } from '@/types/membership';

interface User {
  id: number;
  username: string;
  email: string;
  membershipLevel: MembershipLevel;
  membershipExpiry: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const debug = process.env.NODE_ENV === 'development';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 延迟函数（用于重试）
   */
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * 带重试的fetch封装
   */
  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES
  ): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);

        // 如果是网络错误或5xx错误，进行重试
        if (!response.ok && response.status >= 500) {
          if (i < retries - 1) {
            if (debug) console.warn(`[AuthContext] 请求失败 (${response.status})，${RETRY_DELAY}ms后重试... (${i + 1}/${retries})`);
            await delay(RETRY_DELAY * (i + 1)); // 指数退避
            continue;
          }
        }

        return response;
      } catch (err) {
        // 网络错误
        if (i < retries - 1) {
          if (debug) console.warn(`[AuthContext] 网络错误，${RETRY_DELAY}ms后重试... (${i + 1}/${retries})`, err);
          await delay(RETRY_DELAY * (i + 1));
          continue;
        }
        throw err;
      }
    }

    throw new Error('请求失败，请检查网络连接');
  };

  // 检查登录状态
  const checkAuth = async () => {
    try {
      const response = await fetchWithRetry('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setError(null);
      } else if (response.status === 401) {
        // 未登录，正常状态
        setUser(null);
        setError(null);
      } else {
        // 其他错误
        const data = await response.json().catch(() => ({ message: '获取用户信息失败' }));
        setError(data.message || '获取用户信息失败');
        setUser(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '检查登录状态失败';
      if (debug) console.error('[AuthContext] 检查登录状态失败:', err);
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  // 登录
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithRetry('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || '登录失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      setUser(data.user);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      if (debug) console.error('[AuthContext] 登录失败:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchWithRetry('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }, 1); // 退出登录只尝试一次
      setUser(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '退出登录失败';
      if (debug) console.error('[AuthContext] 退出登录失败:', err);
      setError(errorMessage);
      // 即使退出失败，也清除本地用户状态
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    setLoading(true);
    await checkAuth();
  };

  // 清除错误
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
