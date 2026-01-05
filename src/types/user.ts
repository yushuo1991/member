/**
 * 用户相关类型定义
 */

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  membership_level: 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  membership_expiry: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  userId: number;
  username: string;
  email: string;
  membershipLevel: 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
}

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  membershipLevel: string;
  type: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

// 注册请求类型
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 用户响应类型（不包含敏感信息）
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  membershipLevel: string;
  membershipExpiry: string | null;
  createdAt: string;
}
