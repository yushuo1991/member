/**
 * 限流器 - 防止暴力破解和滥用
 * 基于IP地址和操作类型进行限流
 */

import { MemberDatabase } from '@repo/database';
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  maxAttempts: number; // 最大尝试次数
  windowMinutes: number; // 时间窗口（分钟）
  blockDurationMinutes: number; // 封禁时长（分钟）
}

// 内存缓存作为降级方案
interface MemoryCacheEntry {
  attemptCount: number;
  firstAttemptAt: Date;
  blockedUntil?: Date;
}

// 错误计数器
interface ErrorCounter {
  count: number;
  lastErrorAt: Date;
}

const memoryCache = new Map<string, MemoryCacheEntry>();
const errorCounters = new Map<string, ErrorCounter>();

// 错误阈值配置
const ERROR_THRESHOLD = 3; // 连续错误次数阈值
const ERROR_WINDOW_MS = 60000; // 错误窗口时间（1分钟）
const FALLBACK_MODE_DURATION_MS = 300000; // 降级模式持续时间（5分钟）

// 默认限流配置
const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMinutes: 15,
  blockDurationMinutes: 30
};

// 不同操作的限流配置
const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 100, // 增加到100次，方便测试
    windowMinutes: 15,
    blockDurationMinutes: 5 // 减少封禁时间到5分钟
  },
  register: {
    // Allow more signups from the same IP (e.g. testing).
    maxAttempts: 50,
    windowMinutes: 30,
    blockDurationMinutes: 5
  },
  activate: {
    maxAttempts: 50,
    windowMinutes: 15,
    blockDurationMinutes: 5
  }
};

/**
 * 生成缓存键
 */
function getCacheKey(ipAddress: string, actionType: string): string {
  return `${ipAddress}:${actionType}`;
}

/**
 * 记录数据库错误
 */
function recordDatabaseError(actionType: string): void {
  const key = `db_error:${actionType}`;
  const now = new Date();
  const counter = errorCounters.get(key);

  if (!counter) {
    errorCounters.set(key, { count: 1, lastErrorAt: now });
    return;
  }

  // 如果错误窗口已过期，重置计数
  if (now.getTime() - counter.lastErrorAt.getTime() > ERROR_WINDOW_MS) {
    errorCounters.set(key, { count: 1, lastErrorAt: now });
  } else {
    counter.count++;
    counter.lastErrorAt = now;
  }
}

/**
 * 检查是否应该使用降级模式
 */
function shouldUseFallbackMode(actionType: string): boolean {
  const key = `db_error:${actionType}`;
  const counter = errorCounters.get(key);

  if (!counter) return false;

  const now = new Date();
  const timeSinceLastError = now.getTime() - counter.lastErrorAt.getTime();

  // 如果在错误窗口内且错误次数超过阈值，使用降级模式
  if (timeSinceLastError < FALLBACK_MODE_DURATION_MS && counter.count >= ERROR_THRESHOLD) {
    return true;
  }

  // 如果已经超过降级模式持续时间，清除错误计数
  if (timeSinceLastError > FALLBACK_MODE_DURATION_MS) {
    errorCounters.delete(key);
  }

  return false;
}

/**
 * 使用内存缓存检查限流
 */
function checkRateLimitFromMemory(
  ipAddress: string,
  actionType: string,
  config: RateLimitConfig
): {
  isAllowed: boolean;
  remainingAttempts?: number;
  blockedUntil?: Date;
  resetAt?: Date;
} {
  const cacheKey = getCacheKey(ipAddress, actionType);
  const cached = memoryCache.get(cacheKey);
  const now = new Date();

  if (!cached) {
    return {
      isAllowed: true,
      remainingAttempts: config.maxAttempts - 1
    };
  }

  // 检查是否在封禁期
  if (cached.blockedUntil && cached.blockedUntil > now) {
    return {
      isAllowed: false,
      blockedUntil: cached.blockedUntil
    };
  }

  // 检查时间窗口
  const windowEnd = new Date(cached.firstAttemptAt.getTime() + config.windowMinutes * 60 * 1000);

  if (now > windowEnd) {
    // 窗口已过期，允许访问
    return {
      isAllowed: true,
      remainingAttempts: config.maxAttempts - 1,
      resetAt: new Date(now.getTime() + config.windowMinutes * 60 * 1000)
    };
  }

  // 检查尝试次数
  if (cached.attemptCount >= config.maxAttempts) {
    return {
      isAllowed: false,
      blockedUntil: new Date(now.getTime() + config.blockDurationMinutes * 60 * 1000)
    };
  }

  return {
    isAllowed: true,
    remainingAttempts: config.maxAttempts - cached.attemptCount - 1,
    resetAt: windowEnd
  };
}

/**
 * 更新内存缓存
 */
function updateMemoryCache(
  ipAddress: string,
  actionType: string,
  config: RateLimitConfig
): void {
  const cacheKey = getCacheKey(ipAddress, actionType);
  const cached = memoryCache.get(cacheKey);
  const now = new Date();

  if (!cached) {
    memoryCache.set(cacheKey, {
      attemptCount: 1,
      firstAttemptAt: now
    });
    return;
  }

  const windowEnd = new Date(cached.firstAttemptAt.getTime() + config.windowMinutes * 60 * 1000);

  if (now > windowEnd) {
    // 窗口已过期，重置
    memoryCache.set(cacheKey, {
      attemptCount: 1,
      firstAttemptAt: now
    });
  } else {
    // 增加计数
    cached.attemptCount++;

    // 如果达到最大尝试次数，设置封禁时间
    if (cached.attemptCount >= config.maxAttempts) {
      cached.blockedUntil = new Date(now.getTime() + config.blockDurationMinutes * 60 * 1000);
    }
  }
}

/**
 * 从请求中获取客户端IP地址
 * @param request Next.js请求对象
 * @returns IP地址字符串
 */
export function getClientIP(request: NextRequest): string {
  // 尝试从各种头部获取真实IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // 回退到连接IP（开发环境）
  return request.ip || '127.0.0.1';
}

/**
 * 检查IP是否被限流
 * @param ipAddress IP地址
 * @param actionType 操作类型
 * @returns 限流检查结果
 */
export async function checkRateLimit(
  ipAddress: string,
  actionType: string
): Promise<{
  isAllowed: boolean;
  remainingAttempts?: number;
  blockedUntil?: Date;
  resetAt?: Date;
}> {
  const config = RATE_LIMIT_CONFIGS[actionType] || DEFAULT_CONFIG;

  // 检查是否应该使用降级模式（内存缓存）
  if (shouldUseFallbackMode(actionType)) {
    console.warn(`[限流器] 使用降级模式（内存缓存）检查限流: ${actionType}`);
    return checkRateLimitFromMemory(ipAddress, actionType, config);
  }

  const db = MemberDatabase.getInstance().getPool();

  try {
    // 查询当前IP的限流记录
    const [rows] = await db.execute<any[]>(
      `SELECT * FROM rate_limits WHERE ip_address = ? AND action_type = ?`,
      [ipAddress, actionType]
    );

    const now = new Date();

    // 没有记录，允许访问
    if (rows.length === 0) {
      return {
        isAllowed: true,
        remainingAttempts: config.maxAttempts - 1
      };
    }

    const record = rows[0];

    // 检查是否在封禁期
    if (record.blocked_until && new Date(record.blocked_until) > now) {
      return {
        isAllowed: false,
        blockedUntil: new Date(record.blocked_until)
      };
    }

    // 检查时间窗口是否过期
    const windowStart = new Date(record.first_attempt_at);
    const windowEnd = new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000);

    if (now > windowEnd) {
      // 时间窗口已过期，重置计数
      return {
        isAllowed: true,
        remainingAttempts: config.maxAttempts - 1,
        resetAt: new Date(now.getTime() + config.windowMinutes * 60 * 1000)
      };
    }

    // 检查是否超过最大尝试次数
    if (record.attempt_count >= config.maxAttempts) {
      return {
        isAllowed: false,
        blockedUntil: new Date(now.getTime() + config.blockDurationMinutes * 60 * 1000)
      };
    }

    // 允许访问
    return {
      isAllowed: true,
      remainingAttempts: config.maxAttempts - record.attempt_count - 1,
      resetAt: windowEnd
    };

  } catch (error) {
    console.error('[限流器] 数据库查询失败，切换到内存缓存:', error);

    // 记录数据库错误
    recordDatabaseError(actionType);

    // 使用内存缓存作为降级方案
    return checkRateLimitFromMemory(ipAddress, actionType, config);
  }
}

/**
 * 记录访问尝试
 * @param ipAddress IP地址
 * @param actionType 操作类型
 * @param success 是否成功
 */
export async function recordAttempt(
  ipAddress: string,
  actionType: string,
  success: boolean
): Promise<void> {
  const config = RATE_LIMIT_CONFIGS[actionType] || DEFAULT_CONFIG;

  // 先更新内存缓存（无论数据库是否可用）
  updateMemoryCache(ipAddress, actionType, config);

  // 如果在降级模式，只使用内存缓存
  if (shouldUseFallbackMode(actionType)) {
    console.warn(`[限流器] 降级模式：仅使用内存缓存记录尝试: ${actionType}`);
    return;
  }

  const db = MemberDatabase.getInstance().getPool();

  try {
    const [rows] = await db.execute<any[]>(
      `SELECT * FROM rate_limits WHERE ip_address = ? AND action_type = ?`,
      [ipAddress, actionType]
    );

    const now = new Date();

    if (rows.length === 0) {
      // 创建新记录
      await db.execute(
        `INSERT INTO rate_limits (ip_address, action_type, attempt_count, first_attempt_at, last_attempt_at)
         VALUES (?, ?, 1, ?, ?)`,
        [ipAddress, actionType, now, now]
      );
      return;
    }

    const record = rows[0];
    const windowStart = new Date(record.first_attempt_at);
    const windowEnd = new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000);

    if (now > windowEnd) {
      // 时间窗口已过期，重置记录
      await db.execute(
        `UPDATE rate_limits
         SET attempt_count = 1, first_attempt_at = ?, last_attempt_at = ?, blocked_until = NULL
         WHERE ip_address = ? AND action_type = ?`,
        [now, now, ipAddress, actionType]
      );
    } else {
      const newCount = record.attempt_count + 1;
      let blockedUntil = null;

      // 如果达到最大尝试次数，设置封禁时间
      if (newCount >= config.maxAttempts && !success) {
        blockedUntil = new Date(now.getTime() + config.blockDurationMinutes * 60 * 1000);
      }

      await db.execute(
        `UPDATE rate_limits
         SET attempt_count = ?, last_attempt_at = ?, blocked_until = ?
         WHERE ip_address = ? AND action_type = ?`,
        [newCount, now, blockedUntil, ipAddress, actionType]
      );
    }

  } catch (error) {
    console.error('[限流器] 数据库记录失败，已使用内存缓存:', error);
    // 记录数据库错误
    recordDatabaseError(actionType);
    // 内存缓存已在函数开始时更新，无需额外操作
  }
}

/**
 * 重置限流记录（成功登录后清除）
 * @param ipAddress IP地址
 * @param actionType 操作类型
 */
export async function resetRateLimit(
  ipAddress: string,
  actionType: string
): Promise<void> {
  const db = MemberDatabase.getInstance().getPool();

  try {
    await db.execute(
      `DELETE FROM rate_limits WHERE ip_address = ? AND action_type = ?`,
      [ipAddress, actionType]
    );
  } catch (error) {
    console.error('[限流器] 重置限流记录失败:', error);
  }
}
