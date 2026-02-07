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
import { LoginSchema, validateRequest, createLogger } from '@repo/utils';

const logger = createLogger('API:Auth:Login');

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  try {
    // 记录请求
    logger.logRequest({
      method: 'POST',
      url: '/api/auth/login',
      ip: clientIP,
    });

    const rateLimitCheck = await checkRateLimit(clientIP, 'login');
    if (!rateLimitCheck.isAllowed) {
      logger.warn('登录请求被限流', { clientIP, remainingAttempts: rateLimitCheck.remainingAttempts });
      return errorResponse('登录尝试次数过多，请稍后重试', 429);
    }

    const body = await request.json();

    // Zod 验证
    const validation = validateRequest(LoginSchema, body);
    if (!validation.success) {
      await recordAttempt(clientIP, 'login', false);
      logger.warn('登录请求验证失败', { error: validation.error, clientIP });
      return errorResponse(validation.error, 400);
    }

    const { username, identifier, email, password } = validation.data;
    const loginIdentifier = (username || identifier || email || '').trim();

    logger.debug('处理登录请求', { loginIdentifier, clientIP });

    const db = memberDatabase.getPool();

    const [users] = await db.execute<any[]>(
      `SELECT u.id, u.username, u.email, u.password_hash,
              m.level as membership_level, m.expires_at as membership_expiry
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       WHERE (u.username = ? OR u.email = ?) AND u.deleted_at IS NULL`,
      [loginIdentifier, loginIdentifier]
    );

    if (users.length === 0) {
      await recordAttempt(clientIP, 'login', false);

      try {
        await db.execute(
          `INSERT INTO login_logs (user_id, email, ip_address, user_agent, success, failure_reason)
           VALUES (NULL, ?, ?, ?, FALSE, 'user_not_found')`,
          [loginIdentifier, clientIP, request.headers.get('user-agent') || '']
        );
      } catch {}

      logger.warn('登录失败：用户不存在', { loginIdentifier, clientIP });
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
          [user.id, loginIdentifier, clientIP, request.headers.get('user-agent') || '']
        );
      } catch {}

      logger.warn('登录失败：密码错误', { userId: user.id, loginIdentifier, clientIP });
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

    // 记录认证事件
    logger.logAuth('login', user.id, {
      username: user.username,
      email: user.email,
      ip: clientIP,
      membershipLevel: user.membership_level,
    });

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

    // 记录响应
    logger.logResponse({
      method: 'POST',
      url: '/api/auth/login',
      statusCode: 200,
      duration: Date.now() - startTime,
      userId: user.id,
    });

    response.headers.set('Set-Cookie', createAuthCookie(token, 'auth_token'));
    return response;
  } catch (error) {
    logger.error('登录处理失败', error as Error, { clientIP });
    await recordAttempt(clientIP, 'login', false);

    logger.logResponse({
      method: 'POST',
      url: '/api/auth/login',
      statusCode: 500,
      duration: Date.now() - startTime,
    });

    return errorResponse('登录失败，请稍后重试', 500);
  }
}

