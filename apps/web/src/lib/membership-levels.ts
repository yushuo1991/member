/**
 * 宇硕会员体系 - 会员等级定义和权限管理
 * 版本：v3.0
 */

// ============================================================================
// 类型定义
// ============================================================================

export type MembershipLevel = 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export interface MembershipConfig {
  level: MembershipLevel;
  name: string;
  duration: number | null; // 天数，null表示永久
  price: number;
  features: string[];
  color: string; // 徽章颜色
  description: string;
}

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
  openInNewWindow?: boolean;
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
// 会员等级配置
// ============================================================================

export const MEMBERSHIP_LEVELS: Record<MembershipLevel, MembershipConfig> = {
  none: {
    level: 'none',
    name: '免费用户',
    duration: null,
    price: 0,
    color: 'gray',
    description: '注册即可查看所有产品介绍',
    features: [
      '查看所有产品介绍',
      '板块节奏系统试用5次',
      '心理测评系统试用5次',
      '复盘系统试用5次'
    ]
  },
  monthly: {
    level: 'monthly',
    name: '月费会员',
    duration: 30,
    price: 300,
    color: 'blue',
    description: '适合初次体验的用户',
    features: [
      '✅ 学习圈（30天）',
      '✅ 板块助手使用权',
      '板块节奏系统试用5次',
      '心理测评系统试用5次',
      '复盘系统试用5次'
    ]
  },
  quarterly: {
    level: 'quarterly',
    name: '季度会员',
    duration: 90,
    price: 799,
    color: 'green',
    description: '性价比之选，深度学习',
    features: [
      '✅ 学习圈（90天）',
      '✅ 板块助手使用权',
      '✅ 板块节奏系统',
      '心理测评系统试用5次',
      '复盘系统试用5次'
    ]
  },
  yearly: {
    level: 'yearly',
    name: '年费会员',
    duration: 365,
    price: 2999,
    color: 'purple',
    description: '全年学习，系统提升',
    features: [
      '✅ 学习圈（365天）',
      '✅ 板块助手使用权',
      '✅ 板块节奏系统',
      '✅ 心理测评系统',
      '复盘系统试用5次'
    ]
  },
  lifetime: {
    level: 'lifetime',
    name: '陪伴营',
    duration: null,
    price: 0,
    color: 'gold',
    description: '不定期开放',
    features: [
      '✅ 学习圈（永久）',
      '✅ 板块助手使用权',
      '✅ 板块节奏系统',
      '✅ 心理测评系统',
      '✅ 复盘系统',
      '🎁 优先体验新功能'
    ]
  }
};

// ============================================================================
// 产品配置
// ============================================================================

export const PRODUCTS: Product[] = [
  // 会员专属产品
  {
    slug: 'circle',
    name: '学习圈',
    description: '私密学习圈，包含微信群和百度网盘资源',
    detailDescription: '加入宇硕学习圈，获取专属微信群邀请和百度网盘学习资源，与志同道合的交易者共同成长。',
    icon: '👥',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    requiredLevel: 'monthly',
    priceType: 'membership',
    trialEnabled: false,
    trialCount: 0,
    features: ['专属微信群', '百度网盘资源', '每日复盘分享', '实时交流答疑'],
    sortOrder: 1
  },
  {
    slug: 'bankuaizhushou',
    name: '板块助手',
    description: '智能板块分析软件，自动化复盘神器',
    detailDescription: '板块助手是一款专业的板块分析工具，帮助您快速识别热点板块，把握市场脉搏。',
    icon: '💻',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    requiredLevel: 'monthly',
    priceType: 'both',
    standalonePrices: { monthly: 30, yearly: 300 },
    trialEnabled: false,
    trialCount: 0,
    features: ['智能板块识别', '自动化复盘', '数据导出', '多平台支持'],
    sortOrder: 2
  },
  {
    slug: 'bk',
    name: '板块节奏系统',
    description: '涨停板追踪分析系统，实时追踪市场热点',
    detailDescription: '专业的涨停板追踪系统，实时监控市场热点，提供7日涨停数据分析，帮助您把握板块轮动节奏。',
    url: 'https://bk.yushuofupan.com',
    icon: '📊',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    requiredLevel: 'quarterly',
    priceType: 'membership',
    trialEnabled: true,
    trialCount: 5,
    features: ['实时涨停监控', '7日数据分析', '板块轮动追踪', '热点主题挖掘'],
    sortOrder: 3
  },
  {
    slug: 'xinli',
    name: '心理测评系统',
    description: '交易心理问卷评估，80个场景深度分析',
    detailDescription: '通过80个交易场景的心理问卷，全面评估您的交易心理状态，发现潜在的心理盲点。',
    url: 'https://xinli.yushuofupan.com',
    icon: '🧠',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop',
    requiredLevel: 'yearly',
    priceType: 'membership',
    trialEnabled: true,
    trialCount: 5,
    features: ['80个交易场景', '心理深度分析', '个性化建议', '持续跟踪评估'],
    sortOrder: 4
  },
  {
    slug: 'fuplan',
    name: '复盘系统',
    description: '交易复盘图鉴，系统化复盘工具',
    detailDescription: '专业的交易复盘平台，记录每日交易，分析市场情绪，帮助您系统化总结交易经验。',
    url: 'https://fupan.yushuofupan.com',
    openInNewWindow: true,
    icon: '📈',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    requiredLevel: 'lifetime',
    priceType: 'membership',
    trialEnabled: true,
    trialCount: 5,
    features: ['每日复盘记录', '市场情绪分析', '交易日志管理', '数据统计图表'],
    sortOrder: 5
  },
  // 单独购买产品
  {
    slug: 'qingxubiaoge_2022',
    name: '情绪表格(2022起)',
    description: '每日更新情绪数据，自2022年起',
    detailDescription: '包含自2022年以来的完整市场情绪数据，每日更新，帮助您追踪市场情绪变化。',
    icon: '📊',
    imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=300&fit=crop',
    requiredLevel: 'none',
    priceType: 'standalone',
    standalonePrices: { lifetime: 600 },
    trialEnabled: false,
    trialCount: 0,
    features: ['2022年至今数据', '每日更新', '多维度指标', '数据导出'],
    sortOrder: 6
  },
  {
    slug: 'qingxubiaoge_2018',
    name: '情绪表格(2018起)',
    description: '完整历史情绪数据，自2018年起',
    detailDescription: '包含自2018年以来的完整历史市场情绪数据，每日更新，提供更长期的市场情绪参考。',
    icon: '📊',
    imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=300&fit=crop',
    requiredLevel: 'none',
    priceType: 'standalone',
    standalonePrices: { lifetime: 999 },
    trialEnabled: false,
    trialCount: 0,
    features: ['2018年至今数据', '每日更新', '完整历史回溯', '数据导出'],
    sortOrder: 7
  },
  {
    slug: 'fupanbanmian',
    name: '复盘版面',
    description: '复盘版面工具，限时优惠',
    detailDescription: '专业的复盘版面工具，帮助您更好地组织和展示复盘内容。',
    icon: '📋',
    imageUrl: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=400&h=300&fit=crop',
    requiredLevel: 'none',
    priceType: 'standalone',
    standalonePrices: { lifetime: 300 },
    trialEnabled: false,
    trialCount: 0,
    features: ['专业版面设计', '快速生成', '模板丰富', '一键导出'],
    sortOrder: 8
  },
  {
    slug: 'jiandanfupan',
    name: '简单复盘',
    description: '简易复盘工具',
    detailDescription: '轻量级的复盘工具，适合快速记录每日交易心得。',
    icon: '📝',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
    requiredLevel: 'none',
    priceType: 'standalone',
    standalonePrices: { lifetime: 200 },
    trialEnabled: false,
    trialCount: 0,
    features: ['简洁易用', '快速记录', '历史查看', '数据统计'],
    sortOrder: 9
  }
];

// ============================================================================
// 会员等级权重（用于权限比较）
// ============================================================================

const LEVEL_WEIGHTS: Record<MembershipLevel, number> = {
  none: 0,
  monthly: 1,
  quarterly: 2,
  yearly: 3,
  lifetime: 4
};

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 根据slug获取产品
 */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

/**
 * 获取会员专属产品
 */
export function getMembershipProducts(): Product[] {
  return PRODUCTS.filter(p => p.priceType === 'membership' || p.priceType === 'both');
}

/**
 * 获取可单独购买的产品
 */
export function getStandaloneProducts(): Product[] {
  return PRODUCTS.filter(p => p.priceType === 'standalone' || p.priceType === 'both');
}

/**
 * 获取支持试用的产品
 */
export function getTrialProducts(): Product[] {
  return PRODUCTS.filter(p => p.trialEnabled);
}

/**
 * 检查用户是否有访问特定等级内容的权限
 */
export function hasAccess(
  userLevel: MembershipLevel,
  requiredLevel: MembershipLevel,
  membershipExpiry?: Date | null
): boolean {
  // 如果不需要会员（none），直接返回true
  if (requiredLevel === 'none') {
    return true;
  }

  // 检查会员是否过期（终身会员除外）
  if (userLevel !== 'none' && userLevel !== 'lifetime' && membershipExpiry) {
    const now = new Date();
    if (now > membershipExpiry) {
      return false;
    }
  }

  // 比较等级权重
  return LEVEL_WEIGHTS[userLevel] >= LEVEL_WEIGHTS[requiredLevel];
}

/**
 * 检查用户是否可以访问某个产品（通过会员权限）
 */
export function canAccessProductByMembership(
  userLevel: MembershipLevel,
  productSlug: string,
  membershipExpiry?: Date | null
): boolean {
  const product = getProductBySlug(productSlug);
  if (!product) return false;

  // 纯单独购买产品不能通过会员访问
  if (product.priceType === 'standalone') {
    return false;
  }

  return hasAccess(userLevel, product.requiredLevel, membershipExpiry);
}

/**
 * 获取会员等级配置
 */
export function getMembershipConfig(level: MembershipLevel): MembershipConfig {
  return MEMBERSHIP_LEVELS[level];
}

/**
 * 计算会员到期时间
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
 * 计算产品购买到期时间
 */
export function calculateProductExpiry(
  purchaseType: PurchaseType,
  startDate: Date = new Date()
): Date | null {
  if (purchaseType === 'lifetime') {
    return null; // 永久
  }

  const expiry = new Date(startDate);
  if (purchaseType === 'monthly') {
    expiry.setDate(expiry.getDate() + 30);
  } else if (purchaseType === 'yearly') {
    expiry.setDate(expiry.getDate() + 365);
  }
  return expiry;
}

/**
 * 检查会员等级是否有效
 */
export function isValidMembershipLevel(level: string): level is MembershipLevel {
  return level in MEMBERSHIP_LEVELS;
}

/**
 * 获取所有会员等级列表
 */
export function getAllMembershipLevels(): MembershipConfig[] {
  return Object.values(MEMBERSHIP_LEVELS);
}

/**
 * 延长会员时长
 */
export function extendMembership(
  currentExpiry: Date | null,
  level: MembershipLevel
): Date | null {
  const config = MEMBERSHIP_LEVELS[level];

  if (config.duration === null) {
    return null; // 终身会员
  }

  const startDate = currentExpiry && currentExpiry > new Date()
    ? currentExpiry
    : new Date();

  const newExpiry = new Date(startDate);
  newExpiry.setDate(newExpiry.getDate() + config.duration);
  return newExpiry;
}

/**
 * 获取产品价格显示文本
 */
export function getProductPriceText(product: Product): string {
  if (product.priceType === 'membership') {
    const config = MEMBERSHIP_LEVELS[product.requiredLevel];
    return `${config.name}及以上`;
  }

  if (product.standalonePrices) {
    const prices: string[] = [];
    if (product.standalonePrices.monthly) {
      prices.push(`¥${product.standalonePrices.monthly}/月`);
    }
    if (product.standalonePrices.yearly) {
      prices.push(`¥${product.standalonePrices.yearly}/年`);
    }
    if (product.standalonePrices.lifetime) {
      prices.push(`¥${product.standalonePrices.lifetime}买断`);
    }
    return prices.join(' / ');
  }

  return '免费';
}

/**
 * 获取会员等级徽章颜色
 */
export function getLevelBadgeColor(level: MembershipLevel): string {
  const colors: Record<MembershipLevel, string> = {
    none: 'bg-gray-100 text-gray-600',
    monthly: 'bg-blue-100 text-blue-600',
    quarterly: 'bg-green-100 text-green-600',
    yearly: 'bg-purple-100 text-purple-600',
    lifetime: 'bg-yellow-100 text-yellow-700'
  };
  return colors[level];
}
