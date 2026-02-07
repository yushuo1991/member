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
    name: '宇硕陪伴营 | 全体系交付，陪伴式学习',
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
    name: '宇硕学习圈 | 深挖底层原理，高效学习短线',
    description: '一站式成长圈：资讯、学习、实战、讨论、工具全覆盖',
    detailDescription: '学习圈已稳定运行第三年，把"学习路径、日常资讯、盘中盘后实战、情绪节点讨论、工具与知识库"做成体系化闭环，让学习阶段不再迷路。',
    icon: '👥',
    imageUrl: '/products/xuexiquan-cover.png',
    requiredLevel: 'monthly',
    priceType: 'membership',
    trialEnabled: false,
    trialCount: 0,
    features: ['定制学习路径', '盘前精选早报', '盘中实时解盘', '盘后深度复盘', '情绪节点讨论', '13000+知识库', '宇硕板块助手'],
    sortOrder: 1
  },
  {
    slug: 'bankuaizhushou',
    name: '宇硕板块助手 | 一键整理板块，聚焦核心个股',
    description: '智能板块分析软件，自动化复盘神器',
    detailDescription: '板块助手是一款专业的板块分析工具，帮助您快速识别热点板块，把握市场脉搏。',
    icon: '💻',
    imageUrl: '/products/bankuaizhushou-cover.png',
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
    description: '用联系和发展的视角看市场：把板块节奏"记下来"',
    detailDescription: '情绪短线难学的原因之一，是需要不断看联动。这个系统通过数据记录，把板块之间的联系、板块自身的发展、以及发展后的联系具象化呈现，让你用联系和发展的视角看市场。',
    url: 'https://bk.yushuofupan.com',
    icon: '📊',
    imageUrl: '/products/bk-cover.png',
    requiredLevel: 'quarterly',
    priceType: 'membership',
    trialEnabled: true,
    trialCount: 5,
    features: ['7天涨停排行', '板块梯队追踪', '后续5天溢价', '板块强度对比', 'K线/分时联动', '手机端适配'],
    sortOrder: 3
  },
  {
    slug: 'xinli',
    name: '心理测评系统',
    description: '交易心理问卷评估，80个场景深度分析',
    detailDescription: '通过80个交易场景的心理问卷，全面评估您的交易心理状态，发现潜在的心理盲点。',
    url: 'https://xinli.yushuofupan.com',
    icon: '🧠',
    imageUrl: '/products/xinli-cover.png',
    requiredLevel: 'yearly',
    priceType: 'membership',
    trialEnabled: true,
    trialCount: 5,
    features: ['80个交易场景', '心理深度分析', '个性化建议', '持续跟踪评估'],
    sortOrder: 4
  },
  {
    slug: 'fuplan',
    name: '宇硕复盘系统 | 流程化梳理市场，陪伴营专享',
    description: '交易复盘图鉴，系统化复盘工具',
    detailDescription: '专业的交易复盘平台，记录每日交易，分析市场情绪，帮助您系统化总结交易经验。',
    url: 'https://fupan.yushuofupan.com',
    openInNewWindow: true,
    icon: '📈',
    imageUrl: '/products/fuplan-cover.png',
    requiredLevel: 'lifetime',
    priceType: 'membership',
    trialEnabled: true,
    trialCount: 5,
    features: ['每日复盘记录', '市场情绪分析', '交易日志管理', '数据统计图表'],
    sortOrder: 5
  },
  {
    slug: 'peibanying',
    name: '🎓 宇硕陪伴营 | 全体系交付，陪伴式学习',
    description: '深度陪伴式学习计划，全体系产品访问权限',
    detailDescription: '宇硕陪伴营是一个深度陪伴式学习计划，提供全体系产品的永久访问权限。通过系统化的学习路径、实战指导和持续陪伴，帮助学员建立完整的交易体系。不定期开放，名额有限。',
    icon: '🎓',
    imageUrl: '/products/peibanying-cover.png',
    requiredLevel: 'lifetime',
    priceType: 'membership',
    trialEnabled: false,
    trialCount: 0,
    features: ['全体系产品永久访问', '陪伴式学习指导', '系统化学习路径', '实战经验分享', '优先体验新功能', '专属学习社群'],
    sortOrder: 5.5
  },
  // 单独购买产品
  {
    slug: 'qingxubiaoge',
    name: '情绪表格 | 精准判断情绪，捕捉市场龙头',
    description: '把情绪"看得见"：从数据到节奏，一套表格打通',
    detailDescription: '这套表格是长期复盘与实战中不断优化的记录体系，用于快速捕捉市场整体势能/动能、连板溢价、情绪阶段、高度演化与板块节奏。永久更新，随数据量积累价格逐年上涨。',
    icon: '📊',
    imageUrl: '/products/qingxubiaoge-cover.png',
    requiredLevel: 'none',
    priceType: 'standalone',
    standalonePrices: { lifetime: 600 },
    trialEnabled: false,
    trialCount: 0,
    features: ['8张核心表格', '市场势能/动能分析', '连板溢价追踪', '情绪阶段判断', '板块节奏观察', '永久更新'],
    sortOrder: 6
  },
  {
    slug: 'fupanbanmian',
    name: '复盘版面 | 高效复盘看盘，捉龙先人一步',
    description: '通达信复盘/看盘版面：让复盘与看盘更高效',
    detailDescription: '版面是交易体系与交易思路的"可视化呈现"，把你真正需要的关键信息固定在最顺手的位置，让你在复盘/看盘过程中快速捕捉重点。共28个版面，常用8个。',
    icon: '📋',
    imageUrl: '/products/fupanbanmian-cover.png',
    requiredLevel: 'none',
    priceType: 'standalone',
    standalonePrices: { lifetime: 300 },
    trialEnabled: false,
    trialCount: 0,
    features: ['共28个版面', '三版规划设计', '信息全面版', '核心精简版', '情绪组合版', '设计原则可复刻'],
    sortOrder: 8
  },
  {
    slug: 'jiandanfupan',
    name: '简单复盘 | 数据罗列，一网打尽',
    description: '简易复盘工具',
    detailDescription: '轻量级的复盘工具，适合快速记录每日交易心得。',
    icon: '📝',
    imageUrl: '/products/jiandanfupan-cover.png',
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
