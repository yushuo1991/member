/**
 * 用户相关类型定义
 * 从 `membership.ts` 导出通用类型
 */

import { MembershipLevel } from './membership';

export type { MembershipLevel } from './membership';

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  phone?: string;
  real_name?: string;
  avatar_url?: string;
  status: number;
  trial_bk: number;
  trial_xinli: number;
  trial_fuplan: number;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MembershipRow {
  id: number;
  user_id: number;
  level: MembershipLevel;
  expires_at: Date | null;
  activated_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithMembership extends UserRow {
  membership_level: MembershipLevel;
  membership_expiry: Date | null;
}

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  type: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

export interface LoginRequest {
  password: string;
  username?: string;
  email?: string;
  identifier?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  membershipLevel: MembershipLevel;
  membershipExpiry: string | null;
  trialCounts?: {
    bk: number;
    xinli: number;
    fuplan: number;
  };
  createdAt: string;
}

