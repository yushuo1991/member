/**
 * 用户登录 API
 * POST /api/auth/login
 *
 * 说明：
 * - 以“账号(用户名)+密码”登录为主。
 * - 兼容旧的邮箱登录：仍支持传 email 字段。
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@repo/database';
import { verifyPassword, generateToken, createAuthCookie } from '@repo/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import { checkRateLimit, recordAttempt, resetRateLimit, getClientIP } from '@/lib/rate-limiter';
import { LoginRequest } from '@/types/user';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    const rateLimitCheck = await checkRateLimit(clientIP, 'login');
    if (!rateLimitCheck.isAllowed) {
      return errorResponse('登录尝试次数过多，请稍后重试', 429);
    }

    const body: LoginRequest = await request.json();
    const identifier = (body.username || body.identifier || body.email || '').trim();
    const { password } = body;

    if (!identifier || !password) {
      await recordAttempt(clientIP, 'login', false);
      return errorResponse('账号和密码不能为空', 400);
    }

    const db = memberDatabase.getPool();

    const [users] = await db.execute<any[]>(
      `SELECT u.id, u.username, u.email, u.password_hash,
              m.level as membership_level, m.expires_at as membership_expiry
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       WHERE u.username = ? OR u.email = ?`,
      [identifier, identifier]
    );

    if (users.length === 0) {
      await recordAttempt(clientIP, 'login', false);

      try {
        await db.execute(
          `INSERT INTO login_logs (user_id, email, ip_address, user_agent, success, failure_reason)
           VALUES (NULL, ?, ?, ?, FALSE, 'user_not_found')`,
          [identifier, clientIP, request.headers.get('user-agent') || '']
        );
      } catch {}

      return errorResponse('账号或密码错误', 401);
    }

    const user = users[0];

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      await recordAttempt(clientIP, 'login', false);

      try {
        await db.execute(
          `INSERT INTO login_logs (user_id, email, ip_address, user_agent, success, failure_reason)
           VALUES (?, ?, ?, ?, FALSE, 'invalid_password')`,
          [user.id, identifier, clientIP, request.headers.get('user-agent') || '']
        );
      } catch {}

      return errorResponse('账号或密码错误', 401);
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      type: 'user',
    });

    await resetRateLimit(clientIP, 'login');

    try {
      await db.execute(
        `INSERT INTO login_logs (user_id, email, ip_address, user_agent, success)
         VALUES (?, ?, ?, ?, TRUE)`,
        [user.id, user.email, clientIP, request.headers.get('user-agent') || '']
      );
    } catch {}

    const response = successResponse(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          membershipLevel: user.membership_level,
          membershipExpiry: user.membership_expiry,
        },
        token,
      },
      '登录成功'
    );

    response.headers.set('Set-Cookie', createAuthCookie(token, 'auth_token'));
    return response;
  } catch (error) {
    console.error('[POST /api/auth/login] failed:', error);
    await recordAttempt(clientIP, 'login', false);
    return errorResponse('登录失败，请稍后重试', 500);
  }
}

