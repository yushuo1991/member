/**
 * 用户注册 API
 * POST /api/auth/register
 *
 * 说明：
 * - 前端不再要求填写邮箱；若未提供邮箱，会自动生成占位邮箱写入数据库（满足 NOT NULL/UNIQUE 约束）。
 * - 登录仍以“账号(用户名)+密码”为主；邮箱登录兼容保留在后端。
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { hashPassword } from '@repo/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, recordAttempt, getClientIP } from '@/lib/rate-limiter';
import { RegisterSchema, validateRequest } from '@repo/utils';

function toPlaceholderEmail(username: string) {
  const safeLocalPart = username.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 64) || 'user';
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${safeLocalPart}.${suffix}@local.invalid`;
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const rateLimitCheck = await checkRateLimit(clientIP, 'register');
    if (!rateLimitCheck.isAllowed) {
      return errorResponse(
        `注册请求过于频繁，请在 ${rateLimitCheck.blockedUntil?.toLocaleTimeString('zh-CN')} 后重试`,
        429
      );
    }

    const body = await request.json();

    // Zod 验证
    const validation = validateRequest(RegisterSchema, body);
    if (!validation.success) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse(validation.error, 400);
    }

    const { username, password, email: emailInput } = validation.data;
    const email = emailInput || toPlaceholderEmail(username);

    const db = memberDatabase.getPool();

    const [existingUsername] = await db.execute<any[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existingUsername.length > 0) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse('用户名已被使用', 409);
    }

    if (emailInput) {
      const [existingEmail] = await db.execute<any[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (existingEmail.length > 0) {
        await recordAttempt(clientIP, 'register', false);
        return errorResponse('邮箱已被注册', 409);
      }
    }

    const passwordHash = await hashPassword(password);

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Step 1: 插入 users 表（试用次数字段有 DEFAULT 5，会自动初始化）
      const [result] = await connection.execute<any>(
        `INSERT INTO users (username, email, password_hash, trial_bk, trial_xinli, trial_fuplan)
         VALUES (?, ?, ?, 5, 5, 5)`,
        [username, email, passwordHash]
      );

      const userId = result.insertId;

      // Step 2: 创建 memberships 记录（免费会员，无过期时间）
      await connection.execute(
        `INSERT INTO memberships (user_id, level, expires_at, activated_at)
         VALUES (?, 'none', NULL, NOW())`,
        [userId]
      );

      await connection.commit();
      connection.release();

      await recordAttempt(clientIP, 'register', true);

      return successResponse(
        {
          id: userId,
          username,
          email,
          membershipLevel: 'none',
        },
        '注册成功'
      );
    } catch (txError) {
      await connection.rollback();
      connection.release();
      throw txError;
    }
  } catch (error) {
    console.error('[POST /api/auth/register] failed:', error);
    await recordAttempt(clientIP, 'register', false);
    return errorResponse('注册失败，请稍后重试', 500);
  }
}
