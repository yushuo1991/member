/**
 * 宇硕会员体系 - 试用服务模块
 * 处理产品试用功能
 */

import { getProductBySlug } from './membership-levels';

// 试用产品的slug到数据库字段的映射
const TRIAL_FIELD_MAP: Record<string, string> = {
  'bankuaijiezou': 'trial_bk',
  'xinli': 'trial_xinli',
  'fuplan': 'trial_fuplan'
};

// 支持试用的产品列表
export const TRIAL_PRODUCTS = ['bankuaijiezou', 'xinli', 'fuplan'];

export interface TrialStatus {
  productSlug: string;
  productName: string;
  trialEnabled: boolean;
  trialRemaining: number;
  canUseTrial: boolean;
}

export interface UseTrialResult {
  success: boolean;
  trialRemaining: number;
  message: string;
  redirectUrl?: string;
}

/**
 * 获取试用字段名
 */
export function getTrialFieldName(productSlug: string): string | null {
  return TRIAL_FIELD_MAP[productSlug] || null;
}

/**
 * 检查产品是否支持试用
 */
export function isTrialSupported(productSlug: string): boolean {
  return TRIAL_PRODUCTS.includes(productSlug);
}

/**
 * 获取用户的试用状态
 */
export function getTrialStatus(
  productSlug: string,
  trialRemaining: number
): TrialStatus {
  const product = getProductBySlug(productSlug);

  return {
    productSlug,
    productName: product?.name || productSlug,
    trialEnabled: isTrialSupported(productSlug),
    trialRemaining,
    canUseTrial: isTrialSupported(productSlug) && trialRemaining > 0
  };
}

/**
 * 生成试用使用结果
 */
export function createTrialResult(
  success: boolean,
  trialRemaining: number,
  message: string,
  redirectUrl?: string
): UseTrialResult {
  return {
    success,
    trialRemaining,
    message,
    redirectUrl
  };
}

/**
 * 获取产品的重定向URL
 */
export function getProductRedirectUrl(productSlug: string): string {
  const product = getProductBySlug(productSlug);
  return product?.url || `/products/${productSlug}`;
}

/**
 * 格式化试用次数显示
 */
export function formatTrialCount(remaining: number, total: number = 5): string {
  if (remaining <= 0) {
    return '试用已用完';
  }
  return `剩余${remaining}/${total}次试用`;
}

/**
 * 获取试用按钮文本
 */
export function getTrialButtonText(trialRemaining: number): string {
  if (trialRemaining <= 0) {
    return '试用已用完';
  }
  return `免费试用（剩${trialRemaining}次）`;
}

/**
 * 检查是否可以使用试用
 */
export function canUseTrial(productSlug: string, trialRemaining: number): boolean {
  return isTrialSupported(productSlug) && trialRemaining > 0;
}
