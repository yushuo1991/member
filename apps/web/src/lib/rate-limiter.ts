/**
 * 限流器 - 防止暴力破解和滥用
 * 基于IP地址和操作类型进行限流
 */

import { memberDatabase } from './database';
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  maxAttempts: number; // 最大尝试次数
  windowMinutes: number; // 时间窗口（分钟）
  blockDurationMinutes: number; // 封禁时长（分钟）
}

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
  const db = memberDatabase.getPool();

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
    console.error('[限流器] 检查限流失败:', error);
    // 发生错误时允许访问（避免影响正常用户）
    return { isAllowed: true };
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
  const db = memberDatabase.getPool();

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
    console.error('[限流器] 记录尝试失败:', error);
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
  const db = memberDatabase.getPool();

  try {
    await db.execute(
      `DELETE FROM rate_limits WHERE ip_address = ? AND action_type = ?`,
      [ipAddress, actionType]
    );
  } catch (error) {
    console.error('[限流器] 重置限流记录失败:', error);
  }
}
