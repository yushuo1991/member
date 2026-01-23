/**
 * 用户相关类型定义
 */

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

// 用户会员信息（从memberships表关联）
export interface UserWithMembership extends User {
  membership_level: 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime' | null;
  membership_expiry: Date | null;
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
