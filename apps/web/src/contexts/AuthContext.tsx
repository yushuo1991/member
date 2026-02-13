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
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 检查登录状态
  const checkAuth = async () => {
    console.log('[AuthContext] 开始检查登录状态...');
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      console.log('[AuthContext] /api/auth/me 响应状态:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] API响应数据:', { success: data?.success, user: data?.data?.user });

        // 检查响应体中的success字段，而不仅仅是HTTP状态码
        if (data?.success && data?.data?.user) {
          console.log('[AuthContext] 用户已登录，设置用户数据');
          setUser(data.data.user);
        } else {
          console.log('[AuthContext] 用户未登录或数据无效，清除用户状态');
          setUser(null);
        }
      } else if (response.status === 401 || response.status === 403) {
        // 只有在未授权或禁止访问时才清除用户状态
        console.log('[AuthContext] 用户未授权，清除登录状态');
        setUser(null);
      } else {
        // 其他HTTP错误（如500服务器错误）保持当前状态
        console.warn(`[AuthContext] 检查登录状态返回错误状态码: ${response.status}`);
        // 不清除用户状态，避免因临时服务器问题导致用户被登出
      }
    } catch (error) {
      // 网络错误（如断网、超时）保持当前用户状态
      // 这样可以避免因网络波动导致用户被意外登出
      console.error('[AuthContext] 检查登录状态失败（网络错误）:', error);
      // 不清除用户状态，保持用户体验
    } finally {
      console.log('[AuthContext] 检查完成，loading设为false');
      setLoading(false);
    }
  };

  // 组件挂载时检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '登录失败');
      }

      setUser(data?.data?.user ?? null);
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  // 退出登录
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
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
