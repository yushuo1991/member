/**
 * 用户注册API
 * POST /api/auth/register
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { hashPassword, errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, recordAttempt, getClientIP } from '@/lib/rate-limiter';
import { registerSchema, validate } from '@/lib/validation';

const debug = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    // 限流检查
    const rateLimitCheck = await checkRateLimit(clientIP, 'register');
    if (!rateLimitCheck.isAllowed) {
      return errorResponse(
        `注册请求过于频繁，请在${rateLimitCheck.blockedUntil?.toLocaleTimeString('zh-CN')}后重试`,
        429
      );
    }

    // 解析和验证请求体（使用Zod）
    const body = await request.json();
    const validation = validate(registerSchema, body);

    if (!validation.success) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse(validation.errors.join(', '), 400);
    }

    const { username, email, password } = validation.data;

    const db = memberDatabase.getPool();

    // 检查用户名是否已存在
    const [existingUsername] = await db.execute<any[]>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsername.length > 0) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse('用户名已被使用', 409);
    }

    // 检查邮箱是否已存在
    const [existingEmail] = await db.execute<any[]>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      await recordAttempt(clientIP, 'register', false);
      return errorResponse('邮箱已被注册', 409);
    }

    // 加密密码
    const passwordHash = await hashPassword(password);

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 创建用户
      const [result] = await connection.execute<any>(
        `INSERT INTO users (username, email, password_hash)
         VALUES (?, ?, ?)`,
        [username, email, passwordHash]
      );

      const userId = result.insertId;

      // 为新用户创建默认会员记录（未激活状态）
      await connection.execute(
        `INSERT INTO memberships (user_id, level, expires_at)
         VALUES (?, 'none', NULL)`,
        [userId]
      );

      // 提交事务
      await connection.commit();
      connection.release();

      // 记录成功尝试
      await recordAttempt(clientIP, 'register', true);

      // 返回用户信息（不包含密码）
      return successResponse(
        {
          id: userId,
          username,
          email,
          membershipLevel: 'none'
        },
        '注册成功'
      );
    } catch (txError) {
      // 回滚事务
      await connection.rollback();
      connection.release();
      throw txError;
    }

  } catch (error) {
    if (debug) console.error('[注册API] 注册失败:', error);
    await recordAttempt(clientIP, 'register', false);
    return errorResponse('注册失败，请稍后重试', 500);
  }
}
