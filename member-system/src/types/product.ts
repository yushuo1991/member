/**
 * 产品相关类型定义
 * 从 membership.ts 导出通用类型
 */

// 重新导出产品相关类型
export type {
  Product,
  PriceType,
  PurchaseType,
  StandalonePrices,
  ProductAccessResult,
  AccessType
} from './membership';

import { MembershipLevel, Product, AccessType } from './membership';

// 产品访问响应（API用）
export interface ProductAccessResponse {
  hasAccess: boolean;
  accessType: AccessType;
  product?: {
    slug: string;
    name: string;
    description: string;
    url?: string;
  };
  trialRemaining?: number;
  expiresAt?: string;
  requiredLevel?: MembershipLevel;
  currentLevel?: MembershipLevel;
  message?: string;
}

// 产品购买响应
export interface ProductPurchaseResponse {
  success: boolean;
  orderId?: string;
  message: string;
  expiresAt?: string;
}

// 产品列表响应
export interface ProductListResponse {
  products: Product[];
  total: number;
}
