/**
 * 用户注册 API
 * POST /api/auth/register
 *
 * 说明：
 * - 前端不再要求填写邮箱；若未提供邮箱，会自动生成占位邮箱写入数据库（满足 NOT NULL/UNIQUE 约束）。
 * - 登录仍以“账号(用户名)+密码”为主；邮箱登录兼容保留在后端。
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { hashPassword, isValidEmail, isValidUsername, isValidPassword, errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, recordAttempt, getClientIP } from '@/lib/rate-limiter';
import { RegisterRequest } from '@/types/user';

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

    const body: RegisterRequest = await request.json();
    const username = body.username?.trim();
    const password = body.password;
    const emailInput = body.email?.trim();
    const email = emailInput || toPlaceholderEmail(username || '');

    if (!username || !password) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse('账号和密码不能为空', 400);
    }

    if (!isValidUsername(username)) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse('用户名格式不正确（2-50字符，可用汉字/字母/数字/下划线）', 400);
    }

    if (emailInput && !isValidEmail(emailInput)) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse('邮箱格式不正确', 400);
    }

    if (!isValidPassword(password)) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse('密码格式不正确（至少6位）', 400);
    }

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
      const [result] = await connection.execute<any>(
        `INSERT INTO users (username, email, password_hash)
         VALUES (?, ?, ?)`,
        [username, email, passwordHash]
      );

      const userId = result.insertId;

      await connection.execute(
        `INSERT INTO memberships (user_id, level, expires_at)
         VALUES (?, 'none', NULL)`,
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
