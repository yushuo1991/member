/**
 * 产品相关类型定义
 */

import { MembershipLevel } from './membership';

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  required_level: MembershipLevel;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductResponse {
  id: number;
  slug: string;
  name: string;
  description: string;
  requiredLevel: string;
  content?: string; // 仅在有权限时返回
  hasAccess: boolean;
  createdAt: string;
}

export interface ProductAccessResponse {
  hasAccess: boolean;
  product?: ProductResponse;
  requiredLevel?: string;
  currentLevel?: string;
  message?: string;
}
