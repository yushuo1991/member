/**
 * 产品试用API
 * POST /api/products/trial/[slug] - 使用一次试用机会
 * GET /api/products/trial/[slug] - 获取试用状态
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyUserToken } from '@repo/auth';
import { getProductBySlug } from '@/lib/membership-levels';
import {
  isTrialSupported,
  getTrialFieldName,
  getProductRedirectUrl,
  createTrialResult
} from '@/lib/trial-service';
import { errorResponse, successResponse } from '@repo/auth';
import { TrialProductSchema, validateRequest } from '@repo/utils';
import { checkRateLimit, recordAttempt } from '@/lib/rate-limiter';
import * as Sentry from '@sentry/nextjs';

// 自动添加缺失的试用字段（如果数据库迁移未执行）
async function ensureTrialFieldsExist(db: any) {
  const fields = [
    { name: 'trial_bk', comment: '板块节奏系统试用次数' },
    { name: 'trial_xinli', comment: '心理测评系统试用次数' },
    { name: 'trial_fuplan', comment: '复盘系统试用次数' }
  ];
  for (const field of fields) {
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN ${field.name} INT DEFAULT 5 COMMENT '${field.comment}'`);
      console.log(`[试用API] 自动添加字段: ${field.name}`);
    } catch (e: any) {
      // 字段已存在，忽略错误 (ER_DUP_FIELDNAME)
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.error(`[试用API] 添加字段 ${field.name} 失败:`, e.message);
      }
    }
  }

  // 确保 trial_logs 表存在
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trial_logs (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
        user_id INT UNSIGNED NOT NULL COMMENT '用户ID',
        product_slug VARCHAR(50) NOT NULL COMMENT '产品标识',
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '使用时间',
        ip_address VARCHAR(45) COMMENT 'IP地址',
        user_agent TEXT COMMENT '用户代理',
        INDEX idx_user_product (user_id, product_slug),
        INDEX idx_used_at (used_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='试用日志表'
    `);
  } catch (e: any) {
    // 表已存在，忽略
    if (e.code !== 'ER_TABLE_EXISTS_ERROR') {
      console.error('[试用API] 创建 trial_logs 表失败:', e.message);
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

  try {
    const { slug } = await params;

    // 验证产品slug
    const validation = validateRequest(TrialProductSchema, { slug });
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    // 验证用户Token
    const { isValid, user } = verifyUserToken(request);

    if (!isValid || !user) {
      return errorResponse('未授权访问，请先登录', 401);
    }

    // 速率限制检查 - 每个用户每15分钟最多50次试用请求
    const rateLimitKey = `trial:${user.userId}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, 'activate');

    if (!rateLimitResult.isAllowed) {
      Sentry.captureMessage('Trial rate limit exceeded', {
        level: 'warning',
        tags: { userId: user.userId, product: slug },
        extra: { ipAddress }
      });
      return errorResponse('请求过于频繁，请稍后再试', 429);
    }

    // 记录请求
    await recordAttempt(rateLimitKey, 'activate', true);

    // 获取产品配置
    const productConfig = getProductBySlug(slug);
    if (!productConfig) {
      return errorResponse('产品不存在', 404);
    }

    // 检查产品是否支持试用
    if (!productConfig.trialEnabled || !isTrialSupported(slug)) {
      return errorResponse('该产品不支持试用', 400);
    }

    const trialField = getTrialFieldName(slug);
    if (!trialField) {
      return errorResponse('试用配置错误', 500);
    }

    const db = memberDatabase.getPool();

    // 获取用户当前试用次数
    let users: any[];
    try {
      [users] = await db.execute<any[]>(
        `SELECT ${trialField} as trial_count FROM users WHERE id = ?`,
        [user.userId]
      );
    } catch (dbError: any) {
      // 如果字段不存在，尝试自动添加
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        console.log('[试用API] 数据库字段不存在，尝试自动迁移...');
        await ensureTrialFieldsExist(db);

        // 重新查询
        [users] = await db.execute<any[]>(
          `SELECT ${trialField} as trial_count FROM users WHERE id = ?`,
          [user.userId]
        );
      } else {
        throw dbError;
      }
    }

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const currentTrialCount = users[0].trial_count ?? 5; // 默认5次

    if (currentTrialCount <= 0) {
      return errorResponse('试用次数已用完', 400);
    }

    // 扣减试用次数
    await db.execute(
      `UPDATE users SET ${trialField} = ${trialField} - 1 WHERE id = ? AND ${trialField} > 0`,
      [user.userId]
    );

    // 记录试用日志
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      await db.execute(
        `INSERT INTO trial_logs (user_id, product_slug, ip_address, user_agent)
         VALUES (?, ?, ?, ?)`,
        [user.userId, slug, ipAddress, userAgent]
      );
    } catch (logError: any) {
      // 如果表不存在，尝试创建
      if (logError.code === 'ER_NO_SUCH_TABLE') {
        await ensureTrialFieldsExist(db);
        await db.execute(
          `INSERT INTO trial_logs (user_id, product_slug, ip_address, user_agent)
           VALUES (?, ?, ?, ?)`,
          [user.userId, slug, ipAddress, userAgent]
        );
      } else {
        console.error('[试用API] 记录试用日志失败:', logError.message);
        // 不因为日志记录失败而阻止试用
      }
    }

    const newTrialCount = currentTrialCount - 1;
    const redirectUrl = getProductRedirectUrl(slug);

    console.log(`[试用API] 用户 ${user.userId} 试用 ${slug} 成功，剩余 ${newTrialCount} 次，跳转到 ${redirectUrl}`);

    return successResponse(
      createTrialResult(
        true,
        newTrialCount,
        `试用成功，剩余${newTrialCount}次`,
        redirectUrl
      ),
      '试用成功'
    );

  } catch (error) {
    console.error('[试用API] 试用失败:', error);
    Sentry.captureException(error, {
      tags: { api_route: '/api/products/trial/[slug]', method: 'POST' },
      extra: { ipAddress }
    });
    return errorResponse('试用操作失败', 500);
  }
}

// GET - 获取试用状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 验证用户Token
    const { isValid, user } = verifyUserToken(request);

    if (!isValid || !user) {
      return errorResponse('未授权访问，请先登录', 401);
    }

    // 获取产品配置
    const productConfig = getProductBySlug(slug);
    if (!productConfig) {
      return errorResponse('产品不存在', 404);
    }

    // 检查产品是否支持试用
    if (!productConfig.trialEnabled || !isTrialSupported(slug)) {
      return successResponse({
        productSlug: slug,
        productName: productConfig.name,
        trialEnabled: false,
        trialRemaining: 0,
        canUseTrial: false
      }, '该产品不支持试用');
    }

    const trialField = getTrialFieldName(slug);
    if (!trialField) {
      return errorResponse('试用配置错误', 500);
    }

    const db = memberDatabase.getPool();

    // 获取用户当前试用次数
    let users: any[];
    try {
      [users] = await db.execute<any[]>(
        `SELECT ${trialField} as trial_count FROM users WHERE id = ?`,
        [user.userId]
      );
    } catch (dbError: any) {
      // 如果字段不存在，尝试自动添加
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        console.log('[试用API] 数据库字段不存在，尝试自动迁移...');
        await ensureTrialFieldsExist(db);

        // 重新查询
        [users] = await db.execute<any[]>(
          `SELECT ${trialField} as trial_count FROM users WHERE id = ?`,
          [user.userId]
        );
      } else {
        throw dbError;
      }
    }

    if (users.length === 0) {
      return errorResponse('用户不存在', 404);
    }

    const trialRemaining = users[0].trial_count ?? 5; // 默认5次

    return successResponse({
      productSlug: slug,
      productName: productConfig.name,
      trialEnabled: true,
      trialRemaining,
      canUseTrial: trialRemaining > 0
    }, '试用状态获取成功');

  } catch (error) {
    console.error('[试用API] 获取状态失败:', error);
    Sentry.captureException(error, {
      tags: { api_route: '/api/products/trial/[slug]', method: 'GET' }
    });
    return errorResponse('获取试用状态失败', 500);
  }
}
