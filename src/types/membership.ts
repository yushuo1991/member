/**
 * 会员相关类型定义
 */

export type MembershipLevel = 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export interface MembershipConfig {
  level: MembershipLevel;
  name: string;
  duration: number | null; // 天数，null表示永久
  price: number;
  features: string[];
}

export interface ActivationCode {
  id: number;
  code: string;
  membership_level: MembershipLevel;
  duration_days: number | null;
  is_used: boolean;
  used_by: number | null;
  used_at: Date | null;
  created_by: number;
  created_at: Date;
  expires_at: Date | null;
}

export interface ActivationRequest {
  code: string;
}

export interface GenerateCodeRequest {
  membershipLevel: MembershipLevel;
  quantity: number;
  expiresInDays?: number;
}

export interface ActivationCodeResponse {
  id: number;
  code: string;
  membershipLevel: string;
  durationDays: number | null;
  isUsed: boolean;
  usedBy: number | null;
  usedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}
