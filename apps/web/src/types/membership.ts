/**
 * 宇硕会员体系 - 类型定义
 * 版本：v3.0
 */

// ============================================================================
// 会员等级相关
// ============================================================================

export type MembershipLevel = 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export interface MembershipConfig {
  level: MembershipLevel;
  name: string;
  duration: number | null;
  price: number;
  features: string[];
  color: string;
  description: string;
}

// ============================================================================
// 产品相关
// ============================================================================

export type PriceType = 'membership' | 'standalone' | 'both';
export type PurchaseType = 'monthly' | 'yearly' | 'lifetime';

export interface StandalonePrices {
  monthly?: number;
  yearly?: number;
  lifetime?: number;
}

export interface Product {
  slug: string;
  name: string;
  description: string;
  detailDescription?: string;
  url?: string;
  icon: string;
  imageUrl?: string;
  requiredLevel: MembershipLevel;
  priceType: PriceType;
  standalonePrices?: StandalonePrices;
  trialEnabled: boolean;
  trialCount: number;
  features: string[];
  sortOrder: number;
}

// ============================================================================
// 用户相关
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  realName?: string;
  avatarUrl?: string;
  status: number;
  trialBk: number;
  trialXinli: number;
  trialFuplan: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMembership {
  id: number;
  userId: number;
  level: MembershipLevel;
  expiresAt: Date | null;
  activatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: number;
  username: string;
  email: string;
  membership: {
    level: MembershipLevel;
    expiresAt: Date | null;
  };
  trialCounts: {
    bk: number;
    xinli: number;
    fuplan: number;
  };
}

// ============================================================================
// 产品购买相关
// ============================================================================

export interface UserProductPurchase {
  id: number;
  userId: number;
  productSlug: string;
  purchaseType: PurchaseType;
  price: number;
  expiresAt: Date | null;
  activationCode?: string;
  orderNo?: string;
  paymentMethod?: string;
  createdAt: Date;
}

export interface PurchaseRequest {
  productSlug: string;
  purchaseType: PurchaseType;
}

export interface PurchaseResponse {
  success: boolean;
  orderId?: string;
  message: string;
  expiresAt?: string;
}

// ============================================================================
// 激活码相关
// ============================================================================

export type CodeType = 'membership' | 'product';

export interface ActivationCode {
  id: number;
  code: string;
  // 会员激活码字段
  level?: MembershipLevel;
  durationDays?: number;
  // 产品激活码字段
  productSlug?: string;
  productDuration?: PurchaseType;
  // 通用字段
  codeType: CodeType;
  used: boolean;
  usedBy?: number;
  usedAt?: Date;
  adminId?: number;
  batchId?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface ActivationRequest {
  code: string;
}

export interface ActivationResponse {
  success: boolean;
  message: string;
  codeType?: CodeType;
  // 会员激活结果
  membershipLevel?: MembershipLevel;
  membershipExpiresAt?: string;
  // 产品激活结果
  productSlug?: string;
  productExpiresAt?: string;
}

export interface GenerateCodeRequest {
  codeType: CodeType;
  quantity: number;
  expiresInDays?: number;
  // 会员激活码
  membershipLevel?: MembershipLevel;
  // 产品激活码
  productSlug?: string;
  productDuration?: PurchaseType;
}

export interface GenerateCodeResponse {
  success: boolean;
  codes: string[];
  batchId: string;
  message: string;
}

// ============================================================================
// 试用相关
// ============================================================================

export interface TrialStatus {
  productSlug: string;
  productName: string;
  trialEnabled: boolean;
  trialRemaining: number;
  canUseTrial: boolean;
}

export interface UseTrialRequest {
  productSlug: string;
}

export interface UseTrialResponse {
  success: boolean;
  trialRemaining: number;
  message: string;
  redirectUrl?: string;
}

// ============================================================================
// 产品访问相关
// ============================================================================

export type AccessType = 'membership' | 'purchased' | 'trial' | 'none';

export interface ProductAccessResult {
  hasAccess: boolean;
  accessType: AccessType;
  trialRemaining?: number;
  expiresAt?: string;
  message?: string;
  redirectUrl?: string;
}

// ============================================================================
// API响应相关
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// 管理员相关
// ============================================================================

export interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  isSuper: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface AdminSession {
  id: number;
  username: string;
  email: string;
  role: string;
  isSuper: boolean;
}

// ============================================================================
// 统计相关
// ============================================================================

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  membershipDistribution: {
    none: number;
    monthly: number;
    quarterly: number;
    yearly: number;
    lifetime: number;
  };
  activationCodeStats: {
    total: number;
    used: number;
    unused: number;
  };
  productPurchaseStats: {
    total: number;
    thisMonth: number;
    revenue: number;
  };
}

// ============================================================================
// JWT相关
// ============================================================================

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  type: 'user' | 'admin';
  iat?: number;
  exp?: number;
}
