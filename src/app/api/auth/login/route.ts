/**
 * 用户登录API
 * POST /api/auth/login
 */

import { NextRequest } from 'next/server';
import { memberDatabase } from '@/lib/database';
import { verifyPassword, errorResponse, successResponse } from '@/lib/utils';
import { generateToken, createAuthCookie } from '@/lib/auth-middleware';
import { checkRateLimit, recordAttempt, resetRateLimit, getClientIP } from '@/lib/rate-limiter';
import { loginSchema, validate } from '@/lib/validation';

const debug = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  try {
    // 限流检查
    const rateLimitCheck = await checkRateLimit(clientIP, 'login');
    if (!rateLimitCheck.isAllowed) {
      return errorResponse(
        `登录尝试次数过多，请在${rateLimitCheck.blockedUntil?.toLocaleTimeString('zh-CN')}后重试`,
        429
      );
    }

    // 解析和验证请求体（使用Zod）
    const body = await request.json();
    const validation = validate(loginSchema, body);

    if (!validation.success) {
      await recordAttempt(clientIP, 'login', false);
      return errorResponse(validation.errors.join(', '), 400);
    }

    const { email, password } = validation.data;

    const db = memberDatabase.getPool();

    // 查询用户和会员信息
    const [users] = await db.execute<any[]>(
      `SELECT u.id, u.username, u.email, u.password_hash,
              m.level as membership_level, m.expires_at as membership_expiry
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      await recordAttempt(clientIP, 'login', false);

      // 记录登录日志（失败）
      await db.execute(
        `INSERT INTO login_logs (user_id, email, ip_address, user_agent, success, failure_reason)
         VALUES (NULL, ?, ?, ?, FALSE, '用户不存在')`,
        [email, clientIP, request.headers.get('user-agent') || '']
      );

      return errorResponse('邮箱或密码错误', 401);
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      await recordAttempt(clientIP, 'login', false);

      // 记录登录日志（失败）
      await db.execute(
        `INSERT INTO login_logs (user_id, email, ip_address, user_agent, success, failure_reason)
         VALUES (?, ?, ?, ?, FALSE, '密码错误')`,
        [user.id, email, clientIP, request.headers.get('user-agent') || '']
      );

      return errorResponse('邮箱或密码错误', 401);
    }

    // 生成JWT Token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      membershipLevel: user.membership_level,
      type: 'user'
    });

    // 重置限流记录（登录成功）
    await resetRateLimit(clientIP, 'login');

    // 记录登录日志（成功）
    await db.execute(
      `INSERT INTO login_logs (user_id, email, ip_address, user_agent, success)
       VALUES (?, ?, ?, ?, TRUE)`,
      [user.id, email, clientIP, request.headers.get('user-agent') || '']
    );

    // 创建响应并设置HttpOnly Cookie
    const response = successResponse(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          membershipLevel: user.membership_level,
          membershipExpiry: user.membership_expiry
        },
        token
      },
      '登录成功'
    );

    // 设置认证Cookie
    response.headers.set('Set-Cookie', createAuthCookie(token, 'auth_token'));

    return response;

  } catch (error) {
    if (debug) console.error('[登录API] 登录失败:', error);
    await recordAttempt(clientIP, 'login', false);
    return errorResponse('登录失败，请稍后重试', 500);
  }
}
