/**
 * 会员等级定义和权限管理
 */

import { MembershipLevel, MembershipConfig } from '@/types/membership';

/**
 * 会员等级配置
 */
export const MEMBERSHIP_LEVELS: Record<MembershipLevel, MembershipConfig> = {
  none: {
    level: 'none',
    name: '免费用户',
    duration: null,
    price: 0,
    features: ['基础内容访问', '社区参与']
  },
  monthly: {
    level: 'monthly',
    name: '月度会员',
    duration: 30,
    price: 99,
    features: [
      '✅ 板块节奏系统访问权',
      '✅ 心理评估系统访问权',
      '📧 邮件客服支持',
      '📄 会员专属内容'
    ]
  },
  quarterly: {
    level: 'quarterly',
    name: '季度会员',
    duration: 90,
    price: 249,
    features: [
      '✅ 板块节奏系统访问权',
      '✅ 心理评估系统访问权',
      '✅ 交易复盘系统访问权',
      '⚡ 优先客服支持',
      '💰 15%续费折扣'
    ]
  },
  yearly: {
    level: 'yearly',
    name: '年度会员',
    duration: 365,
    price: 899,
    features: [
      '✅ 所有系统访问权限',
      '📊 专属投资策略分享',
      '⚡ VIP客服通道',
      '💰 25%续费折扣',
      '🏅 会员专属勋章'
    ]
  },
  lifetime: {
    level: 'lifetime',
    name: '终身会员',
    duration: null,
    price: 2999,
    features: [
      '✅ 终身所有系统访问',
      '👑 VIP专属标识',
      '🎁 优先体验新功能',
      '💼 一对一顾问服务',
      '🎯 定制化投资建议'
    ]
  }
};

/**
 * 产品定义
 */
export interface Product {
  slug: string;
  name: string;
  description: string;
  url: string;
  requiredLevel: MembershipLevel;
  icon: string;
  features: string[];
}

export const PRODUCTS: Product[] = [
  {
    slug: 'bk',
    name: '板块节奏系统',
    description: '专业的股市板块轮动分析工具，实时追踪热点板块',
    url: 'https://bk.yushuo.click',
    requiredLevel: 'monthly',
    icon: '📊',
    features: ['实时板块监控', '资金流向分析', '热点主题挖掘', '板块轮动预测']
  },
  {
    slug: 'xinli',
    name: '心理评估系统',
    description: '专业心理健康评估平台，提供科学的心理测评',
    url: 'https://xinli.yushuo.click',
    requiredLevel: 'monthly',
    icon: '🧠',
    features: ['专业量表测评', '心理健康报告', '个性化建议', '情绪趋势分析']
  },
  {
    slug: 'fuplan',
    name: '交易复盘系统',
    description: '系统化的交易复盘工具，帮助您总结经验',
    url: 'https://yushuo.click',
    requiredLevel: 'quarterly',
    icon: '📈',
    features: ['交易记录管理', '盈亏分析', '策略回测', '交易日志']
  }
];

/**
 * 根据slug获取产品
 */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

/**
 * 检查用户是否可以访问某个产品
 */
export function canAccessProduct(
  userLevel: MembershipLevel,
  productSlug: string,
  membershipExpiry?: Date | null
): boolean {
  const product = getProductBySlug(productSlug);
  if (!product) return false;

  return hasAccess(userLevel, product.requiredLevel, membershipExpiry);
}

/**
 * 会员等级权重（用于权限比较）
 */
const LEVEL_WEIGHTS: Record<MembershipLevel, number> = {
  none: 0,
  monthly: 1,
  quarterly: 2,
  yearly: 3,
  lifetime: 4
};

/**
 * 检查用户是否有访问特定等级内容的权限
 * @param userLevel 用户当前会员等级
 * @param requiredLevel 所需会员等级
 * @param membershipExpiry 会员过期时间（可选）
 * @returns 是否有权限
 */
export function hasAccess(
  userLevel: MembershipLevel,
  requiredLevel: MembershipLevel,
  membershipExpiry?: Date | null
): boolean {
  // 检查会员是否过期（终身会员除外）
  if (userLevel !== 'none' && userLevel !== 'lifetime' && membershipExpiry) {
    const now = new Date();
    if (now > membershipExpiry) {
      return false; // 会员已过期
    }
  }

  // 比较等级权重
  return LEVEL_WEIGHTS[userLevel] >= LEVEL_WEIGHTS[requiredLevel];
}

/**
 * 获取会员等级配置
 * @param level 会员等级
 * @returns 会员配置
 */
export function getMembershipConfig(level: MembershipLevel): MembershipConfig {
  return MEMBERSHIP_LEVELS[level];
}

/**
 * 计算会员到期时间
 * @param level 会员等级
 * @param startDate 开始时间（默认当前时间）
 * @returns 到期时间（终身会员返回null）
 */
export function calculateExpiry(
  level: MembershipLevel,
  startDate: Date = new Date()
): Date | null {
  const config = MEMBERSHIP_LEVELS[level];

  if (config.duration === null) {
    return null; // 终身会员
  }

  const expiry = new Date(startDate);
  expiry.setDate(expiry.getDate() + config.duration);
  return expiry;
}

/**
 * 检查会员等级是否有效
 * @param level 会员等级字符串
 * @returns 是否有效
 */
export function isValidMembershipLevel(level: string): level is MembershipLevel {
  return level in MEMBERSHIP_LEVELS;
}

/**
 * 获取所有会员等级列表
 * @returns 会员等级配置数组
 */
export function getAllMembershipLevels(): MembershipConfig[] {
  return Object.values(MEMBERSHIP_LEVELS);
}

/**
 * 延长会员时长
 * @param currentExpiry 当前过期时间
 * @param level 会员等级
 * @returns 新的过期时间
 */
export function extendMembership(
  currentExpiry: Date | null,
  level: MembershipLevel
): Date | null {
  const config = MEMBERSHIP_LEVELS[level];

  if (config.duration === null) {
    return null; // 终身会员
  }

  // 如果当前会员未过期，从过期时间延长；否则从当前时间开始
  const startDate = currentExpiry && currentExpiry > new Date()
    ? currentExpiry
    : new Date();

  const newExpiry = new Date(startDate);
  newExpiry.setDate(newExpiry.getDate() + config.duration);
  return newExpiry;
}
